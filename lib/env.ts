import 'server-only'

import { z } from 'zod'

const optionalUrl = z.preprocess(
  (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
  z.string().url().optional()
)

const optionalSecret = z.preprocess(
  (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
  z.string().min(1).optional()
)

const optionalConnectionString = z.preprocess(
  (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
  z.string().min(1).optional()
)

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    DATABASE_URL: optionalConnectionString,
    DIRECT_URL: optionalConnectionString,
    /** Owner / migrate / identity connection (preferred for DDL + asistan_identity ops). */
    DATABASE_URL_MIGRATE: optionalConnectionString,
    POSTGRES_PRISMA_URL: optionalConnectionString,
    POSTGRES_URL: optionalConnectionString,
    POSTGRES_URL_NON_POOLING: optionalConnectionString,
    NEXT_PUBLIC_SUPABASE_URL: optionalUrl,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: optionalSecret,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: optionalSecret,
    SUPABASE_URL: optionalUrl,
    SUPABASE_ANON_KEY: optionalSecret,
    SUPABASE_PUBLISHABLE_KEY: optionalSecret,
    SUPABASE_SERVICE_ROLE_KEY: optionalSecret,
    SUPABASE_SECRET_KEY: optionalSecret,
    EMAIL_PROVIDER_WEBHOOK_URL: optionalUrl,
    SMS_PROVIDER_WEBHOOK_URL: optionalUrl,
    WHATSAPP_PROVIDER_WEBHOOK_URL: optionalUrl,
    /** Meta webhook verify (GET hub.challenge). */
    WHATSAPP_WEBHOOK_VERIFY_TOKEN: optionalSecret,
    /** Meta App Secret — required for `X-Hub-Signature-256` on inbound WA webhooks. */
    WHATSAPP_APP_SECRET: optionalSecret,
    /**
     * Outbound notification webhook auth + inbound WA adapter master secret.
     * Inbound bearer must be clinic-bound (HMAC), never this value alone.
     */
    NOTIFICATION_PROVIDER_TOKEN: optionalSecret,
    /** Optional static per-slug inbound tokens: `slug:token,slug2:token2` or JSON. */
    WHATSAPP_INBOUND_TOKENS: optionalSecret,
    /** Protects `/api/cron/*` — required in every environment (fail-closed). */
    CRON_SECRET: optionalSecret,
    GOOGLE_CALENDAR_CLIENT_ID: optionalSecret,
    GOOGLE_CALENDAR_CLIENT_SECRET: optionalSecret,
    GOOGLE_CALENDAR_REDIRECT_ORIGIN: optionalUrl,
    CALENDAR_TOKEN_ENCRYPTION_KEY: optionalSecret,
    PAYMENT_PROVIDER: optionalSecret,
    STRIPE_SECRET_KEY: optionalSecret,
    STRIPE_WEBHOOK_SECRET: optionalSecret,
    MEMBERSHIP_BANK_INSTRUCTIONS: optionalSecret,
    /** Optional KKTC Maliye e-Fatura API (pilot). */
    KKTC_EFATURA_BASE_URL: optionalUrl,
    KKTC_EFATURA_BEARER_TOKEN: optionalSecret,
    KKTC_EFATURA_VKN: optionalSecret,
    PERSON_IDENTITY_PEPPER: optionalSecret,
    UPSTASH_REDIS_REST_URL: optionalUrl,
    UPSTASH_REDIS_REST_TOKEN: optionalSecret,
    NEXT_PUBLIC_WEB_PUSH_VAPID_PUBLIC_KEY: optionalSecret,
    WEB_PUSH_VAPID_PRIVATE_KEY: optionalSecret,
    WEB_PUSH_CONTACT_EMAIL: optionalSecret,
  })
  .superRefine((env, ctx) => {
    if (!env.DATABASE_URL && !env.POSTGRES_PRISMA_URL && !env.POSTGRES_URL && !env.POSTGRES_URL_NON_POOLING) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['DATABASE_URL'],
        message: 'Database connection URL is required',
      })
    }

    if (!env.NEXT_PUBLIC_SUPABASE_URL && !env.SUPABASE_URL) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['NEXT_PUBLIC_SUPABASE_URL'],
        message: 'Supabase URL is required',
      })
    }

    if (
      !env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      !env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY &&
      !env.SUPABASE_ANON_KEY &&
      !env.SUPABASE_PUBLISHABLE_KEY
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['NEXT_PUBLIC_SUPABASE_ANON_KEY'],
        message: 'Supabase anon/publishable key is required',
      })
    }

    // National-ID hashing must not fall back to service-role / DB URL material in production.
    if (env.NODE_ENV === 'production') {
      const pepper = env.PERSON_IDENTITY_PEPPER?.trim() ?? ''
      if (pepper.length < 16) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['PERSON_IDENTITY_PEPPER'],
          message: 'PERSON_IDENTITY_PEPPER (≥16 chars) is required in production',
        })
      }
    }
  })

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  const message = parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ')
  throw new Error(`Invalid environment configuration: ${message}`)
}

export const env = {
  ...parsed.data,
  databaseUrl:
    parsed.data.DATABASE_URL ??
    parsed.data.POSTGRES_PRISMA_URL ??
    parsed.data.POSTGRES_URL ??
    parsed.data.POSTGRES_URL_NON_POOLING!,
  /** Prefer migrate URL for DDL / identity; falls back to direct then databaseUrl. */
  databaseUrlMigrate:
    parsed.data.DATABASE_URL_MIGRATE ??
    parsed.data.DIRECT_URL ??
    parsed.data.POSTGRES_URL_NON_POOLING ??
    parsed.data.DATABASE_URL ??
    parsed.data.POSTGRES_PRISMA_URL ??
    parsed.data.POSTGRES_URL,
  directUrl: parsed.data.DIRECT_URL ?? parsed.data.POSTGRES_URL_NON_POOLING,
  supabaseUrl: parsed.data.NEXT_PUBLIC_SUPABASE_URL ?? parsed.data.SUPABASE_URL!,
  supabaseAnonKey:
    parsed.data.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    parsed.data.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    parsed.data.SUPABASE_ANON_KEY ??
    parsed.data.SUPABASE_PUBLISHABLE_KEY!,
  supabaseServiceRoleKey: parsed.data.SUPABASE_SERVICE_ROLE_KEY ?? parsed.data.SUPABASE_SECRET_KEY,
  upstashRedisRestUrl: parsed.data.UPSTASH_REDIS_REST_URL,
  upstashRedisRestToken: parsed.data.UPSTASH_REDIS_REST_TOKEN,
  webPushVapidPublic: parsed.data.NEXT_PUBLIC_WEB_PUSH_VAPID_PUBLIC_KEY,
  webPushVapidPrivate: parsed.data.WEB_PUSH_VAPID_PRIVATE_KEY,
  webPushContactEmail: parsed.data.WEB_PUSH_CONTACT_EMAIL,
}
