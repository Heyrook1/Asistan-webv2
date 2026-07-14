/**
 * Regional hub model — KKTC-first, international later.
 *
 * Live SEO/canonical host today: kktc.asistan.online (intentional lock).
 * Do not promote a second content/SEO cluster until openInternationalGate()
 * checklist items are true. See docs/regional-hubs.md.
 */

export type HubStatus = 'live' | 'planned' | 'apex-reserve'

export type RegionalHubId = 'kktc' | 'apex' | 'tr' | 'cy'

export type RegionalHub = {
  id: RegionalHubId
  /** Hostname without protocol */
  host: string
  status: HubStatus
  /** Default content locale when hub goes live */
  localeDefault: 'tr' | 'en' | 'el'
  market: { tr: string; en: string }
  /** What this host is allowed to own in SEO */
  seoRole: 'canonical-production' | 'company-apex' | 'future-regional'
}

export const REGIONAL_HUBS: Record<RegionalHubId, RegionalHub> = {
  kktc: {
    id: 'kktc',
    host: 'kktc.asistan.online',
    status: 'live',
    localeDefault: 'tr',
    market: {
      tr: 'Kuzey Kıbrıs (KKTC)',
      en: 'Northern Cyprus (TRNC)',
    },
    seoRole: 'canonical-production',
  },
  apex: {
    id: 'apex',
    host: 'asistan.online',
    status: 'apex-reserve',
    localeDefault: 'en',
    market: {
      tr: 'Şirket / yönlendirme apex',
      en: 'Company / routing apex',
    },
    seoRole: 'company-apex',
  },
  tr: {
    id: 'tr',
    host: 'tr.asistan.online',
    status: 'planned',
    localeDefault: 'tr',
    market: {
      tr: 'Türkiye (anakara)',
      en: 'Türkiye (mainland)',
    },
    seoRole: 'future-regional',
  },
  cy: {
    id: 'cy',
    host: 'cy.asistan.online',
    status: 'planned',
    localeDefault: 'en',
    market: {
      tr: 'Kıbrıs Cumhuriyeti / EN-EL yüzey',
      en: 'Republic of Cyprus / EN–EL surface',
    },
    seoRole: 'future-regional',
  },
} as const

/** The only hub that may own production sitemap + metadataBase today */
export const LIVE_HUB_ID: RegionalHubId = 'kktc'

export function getLiveHub(): RegionalHub {
  return REGIONAL_HUBS[LIVE_HUB_ID]
}

export function liveSiteOrigin(): string {
  return `https://${getLiveHub().host}`
}

export function plannedHubs(): RegionalHub[] {
  return Object.values(REGIONAL_HUBS).filter((h) => h.status === 'planned')
}

/**
 * International open gate — all must be true before launching a second SEO hub.
 * Kept as explicit checklist in code so roadmap stays honest.
 */
export const INTERNATIONAL_GATE = {
  paletteAndMasterbrand: true,
  claimBankAndLegalReview: true,
  /** Need 10+ verified clinic references / cases */
  verifiedClinicProofs: false,
  /** Dedicated EN marketing surface beyond auth lang switch */
  enMarketingSurface: false,
  /** Clear self-serve or invoice story for non-KKTC */
  billingStoryForNewMarket: false,
  /** Do not soft-launch by pointing apex at the same TR-KKTC copy */
  avoidApexDuplicateCluster: true,
} as const

export function openInternationalGate(): boolean {
  return Object.values(INTERNATIONAL_GATE).every(Boolean)
}

/** Hostnames that must not appear as alternate canonicals until gate opens */
export function reservedSeoHosts(): string[] {
  return Object.values(REGIONAL_HUBS)
    .filter((h) => h.id !== LIVE_HUB_ID)
    .map((h) => h.host)
}
