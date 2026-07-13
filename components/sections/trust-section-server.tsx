import { getPublicTrustStats, getPublicVerifiedReviews } from '@/lib/trust/public'
import { TrustSection } from '@/components/sections/trust-section'

export async function TrustSectionServer() {
  const [stats, reviews] = await Promise.all([getPublicTrustStats(), getPublicVerifiedReviews(6)])
  return <TrustSection stats={stats} reviews={reviews} />
}
