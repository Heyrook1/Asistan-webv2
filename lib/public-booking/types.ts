export type PublicClinicBookingPayload = {
  id: string
  name: string
  slug: string
  description: string | null
  phone: string | null
  email: string | null
  city: string | null
  address: string | null
  logoUrl: string | null
  primaryColor: string
  currency: string
  locationLat: number | null
  locationLng: number | null
  /** Vendor demo flag — public SEO should noindex. */
  isDemo: boolean
  specialtySummary: string[]
  openingHours: Array<{
    weekday: number
    windows: Array<{ startTime: string; endTime: string }>
  }>
  autoConfirmClientAppointments: boolean
  /** Clinic opt-in: require national ID / passport on guest book (default false). */
  requireGuestIdentity: boolean
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
