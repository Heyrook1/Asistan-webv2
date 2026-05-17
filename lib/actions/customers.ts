'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { ok, err, type ActionResult } from './result'

// Turkish phone: starts with 0 or +90, 10-11 digits after country code
const phoneSchema = z
  .string()
  .trim()
  .regex(/^(\+?90|0)?5\d{9}$/, 'Geçerli bir telefon numarası giriniz (örn: 05XX XXX XX XX)')

const createCustomerSchema = z.object({
  full_name: z.string().trim().min(2, 'Ad soyad en az 2 karakter olmalı').max(100),
  phone: phoneSchema,
  email: z.string().trim().email('Geçersiz e-posta').optional().or(z.literal('')),
  date_of_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal('')),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
  notes: z.string().max(2000).optional(),
})

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>

function normalizePhone(input: string): string {
  const digits = input.replace(/\D/g, '')
  if (digits.startsWith('90') && digits.length === 12) return digits
  if (digits.startsWith('0') && digits.length === 11) return '9' + digits
  if (digits.length === 10) return '90' + digits
  return digits
}

export async function createCustomer(
  rawInput: unknown
): Promise<ActionResult<{ id: string; user_id: string }>> {
  const parsed = createCustomerSchema.safeParse(rawInput)
  if (!parsed.success) return err('Form bilgileri hatalı', parsed.error.issues)
  const input = parsed.data

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return err('Oturum gerekli')

  // Verify caller has a provider profile
  const { data: provider } = await supabase
    .from('providers')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()
  if (!provider) return err('İşletme profili bulunamadı')

  const phone = normalizePhone(input.phone)
  const email = input.email && input.email.length > 0
    ? input.email
    : `customer-${crypto.randomUUID()}@asistan.local`

  // 1) Create a user row (shadow account for the patient)
  const { data: userRow, error: userError } = await supabase
    .from('users')
    .insert({
      email,
      full_name: input.full_name,
      phone,
      role: 'customer',
      is_active: true,
    })
    .select('id')
    .single()

  if (userError || !userRow) {
    if (userError?.code === '23505') {
      return err('Bu e-posta veya telefon ile kayıtlı hasta var')
    }
    return err(userError?.message || 'Hasta kaydı oluşturulamadı')
  }

  // 2) Create customer profile linked to user
  const { data: customer, error: customerError } = await supabase
    .from('customers')
    .insert({
      user_id: userRow.id,
      date_of_birth: input.date_of_birth || null,
      gender: input.gender || null,
      notes: input.notes || null,
      is_active: true,
    })
    .select('id')
    .single()

  if (customerError || !customer) {
    // Best-effort cleanup
    await supabase.from('users').delete().eq('id', userRow.id)
    return err(customerError?.message || 'Hasta profili oluşturulamadı')
  }

  // 3) Log to activity_logs
  await supabase.rpc('log_activity', {
    p_provider_id: provider.id,
    p_action: 'customer_created',
    p_entity_type: 'customers',
    p_entity_id: customer.id,
    p_details: { full_name: input.full_name, phone_last_4: phone.slice(-4) },
    p_severity: 'info',
  })

  revalidatePath('/dashboard/musteriler')
  return ok({ id: customer.id, user_id: userRow.id })
}
