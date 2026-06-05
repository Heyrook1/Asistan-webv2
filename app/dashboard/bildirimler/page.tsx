import { requireSession } from '@/lib/session'
import { getNotificationsList, serializeNotification } from '@/lib/queries'
import { NotificationsBoard } from './notifications-board'

export const dynamic = 'force-dynamic'

export default async function BildirimlerPage() {
  const session = await requireSession()
  const notifications = await getNotificationsList(session.businessId, session.userId, 200)

  return (
    <NotificationsBoard
      businessId={session.businessId}
      userId={session.userId}
      notifications={notifications.map(serializeNotification)}
    />
  )
}
