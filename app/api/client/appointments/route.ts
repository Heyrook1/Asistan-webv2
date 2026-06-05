import { NextResponse, type NextRequest } from 'next/server'
import { requireClientAuth } from '@/lib/client-marketplace/auth'
import { listClientAppointments } from '@/lib/client-marketplace/appointments'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const auth = await requireClientAuth(request)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const appointments = await listClientAppointments(auth.clientUser.id)
  return NextResponse.json({ appointments })
}

