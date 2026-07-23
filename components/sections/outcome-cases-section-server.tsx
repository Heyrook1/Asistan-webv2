import { OutcomeCasesSection } from '@/components/sections/outcome-cases-section'
import { getPlatformOutcomeSnapshot } from '@/lib/trust/platform-outcomes'

export async function OutcomeCasesSectionServer({
  showDetailCta = true,
}: {
  showDetailCta?: boolean
} = {}) {
  const live = await getPlatformOutcomeSnapshot()
  return <OutcomeCasesSection live={live} showDetailCta={showDetailCta} />
}
