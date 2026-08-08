import 'server-only'

import { Prisma } from '@prisma/client'

import {
  canonicalizeFullName,
  generateGpiDisplay,
  hashIdentityDocument,
  normalizeEmail,
  normalizePhoneE164,
  scoreIdentityMatch,
  shouldAutoLinkPerson,
  shouldSuggestPersonMatch,
  type IdentitySignals,
} from '@/lib/identity/normalize'
import { runWithTenantBypassAsync } from '@/lib/security/tenant-guard'

function isUniqueViolation(error: unknown): error is Prisma.PrismaClientKnownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002'
}

function uniqueTargetFields(error: Prisma.PrismaClientKnownRequestError): string[] {
  const target = error.meta?.target
  if (Array.isArray(target)) return target.map(String)
  if (typeof target === 'string') return [target]
  return []
}

async function safeResetRole(tx: Prisma.TransactionClient) {
  try {
    await tx.$executeRawUnsafe(`RESET ROLE`)
  } catch {
    // Aborted transaction (e.g. prior unique violation) — RESET is ignored.
  }
}

export class IdentityPepperMissingError extends Error {
  constructor() {
    super('PERSON_IDENTITY_PEPPER (≥16 chars) is required in production')
    this.name = 'IdentityPepperMissingError'
  }
}

function identityPepper(): string {
  const pepper = process.env.PERSON_IDENTITY_PEPPER?.trim()
  if (pepper && pepper.length >= 16) return pepper

  if (process.env.NODE_ENV === 'production') {
    throw new IdentityPepperMissingError()
  }

  // Dev/test only — never derive from service-role or DATABASE_URL (predictable).
  return 'asistan-dev-identity-pepper-local-only'
}

export function isIdentityPepperConfigured(): boolean {
  const pepper = process.env.PERSON_IDENTITY_PEPPER?.trim()
  return Boolean(pepper && pepper.length >= 16)
}

export type ResolvePersonInput = {
  fullName: string
  phone: string
  email?: string | null
  identityNumber?: string | null
  birthDate?: Date | string | null
}

/** Exported for unit tests — guest book must not require pepper without national ID. */
export function buildIdentitySignals(input: ResolvePersonInput): IdentitySignals {
  return toSignals(input)
}

function toSignals(input: ResolvePersonInput): IdentitySignals {
  const birth =
    input.birthDate instanceof Date
      ? input.birthDate.toISOString().slice(0, 10)
      : typeof input.birthDate === 'string' && input.birthDate
        ? input.birthDate.slice(0, 10)
        : null

  // Guest book / phone-only resolve must not require PERSON_IDENTITY_PEPPER.
  // Pepper is only needed when hashing a national ID / passport.
  const identityHash = input.identityNumber?.trim()
    ? hashIdentityDocument(input.identityNumber, identityPepper())
    : null

  return {
    phoneE164: normalizePhoneE164(input.phone),
    emailNorm: normalizeEmail(input.email),
    identityHash,
    fullNameCanon: canonicalizeFullName(input.fullName),
    birthDateIso: birth,
  }
}

function birthDateValue(input: ResolvePersonInput): Date | null {
  if (!input.birthDate) return null
  if (input.birthDate instanceof Date) return input.birthDate
  const d = new Date(input.birthDate)
  return Number.isNaN(d.getTime()) ? null : d
}

/**
 * Resolve or create ecosystem Person inside a transaction.
 * Prefer exact phone / email / identityHash matches (cross-clinic GPI).
 * Runs under tenant-guard bypass — Person is ecosystem-scoped (no businessId).
 */
