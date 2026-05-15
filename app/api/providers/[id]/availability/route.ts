import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')

    const supabase = await createClient()

    // Get weekly availability
    const { data: availability, error: availabilityError } = await supabase
      .from('calendar_availability')
      .select('*')
      .eq('provider_id', id)
      .eq('is_available', true)
      .order('day_of_week', { ascending: true })
      .order('start_time', { ascending: true })

    if (availabilityError) {
      return NextResponse.json({ error: availabilityError.message }, { status: 500 })
    }

    // If date is provided, also get existing appointments and blocks
    let appointments = []
    let blocks = []

    if (date) {
      const { data: appointmentsData } = await supabase
        .from('appointments')
        .select('start_time, end_time')
        .eq('provider_id', id)
        .eq('appointment_date', date)
        .in('status', ['confirmed', 'pending_provider_approval'])

      appointments = appointmentsData || []

      const { data: blocksData } = await supabase
        .from('calendar_blocks')
        .select('*')
        .eq('provider_id', id)
        .eq('block_date', date)

      blocks = blocksData || []
    }

    return NextResponse.json({
      availability,
      appointments,
      blocks,
    })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
