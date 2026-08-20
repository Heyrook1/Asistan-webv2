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
  doctorAvatarUrl: string | null
  /** True when license / KKTC ID / diploma is on the doctor profile. */
  doctorVerified: boolean
  specialty: string | null
  ratingAverage: number | null
  reviewCount: number
  serviceCount: number
  nextAvailableAt: string | null
  minPrice: number | null
  maxPrice: number | null
  /** Service name that owns `minPrice` — never show bare TL without context. */
  fromPriceServiceName: string | null
  openNow: boolean
  /**
   * Paid/sponsored placement. Always false until sponsorship ships —
   * UI must label sponsored rows when this is true.
   */
  isSponsored: boolean
}

