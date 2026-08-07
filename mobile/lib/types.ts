export type DiscoveryItem = {
  businessId: string
  businessName: string
  businessSlug: string
  businessAddress: string | null
  businessCity: string | null
  businessLogoUrl: string | null
  businessDistanceKm: number | null
  doctorId: string
  doctorName: string
  specialty: string | null
  ratingAverage: number | null
  reviewCount: number
  serviceCount: number
  nextAvailableAt: string | null
  minPrice: number | null
  maxPrice: number | null
  openNow: boolean
}

export type AvailabilitySlot = {
  startTime: string
  endTime: string
}

export type ClientPassportClinic = {
  businessId: string
  name: string
  slug: string | null
  city: string | null
  patientNumber: string | null
}

export type ClientPassportVisit = {
  id: string
  status: string
  date: string
  startTime: string
  clinic: { id: string; name: string; slug?: string | null }
  doctor: { id: string; fullName: string; specialty: string | null } | null
  service: { id: string; name: string }
  location: { id: string; name: string; address: string | null } | null
}

export type ClientPassportTimelineItem = {
  id: string
  kind: string
  occurredAt: string
  title: string
  subtitle?: string | null
  status?: string | null
  clinicName?: string | null
}

export type ClientPassport = {
  gpiDisplay: string | null
  personLinked: boolean
  fullName: string
  clinics: ClientPassportClinic[]
  visits: ClientPassportVisit[]
  timeline: ClientPassportTimelineItem[]
  honesty: {
    titleTr: string
    disclaimerTr: string
  }
}

