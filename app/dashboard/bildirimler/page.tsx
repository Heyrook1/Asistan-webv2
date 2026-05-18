import { requireSession } from '@/lib/session'
import { getNotificationsList } from '@/lib/queries'
import { NotificationsBoard } from './notifications-board'

export const dynamic = 'force-dynamic'

export default async function BildirimlerPage() {
  const session = await requireSession()
  const notifications = await getNotificationsList(session.businessId, session.userId)

  return (
    <NotificationsBoard
      notifications={notifications.map((n) => ({
        id: n.id,
        type: n.type,
        title: n.title,
        message: n.message,
        link: n.link,
        isRead: n.isRead,
        createdAt: n.createdAt.toISOString(),
      }))}
    />
  )
}
