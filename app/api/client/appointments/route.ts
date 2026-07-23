import { NextResponse, type NextRequest } from 'next/server'
import { apiError } from '@/lib/api-response'
import { requireClientAuth } from '@/lib/client-marketplace/auth'
import { listClientAppointments } from '@/lib/client-marketplace/appointments'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const auth = await requireClientAuth(request)
  if (!auth) {
    return apiError('Unauthorized', 401)
  }

  const appointments = await listClientAppointments(auth.clientUser.id)
  return NextResponse.json({ appointments })
}

