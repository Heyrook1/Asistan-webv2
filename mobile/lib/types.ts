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