export async function resolveOrCreatePerson(
  tx: Prisma.TransactionClient,
  input: ResolvePersonInput,
): Promise<{ personId: string; gpiDisplay: string; created: boolean }> {
  return runWithTenantBypassAsync('identity:resolve', async () => {
    // Person tables deny asistan_app — elevate, then RESET so Patient DML works again.
    await tx.$executeRawUnsafe(`SET LOCAL ROLE asistan_identity`)
    try {
      const signals = toSignals(input)
      const or: Prisma.PersonWhereInput[] = []
      if (signals.phoneE164) or.push({ phoneE164: signals.phoneE164 })
      if (signals.emailNorm) or.push({ emailNorm: signals.emailNorm })
      if (signals.identityHash) or.push({ identityHash: signals.identityHash })

      const candidates =
        or.length > 0
          ? await tx.person.findMany({
              where: { deletedAt: null, OR: or },
              take: 8,
            })
          : []

      let best: (typeof candidates)[number] | null = null
      let bestScore = 0
      for (const row of candidates) {
        const candidateSignals: IdentitySignals = {
          phoneE164: row.phoneE164,
          emailNorm: row.emailNorm,
          identityHash: row.identityHash,
          fullNameCanon: row.fullNameCanon,
          birthDateIso: row.birthDate ? row.birthDate.toISOString().slice(0, 10) : null,
        }
        const score = scoreIdentityMatch(signals, candidateSignals)
        if (shouldAutoLinkPerson(score) && score.total >= bestScore) {
          best = row
          bestScore = score.total
        }
      }

      if (best) {
        await tx.person.update({
          where: { id: best.id },
          data: {
            fullNameCanon: signals.fullNameCanon || best.fullNameCanon,
            phoneE164: signals.phoneE164 ?? best.phoneE164,
            emailNorm: signals.emailNorm ?? best.emailNorm,
            identityHash: signals.identityHash ?? best.identityHash,
            birthDate: birthDateValue(input) ?? best.birthDate,
          },
        })
        return { personId: best.id, gpiDisplay: best.gpiDisplay, created: false }
      }

      // S4: phone/email-only must NOT silent-merge — but those columns are UNIQUE.
      // Omit colliding uniques on create; queue PersonIdentityMatch for staff review.
      const phoneTaken = Boolean(
        signals.phoneE164 && candidates.some((c) => c.phoneE164 === signals.phoneE164),
      )
      const emailTaken = Boolean(
        signals.emailNorm && candidates.some((c) => c.emailNorm === signals.emailNorm),
      )
      const identityTaken = Boolean(
        signals.identityHash && candidates.some((c) => c.identityHash === signals.identityHash),
      )

      let gpiDisplay = generateGpiDisplay()
      for (let i = 0; i < 5; i++) {
        const clash = await tx.person.findUnique({ where: { gpiDisplay }, select: { id: true } })
        if (!clash) break
        gpiDisplay = generateGpiDisplay()
      }

      const createData = {
        gpiDisplay,
        phoneE164: phoneTaken ? null : signals.phoneE164,
        emailNorm: emailTaken ? null : signals.emailNorm,
        identityHash: identityTaken ? null : signals.identityHash,
        birthDate: birthDateValue(input),
        fullNameCanon: signals.fullNameCanon || canonicalizeFullName(input.fullName),
      }

      let created: { id: string; gpiDisplay: string }
      await tx.$executeRawUnsafe(`SAVEPOINT person_create`)
      try {
        created = await tx.person.create({
          data: createData,
          select: { id: true, gpiDisplay: true },
        })
        await tx.$executeRawUnsafe(`RELEASE SAVEPOINT person_create`)
      } catch (error) {
        await tx.$executeRawUnsafe(`ROLLBACK TO SAVEPOINT person_create`)
        if (!isUniqueViolation(error)) throw error

        const fields = uniqueTargetFields(error)
        if (fields.includes('gpiDisplay')) {
          createData.gpiDisplay = generateGpiDisplay()
        }
        if (fields.includes('phoneE164')) createData.phoneE164 = null
        if (fields.includes('emailNorm')) createData.emailNorm = null
        if (fields.includes('identityHash')) createData.identityHash = null
        // Unknown unique target — still avoid reusing the same GPI.
        if (fields.length === 0) createData.gpiDisplay = generateGpiDisplay()

        await tx.$executeRawUnsafe(`SAVEPOINT person_create_retry`)
        try {
          created = await tx.person.create({
            data: createData,
            select: { id: true, gpiDisplay: true },
          })
          await tx.$executeRawUnsafe(`RELEASE SAVEPOINT person_create_retry`)
        } catch (retryError) {
          await tx.$executeRawUnsafe(`ROLLBACK TO SAVEPOINT person_create_retry`)
          throw retryError
        }
      }

      for (const row of candidates) {
        const candidateSignals: IdentitySignals = {
          phoneE164: row.phoneE164,
          emailNorm: row.emailNorm,
          identityHash: row.identityHash,
          fullNameCanon: row.fullNameCanon,
          birthDateIso: row.birthDate ? row.birthDate.toISOString().slice(0, 10) : null,
        }
        const score = scoreIdentityMatch(signals, candidateSignals)
        if (!shouldSuggestPersonMatch(score)) continue
        const leftPersonId = created.id < row.id ? created.id : row.id
        const rightPersonId = created.id < row.id ? row.id : created.id
        const existing = await tx.personIdentityMatch.findFirst({
          where: { leftPersonId, rightPersonId, decidedAt: null },
          select: { id: true },
        })
        if (existing) continue
        await tx.personIdentityMatch.create({
          data: {
            leftPersonId,
            rightPersonId,
            score: score.total,
            method: 'suggest:weak-signal',
          },
        })
      }

      return { personId: created.id, gpiDisplay: created.gpiDisplay, created: true }
    } finally {
      await safeResetRole(tx)
    }
  })
}

/** Ensure clinic Patient chart is linked to ecosystem Person (tenant-scoped write). */
export async function linkPatientToPerson(
  tx: Prisma.TransactionClient,
  patientId: string,
  personId: string,
  businessId: string,
) {
  const updated = await tx.patient.updateMany({
    where: { id: patientId, businessId },
    data: { personId },
  })
  if (updated.count === 0) {
    throw new Error('Patient not found for business when linking Person')
  }
}
