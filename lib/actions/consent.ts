'use server'

import { z } from 'zod'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { ok, err, type ActionResult } from './result'
import type { ConsentType } from '@/lib/types'

const consentSchema = z.object({
  consent_type: z.enum([
    'terms_of_service',
    'privacy_policy',
    'kvkk_explicit',
    'marketing_emails',
    'marketing_sms',
    'data_sharing_third_party',
    'health_data_processing',
  ]),
  version: z.string().trim().min(1).max(20),
  granted: z.boolean(),
})

export async function recordConsent(rawInput: unknown): Promise<ActionResult> {
  const parsed = consentSchema.safeParse(rawInput)
  if (!parsed.success) return err('Geçersiz girdi', parsed.error.issues)

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return err('Oturum gerekli')

  const hdrs = await headers()
  const ip = hdrs.get('x-forwarded-for')?.split(',')[0]?.trim() || null
  const userAgent = hdrs.get('user-agent') || null

  const { error: insertError } = await supabase.from('user_consents').insert({
    user_id: user.id,
    consent_type: parsed.data.consent_type,
    version: parsed.data.version,
    granted: parsed.data.granted,
    ip_address: ip,
    user_agent: userAgent,
  })

  if (insertError) return err(insertError.message)
  return ok(undefined)
}

export async function requestDataDeletion(reason?: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return err('Oturum gerekli')

  const { error: insertError } = await supabase.from('data_deletion_requests').insert({
    user_id: user.id,
    status: 'pending',
    reason: reason?.slice(0, 1000) || null,
  })

  if (insertError) return err(insertError.message)
  return ok(undefined)
}

export async function hasGrantedConsent(
  consentType: ConsentType
): Promise<boolean> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data } = await supabase
    .from('user_consents')
    .select('granted')
    .eq('user_id', user.id)
    .eq('consent_type', consentType)
    .is('revoked_at', null)
    .order('granted_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  return data?.granted === true
}
