import * as Sentry from '@sentry/nextjs'

/**
 * Next.js instrumentation — loads Sentry for Node and Edge runtimes.
 * Client init remains in sentry.client.config.ts (auto-loaded by @sentry/nextjs).
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config')
  }
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config')
  }
}

export const onRequestError = Sentry.captureRequestError
