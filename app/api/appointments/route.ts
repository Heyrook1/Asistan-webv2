import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const date = searchParams.get('date')

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get customer profile
    const { data: customer } = await supabase
      .from('customers')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!customer) {
      return NextResponse.json({ appointments: [] })
    }

    let query = supabase
      .from('appointments')
      .select(`
        *,
        provider:providers(*, user:users(full_name, avatar_url)),
        service:services(name, duration_minutes)
      `)
      .eq('customer_id', customer.id)
      .order('appointment_date', { ascending: false })
      .order('start_time', { ascending: false })

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    if (date) {
      query = query.eq('appointment_date', date)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ appointments: data })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { provider_id, service_id, appointment_date, start_time, notes } = body

    // Validate required fields
    if (!provider_id || !service_id || !appointment_date || !start_time) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get or create customer profile
    let { data: customer } = await supabase
      .from('customers')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!customer) {
      const { data: newCustomer, error: customerError } = await supabase
        .from('customers')
        .insert({ user_id: user.id })
        .select('id')
        .single()

      if (customerError) {
        return NextResponse.json({ error: 'Failed to create customer profile' }, { status: 500 })
      }

      customer = newCustomer
    }

    // Get service details for price and duration
    const { data: service } = await supabase
      .from('services')
      .select('price, currency, duration_minutes')
      .eq('id', service_id)
      .single()

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    // Calculate end time
    const [hours, minutes] = start_time.split(':').map(Number)
    const endMinutes = hours * 60 + minutes + service.duration_minutes
    const endHours = Math.floor(endMinutes / 60)
    const endMins = endMinutes % 60
    const end_time = `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`

    // Create appointment
    const { data: appointment, error } = await supabase
      .from('appointments')
      .insert({
        provider_id,
        customer_id: customer.id,
        service_id,
        appointment_date,
        start_time,
        end_time,
        price: service.price,
        currency: service.currency,
        customer_notes: notes || null,
        status: 'requested',
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ appointment }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
