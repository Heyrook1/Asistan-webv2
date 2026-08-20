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
import { identityPrisma, isIdentityPrismaDistinct } from '@/lib/prisma-owner'
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

async function personResolveOnTx(
  tx: Prisma.TransactionClient,
  input: ResolvePersonInput,
): Promise<{ personId: string; gpiDisplay: string; created: boolean }> {
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
    const bestId = best.id
    const bestGpi = best.gpiDisplay

    // Only claim a unique signal for `best` if no OTHER matched person already owns it.
    // Otherwise the update collides (P2002 on identityHash/phoneE164/emailNorm) and
    // aborts the whole booking transaction. The conflicting person surfaces via the
    // weak-signal PersonIdentityMatch suggestion path instead of a hard merge here.
    const ownedByOther = (
      field: 'phoneE164' | 'emailNorm' | 'identityHash',
      value: string | null,
    ) => Boolean(value && candidates.some((c) => c.id !== bestId && c[field] === value))

    const nextPhone = ownedByOther('phoneE164', signals.phoneE164)
      ? best.phoneE164
      : signals.phoneE164 ?? best.phoneE164
    const nextEmail = ownedByOther('emailNorm', signals.emailNorm)
      ? best.emailNorm
      : signals.emailNorm ?? best.emailNorm
    const nextIdentity = ownedByOther('identityHash', signals.identityHash)
      ? best.identityHash
      : signals.identityHash ?? best.identityHash

    const nextName = signals.fullNameCanon || best.fullNameCanon
    const nextBirth = birthDateValue(input) ?? best.birthDate

    // SAVEPOINT retry defends against unique holders outside the take:8 candidate
    // window or a concurrent insert — drop the offending field, keep best's value.
    await tx.$executeRawUnsafe(`SAVEPOINT person_update`)
    try {
      await tx.person.update({
        where: { id: bestId },
        data: {
          fullNameCanon: nextName,
          phoneE164: nextPhone,
          emailNorm: nextEmail,
          identityHash: nextIdentity,
          birthDate: nextBirth,
        },
      })
      await tx.$executeRawUnsafe(`RELEASE SAVEPOINT person_update`)
    } catch (error) {
      await tx.$executeRawUnsafe(`ROLLBACK TO SAVEPOINT person_update`)
      if (!isUniqueViolation(error)) throw error
      const fields = uniqueTargetFields(error)
      await tx.person.update({
        where: { id: bestId },
        data: {
          fullNameCanon: nextName,
          phoneE164: fields.includes('phoneE164') ? best.phoneE164 : nextPhone,
          emailNorm: fields.includes('emailNorm') ? best.emailNorm : nextEmail,
          identityHash: fields.includes('identityHash') ? best.identityHash : nextIdentity,
          birthDate: nextBirth,
        },
      })
    }

    return { personId: bestId, gpiDisplay: bestGpi, created: false }
  }

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
}

/**
 * Resolve or create ecosystem Person.
 * Prefer owner/migrate Prisma when distinct from asistan_app (SET ROLE often broken
 * on pooler). Fall back to SET LOCAL ROLE asistan_identity on the booking tx.
 */
export async function resolveOrCreatePerson(
  tx: Prisma.TransactionClient,
  input: ResolvePersonInput,
): Promise<{ personId: string; gpiDisplay: string; created: boolean }> {
  return runWithTenantBypassAsync('identity:resolve', async () => {
    if (isIdentityPrismaDistinct()) {
      return identityPrisma().$transaction((idTx) => personResolveOnTx(idTx, input))
    }

    await tx.$executeRawUnsafe(`SET LOCAL ROLE asistan_identity`)
    try {
      return await personResolveOnTx(tx, input)
    } finally {
      await safeResetRole(tx)
    }
  })
}

/**
 * Resolve or create ecosystem Person in its OWN transaction (no caller tx reused).
 *
 * Required before a Serializable booking transaction: when identity Prisma is distinct,
 * the Person is committed on a separate owner connection. A Serializable tx started
 * earlier cannot see that row, so linking `Patient.personId` inside it fails the FK
 * check. Committing the Person first makes it visible to the booking snapshot.
 */
export async function resolveOrCreatePersonStandalone(
  input: ResolvePersonInput,
): Promise<{ personId: string; gpiDisplay: string; created: boolean }> {
  return runWithTenantBypassAsync('identity:resolve', async () => {
    // identityPrisma() === owner client when distinct, otherwise the app client.
    if (isIdentityPrismaDistinct()) {
      return identityPrisma().$transaction((idTx) => personResolveOnTx(idTx, input))
    }

    return identityPrisma().$transaction(async (idTx) => {
      await idTx.$executeRawUnsafe(`SET LOCAL ROLE asistan_identity`)
      try {
        return await personResolveOnTx(idTx, input)
      } finally {
        await safeResetRole(idTx)
      }
    })
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
