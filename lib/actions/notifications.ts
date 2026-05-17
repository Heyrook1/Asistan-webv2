'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { ok, err, type ActionResult } from './result'

const sendNotificationSchema = z.object({
  recipient_user_id: z.string().uuid().optional(),
  recipient_phone: z.string().optional(),
  channel: z.enum(['app', 'sms', 'email', 'whatsapp']).default('app'),
  title: z.string().trim().min(2).max(120),
  message: z.string().trim().min(2).max(1000),
})

export type SendNotificationInput = z.infer<typeof sendNotificationSchema>

export async function sendNotification(
  rawInput: unknown
): Promise<ActionResult<{ id: string }>> {
  const parsed = sendNotificationSchema.safeParse(rawInput)
  if (!parsed.success) return err('Form bilgileri hatalı', parsed.error.issues)
  const input = parsed.data

  if (!input.recipient_user_id && !input.recipient_phone) {
    return err('Alıcı belirtilmeli')
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return err('Oturum gerekli')

  // Resolve recipient user_id from phone if needed
  let recipientUserId = input.recipient_user_id || null
  if (!recipientUserId && input.recipient_phone) {
    const { data: foundUser } = await supabase
      .from('users')
      .select('id')
      .eq('phone', input.recipient_phone)
      .maybeSingle()
    recipientUserId = foundUser?.id ?? null
  }

  if (!recipientUserId) {
    return err('Alıcı bulunamadı (telefon ile kayıtlı kullanıcı yok)')
  }

  const { data: notification, error: insertError } = await supabase
    .from('notifications')
    .insert({
      user_id: recipientUserId,
      type: 'system',
      title: input.title,
      message: input.message,
      data: { channel: input.channel, sent_by: user.id },
      is_read: false,
    })
    .select('id')
    .single()

  if (insertError || !notification) {
    return err(insertError?.message || 'Bildirim oluşturulamadı')
  }

  // Note: actual SMS/email delivery would be triggered here via edge function
  // For now we only create the in-app notification row.

  revalidatePath('/dashboard/bildirimler')
  return ok({ id: notification.id })
}
