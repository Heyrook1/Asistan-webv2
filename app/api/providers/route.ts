import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const city = searchParams.get('city')
    const search = searchParams.get('search')

    const supabase = await createClient()

    let query = supabase
      .from('providers')
      .select(`
        *,
        user:users(full_name, avatar_url),
        category:categories(name, name_tr),
        specialty:specialties(name, name_tr)
      `)
      .eq('is_active', true)
      .eq('is_verified', true)
      .order('average_rating', { ascending: false })

    if (category) {
      query = query.eq('category_id', category)
    }

    if (city) {
      query = query.eq('city', city)
    }

    if (search) {
      query = query.or(`business_name.ilike.%${search}%,business_description.ilike.%${search}%`)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ providers: data })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
