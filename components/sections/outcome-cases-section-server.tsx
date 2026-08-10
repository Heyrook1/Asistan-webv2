import { OutcomeCasesSection } from '@/components/sections/outcome-cases-section'
import { listPublicOutcomeCases } from '@/lib/brand/outcome-cases'
import { getPlatformOutcomeSnapshot } from '@/lib/trust/platform-outcomes'

export async function OutcomeCasesSectionServer({
  showDetailCta = true,
}: {
  showDetailCta?: boolean
} = {}) {
  const [live, cases] = await Promise.all([
    getPlatformOutcomeSnapshot(),
    Promise.resolve(listPublicOutcomeCases()),
  ])
  return <OutcomeCasesSection live={live} cases={cases} showDetailCta={showDetailCta} />
}
