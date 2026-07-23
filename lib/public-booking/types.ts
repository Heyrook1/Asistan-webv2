export type PublicClinicBookingPayload = {
  id: string
  name: string
  slug: string
  description: string | null
  phone: string | null
  city: string | null
  address: string | null
  logoUrl: string | null
  primaryColor: string
  currency: string
  autoConfirmClientAppointments: boolean
  deposit: {
    enabled: boolean
    amount: number | null
  }
  noShowFee: {
    enabled: boolean
    amount: number | null
    note: string | null
  }
  locations: Array<{ id: string; name: string; city: string | null }>
  services: Array<{
    id: string
    name: string
    description: string | null
    durationMin: number
    price: number | null
  }>
  doctors: Array<{
    id: string
    fullName: string
    specialty: string | null
    serviceIds: string[]
  }>
}
