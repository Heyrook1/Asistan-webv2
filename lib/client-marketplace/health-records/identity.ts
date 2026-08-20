import 'server-only'

import { ensureClientUserPersonLink } from '@/lib/passport/ensure-link'
import type { ClientAuthContext } from '@/lib/client-marketplace/auth'

/**
 * Resolve the ecosystem Person id for an authenticated client session. Returns
 * null when the account has no contact signal yet (no phone/email) and therefore
 * no Person — callers should treat this as an empty passport, not an error.
 */
export async function resolvePersonId(auth: ClientAuthContext): Promise<string | null> {
  const link = await ensureClientUserPersonLink({
    clientUserId: auth.clientUser.id,
    fullName: auth.clientUser.fullName || auth.fullName,
    phone: auth.clientUser.phone,
    email: auth.clientUser.email ?? auth.email,
  })
  return link?.personId ?? null
}
