import * as Sentry from '@sentry/nextjs'
import { scrubSentryEvent } from './lib/security/sentry-scrub'
import {
  productionReplayOnErrorSampleRate,
  productionTracesSampleRate,
} from './lib/security/sentry-sample'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: productionTracesSampleRate(),
  sendDefaultPii: false,
  beforeSend: scrubSentryEvent,
  beforeSendTransaction: scrubSentryEvent,
  environment: process.env.NODE_ENV,
  release: process.env.NEXT_PUBLIC_APP_VERSION,
  // Healthcare: no background replay; small error-only sample (≤0.2).
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: productionReplayOnErrorSampleRate(),
})
