import * as Sentry from '@sentry/nextjs'
import { scrubSentryEvent } from './lib/security/sentry-scrub'
import { productionTracesSampleRate } from './lib/security/sentry-sample'

Sentry.init({
  dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: productionTracesSampleRate(),
  sendDefaultPii: false,
  beforeSend: scrubSentryEvent,
  beforeSendTransaction: scrubSentryEvent,
  environment: process.env.NODE_ENV,
  release: process.env.NEXT_PUBLIC_APP_VERSION,
  debug: process.env.SENTRY_DEBUG === '1',
})
