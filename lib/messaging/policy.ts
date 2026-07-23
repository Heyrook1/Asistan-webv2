import { isFeatureEnabled } from '@/lib/feature-flags'
import { err, type ActionResult } from '@/lib/actions/result'

/** Staff in-app chat is frozen unless explicitly re-enabled. */
export function isTeamMessagingEnabled() {
  return isFeatureEnabled('teamMessaging')
}

export const TEAM_MESSAGING_DISABLED_MESSAGE =
  'Ekip sohbeti kapatıldı. Hasta iletişimi için SMS/WhatsApp bildirim kanallarını kullanın (Bildirimler / randevu onay-hatırlatma).'

export function teamMessagingDisabledResult(): ActionResult<never> {
  return err(TEAM_MESSAGING_DISABLED_MESSAGE)
}
