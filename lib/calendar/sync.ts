import 'server-only'

import { CalendarProvider, UnavailableBlockSource } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { CALENDAR_SYNC_DAYS_AHEAD } from '@/lib/calendar/config'
import { splitBusyIntervalToLocalBlocks } from '@/lib/calendar/busy-blocks'
import {
  fetchGoogleFreeBusy,
  packTokens,
  refreshGoogleAccessToken,
  unpackTokens,
} from '@/lib/calendar/google-oauth'
import { runWithTenantBypassAsync } from '@/lib/security/tenant-guard'

export type SyncConnectionResult = {
  connectionId: string
  staffId: string
  importedBlocks: number
  ok: boolean
  error?: string
}

async function getValidAccessToken(connection: {
  id: string
  accessTokenEncrypted: string
  refreshTokenEncrypted: string
  tokenExpiresAt: Date | null
}) {
  const tokens = unpackTokens(connection)
  const expiresSoon =
    connection.tokenExpiresAt != null &&
    connection.tokenExpiresAt.getTime() < Date.now() + 60_000

  if (!expiresSoon) {
    return tokens.accessToken
  }

  const refreshed = await refreshGoogleAccessToken(tokens.refreshToken)
  const expiresAt =
    typeof refreshed.expires_in === 'number'
      ? new Date(Date.now() + refreshed.expires_in * 1000)
      : null

  const packed = packTokens({
    accessToken: refreshed.access_token,
    refreshToken: refreshed.refresh_token || tokens.refreshToken,
    expiresAt,
  })

  await prisma.calendarConnection.update({
    where: { id: connection.id },
    data: {
      accessTokenEncrypted: packed.accessTokenEncrypted,
      refreshTokenEncrypted: packed.refreshTokenEncrypted,
      tokenExpiresAt: packed.tokenExpiresAt,
    },
  })

  return refreshed.access_token
}

export async function syncGoogleCalendarConnection(connectionId: string): Promise<SyncConnectionResult> {
  // Connection is addressed by id (caller or cron already authorized). Bypass for the
  // initial lookup; subsequent writes still include businessId when available.
  return runWithTenantBypassAsync(`calendar:sync-connection:${connectionId}`, async () => {
    const connection = await prisma.calendarConnection.findFirst({
      where: {
        id: connectionId,
        provider: CalendarProvider.GOOGLE,
        deletedAt: null,
        syncEnabled: true,
      },
      include: {
        business: { select: { timezone: true } },
      },
    })

    if (!connection) {
      return { connectionId, staffId: '', importedBlocks: 0, ok: false, error: 'Connection not found' }
    }

    try {
      const accessToken = await getValidAccessToken(connection)
      const timezone = connection.business.timezone || 'Europe/Istanbul'
      const timeMin = new Date()
      const timeMax = new Date()
      timeMax.setUTCDate(timeMax.getUTCDate() + CALENDAR_SYNC_DAYS_AHEAD)

      const busy = await fetchGoogleFreeBusy({
        accessToken,
        calendarId: connection.calendarId || 'primary',
        timeMin: timeMin.toISOString(),
        timeMax: timeMax.toISOString(),
      })

      const localBlocks = busy.flatMap((slot) =>
        splitBusyIntervalToLocalBlocks({
          startIso: slot.start,
          endIso: slot.end,
          timezone,
        })
      )

      const now = new Date()
      const windowStart = new Date(timeMin.toISOString().slice(0, 10))
      const windowEnd = new Date(timeMax.toISOString().slice(0, 10))

      // Soft-delete previous imports in window (partial unique allows recreate after deletedAt set).
      await prisma.$transaction(async (tx) => {
        await tx.teamMemberUnavailableBlock.updateMany({
          where: {
            businessId: connection.businessId,
            calendarConnectionId: connection.id,
            source: UnavailableBlockSource.GOOGLE_CALENDAR,
            deletedAt: null,
            date: { gte: windowStart, lte: windowEnd },
          },
          data: { deletedAt: now },
        })

        if (localBlocks.length > 0) {
          await tx.teamMemberUnavailableBlock.createMany({
            data: localBlocks.map((block) => ({
              businessId: connection.businessId,
              staffId: connection.staffId,
              date: new Date(block.date),
              startTime: block.startTime,
              endTime: block.endTime,
              reason: 'Google Calendar (meşgul)',
              source: UnavailableBlockSource.GOOGLE_CALENDAR,
              externalEventId: block.externalEventId,
              calendarConnectionId: connection.id,
              syncedAt: now,
            })),
          })
        }

        await tx.calendarConnection.update({
          where: { id: connection.id },
          data: {
            lastSyncAt: now,
            lastError: null,
          },
        })
      })

      return {
        connectionId: connection.id,
        staffId: connection.staffId,
        importedBlocks: localBlocks.length,
        ok: true,
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sync failed'
      await prisma.calendarConnection.update({
        where: { id: connection.id },
        data: { lastError: message.slice(0, 500) },
      })
      return {
        connectionId: connection.id,
        staffId: connection.staffId,
        importedBlocks: 0,
        ok: false,
        error: message,
      }
    }
  })
}

export async function syncAllGoogleCalendarConnections() {
  return runWithTenantBypassAsync('cron:google-calendar-sync', async () => {
    const connections = await prisma.calendarConnection.findMany({
      where: {
        provider: CalendarProvider.GOOGLE,
        syncEnabled: true,
        deletedAt: null,
      },
      select: { id: true },
      take: 200,
    })

    const results: SyncConnectionResult[] = []
    for (const row of connections) {
      results.push(await syncGoogleCalendarConnection(row.id))
    }

    return {
      total: results.length,
      succeeded: results.filter((r) => r.ok).length,
      failed: results.filter((r) => !r.ok).length,
      results,
    }
  })
}

export async function disconnectGoogleCalendar(connectionId: string, businessId: string) {
  const existing = await prisma.calendarConnection.findFirst({
    where: { id: connectionId, businessId },
    select: { id: true },
  })
  if (!existing) return

  // Soft-delete (middleware) clears tokens; deleteMany accepts businessId scope.
  await prisma.calendarConnection.deleteMany({ where: { id: connectionId, businessId } })
}
