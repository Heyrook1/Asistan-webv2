'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { ok, err, type ActionResult } from './result'

const createServiceSchema = z.object({
  name: z.string().trim().min(2, 'Hizmet adı en az 2 karakter olmalı').max(120),
  description: z.string().max(2000).optional(),
  duration_minutes: z.coerce.number().int().min(5).max(480),
  price: z.coerce.number().min(0).max(1_000_000),
  currency: z.enum(['TRY', 'USD', 'EUR']).default('TRY'),
})

export type CreateServiceInput = z.infer<typeof createServiceSchema>

export async function createService(
  rawInput: unknown
): Promise<ActionResult<{ id: string }>> {
  const parsed = createServiceSchema.safeParse(rawInput)
  if (!parsed.success) return err('Form bilgileri hatalı', parsed.error.issues)
  const input = parsed.data

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return err('Oturum gerekli')

  const { data: provider } = await supabase
    .from('providers')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()
  if (!provider) return err('İşletme profili bulunamadı')

  const { data: service, error: insertError } = await supabase
    .from('services')
    .insert({
      provider_id: provider.id,
      name: input.name,
      description: input.description || null,
      duration_minutes: input.duration_minutes,
      price: input.price,
      currency: input.currency,
      is_active: true,
    })
    .select('id')
    .single()

  if (insertError || !service) {
    return err(insertError?.message || 'Hizmet oluşturulamadı')
  }

  revalidatePath('/dashboard/hizmetler')
  revalidatePath('/dashboard')
  return ok({ id: service.id })
}

// ----------------------------------------------------------------------------
// Toggle active
// ----------------------------------------------------------------------------
const toggleSchema = z.object({
  service_id: z.string().uuid(),
  is_active: z.boolean(),
})

export async function setServiceActive(rawInput: unknown): Promise<ActionResult> {
  const parsed = toggleSchema.safeParse(rawInput)
  if (!parsed.success) return err('Geçersiz girdi', parsed.error.issues)

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return err('Oturum gerekli')

  const { error: updateError } = await supabase
    .from('services')
    .update({ is_active: parsed.data.is_active })
    .eq('id', parsed.data.service_id)

  if (updateError) return err(updateError.message)
  revalidatePath('/dashboard/hizmetler')
  return ok(undefined)
}
