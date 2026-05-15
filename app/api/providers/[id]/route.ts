import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('providers')
      .select(`
        *,
        user:users(full_name, avatar_url),
        category:categories(name, name_tr),
        specialty:specialties(name, name_tr)
      `)
      .eq('id', id)
      .eq('is_active', true)
      .single()

    if (error) {
      return NextResponse.json({ error: 'Provider not found' }, { status: 404 })
    }

    return NextResponse.json({ provider: data })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
