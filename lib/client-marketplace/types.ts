export type AvailabilitySlot = {
  startTime: string
  endTime: string
}

export type ClientDiscoveryFilters = {
  query?: string
  specialty?: string
  serviceId?: string
  maxDistanceKm?: number
  minRating?: number
  availableToday?: boolean
  minPrice?: number
  maxPrice?: number
  city?: string
}

export type ClientDiscoverySort =
  | 'nearest'
  | 'highest-rated'
  | 'earliest-available'
  | 'most-reviewed'

export type ClientDiscoveryItem = {
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

