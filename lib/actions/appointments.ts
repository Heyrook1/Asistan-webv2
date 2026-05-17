'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { ok, err, type ActionResult } from './result'

const createAppointmentSchema = z.object({
  customer_id: z.string().uuid('Geçersiz müşteri'),
  service_id: z.string().uuid('Geçersiz hizmet'),
  appointment_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Tarih yyyy-mm-dd formatında olmalı'),
  start_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Saat hh:mm formatında olmalı'),
  end_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Saat hh:mm formatında olmalı'),
  notes: z.string().max(2000).optional().nullable(),
})

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>

export async function createAppointment(
  rawInput: unknown
): Promise<ActionResult<{ id: string }>> {
  const parsed = createAppointmentSchema.safeParse(rawInput)
  if (!parsed.success) {
    return err('Form bilgileri eksik veya hatalı', parsed.error.issues)
  }
  const input = parsed.data

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return err('Oturum gerekli')

  // Resolve provider through ownership (RLS will also enforce this)
  const { data: provider } = await supabase
    .from('providers')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!provider) return err('İşletme profili bulunamadı')

  // Validate end_time > start_time
  if (input.end_time <= input.start_time) {
    return err('Bitiş saati başlangıç saatinden sonra olmalı')
  }

  // Look up service to capture price snapshot
  const { data: service } = await supabase
    .from('services')
    .select('id, price, currency, duration_minutes')
    .eq('id', input.service_id)
    .eq('provider_id', provider.id)
    .maybeSingle()

  if (!service) return err('Hizmet bulunamadı')

  // Conflict check: no overlapping confirmed/pending appointment same day
  const { data: conflicts } = await supabase
    .from('appointments')
    .select('id')
    .eq('provider_id', provider.id)
    .eq('appointment_date', input.appointment_date)
    .in('status', ['confirmed', 'pending_provider_approval', 'requested'])
    .or(`and(start_time.lt.${input.end_time},end_time.gt.${input.start_time})`)

  if (conflicts && conflicts.length > 0) {
    return err('Bu zaman aralığında çakışan randevu var')
  }

  const { data: inserted, error: insertError } = await supabase
    .from('appointments')
    .insert({
      provider_id: provider.id,
      customer_id: input.customer_id,
      service_id: service.id,
      appointment_date: input.appointment_date,
      start_time: input.start_time,
      end_time: input.end_time,
      status: 'confirmed',
      price: service.price,
      currency: service.currency,
      notes: input.notes || null,
    })
    .select('id')
    .single()

  if (insertError || !inserted) {
    return err(insertError?.message || 'Randevu oluşturulamadı')
  }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/randevular')
  revalidatePath('/dashboard/takvim')

  return ok({ id: inserted.id })
}

// ----------------------------------------------------------------------------
// Cancel appointment
// ----------------------------------------------------------------------------
const cancelSchema = z.object({
  appointment_id: z.string().uuid(),
  reason: z.string().max(500).optional().nullable(),
})

export async function cancelAppointment(rawInput: unknown): Promise<ActionResult> {
  const parsed = cancelSchema.safeParse(rawInput)
  if (!parsed.success) return err('Geçersiz girdi', parsed.error.issues)

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return err('Oturum gerekli')

  const { error: updateError } = await supabase
    .from('appointments')
    .update({
      status: 'cancelled_by_provider',
      cancelled_by: user.id,
      cancellation_reason: parsed.data.reason || null,
    })
    .eq('id', parsed.data.appointment_id)

  if (updateError) return err(updateError.message)

  revalidatePath('/dashboard/randevular')
  return ok(undefined)
}
