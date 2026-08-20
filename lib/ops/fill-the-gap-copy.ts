export type FillGapSlotCluster = {
  date: string
  weekdayLabel: string
  doctorId: string
  doctorName: string
  serviceId: string
  serviceName: string
  slotCount: number
  /** Sample start times for copy (e.g. 14:00) */
  sampleTimes: string[]
}

export type FillGapReturningPatient = {
  id: string
  fullName: string
  phone: string | null
  lastVisitDate: string
  lastServiceName: string | null
  lastStaffId: string | null
}

/** Pure copy helper — unit-tested; no invented percentages. */
export function buildFillGapCopy(input: {
  clusters: FillGapSlotCluster[]
  patientCount: number
}): { headline: string | null; detail: string | null; ajandaHref: string } {
  const top = input.clusters[0]
  if (!top) {
    return {
      headline: null,
      detail: null,
      ajandaHref: '/dashboard/ajanda?mode=takvim',
    }
  }

  const timeHint =
    top.sampleTimes.length === 1
      ? top.sampleTimes[0]
      : top.sampleTimes.length > 1
        ? `${top.sampleTimes[0]}–${top.sampleTimes[top.sampleTimes.length - 1]}`
        : null

  const when = timeHint
    ? `${top.weekdayLabel} ${timeHint}`
    : `${top.weekdayLabel} (${top.date})`

  const headline =
    top.slotCount === 1
      ? `${when} saatinde 1 boş slot`
      : `${when} saatinde ${top.slotCount} boş slot`

  const detailParts = [
    `${top.doctorName} · ${top.serviceName}`,
    input.patientCount > 0
      ? `Öneri: son ziyareti olup yakında randevusu olmayan ${input.patientCount} dönen hastaya ulaşın (bekleme listesi proxy).`
      : 'Öneri: bu slotları dönen hastalara veya bekleyen taleplere açın.',
  ]

  return {
    headline,
    detail: detailParts.join(' — '),
    ajandaHref: `/dashboard/ajanda?mode=takvim&date=${top.date}`,
  }
}

/** Filter precomputed clusters for a single calendar day (Ajanda). */
export function clustersForDate(
  clusters: FillGapSlotCluster[],
  dateIso: string
): FillGapSlotCluster[] {
  return clusters.filter((c) => c.date === dateIso)
}
