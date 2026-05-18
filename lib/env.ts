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
    POSTGRES_PRISMA_URL: optionalConnectionString,
    POSTGRES_URL: optionalConnectionString,
    POSTGRES_URL_NON_POOLING: optionalConnectionString,
    NEXT_PUBLIC_SUPABASE_URL: optionalUrl,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: optionalSecret,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: optionalSecret,
    SUPABASE_URL: optionalUrl,
    SUPABASE_ANON_KEY: optionalSecret,
    SUPABASE_PUBLISHABLE_KEY: optionalSecret,
    EMAIL_PROVIDER_WEBHOOK_URL: optionalUrl,
    SMS_PROVIDER_WEBHOOK_URL: optionalUrl,
    WHATSAPP_PROVIDER_WEBHOOK_URL: optionalUrl,
    NOTIFICATION_PROVIDER_TOKEN: optionalSecret,
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
  directUrl: parsed.data.DIRECT_URL ?? parsed.data.POSTGRES_URL_NON_POOLING,
  supabaseUrl: parsed.data.NEXT_PUBLIC_SUPABASE_URL ?? parsed.data.SUPABASE_URL!,
  supabaseAnonKey:
    parsed.data.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    parsed.data.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    parsed.data.SUPABASE_ANON_KEY ??
    parsed.data.SUPABASE_PUBLISHABLE_KEY!,
}
