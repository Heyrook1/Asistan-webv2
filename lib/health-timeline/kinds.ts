export const HEALTH_TIMELINE_KINDS = [
  'visit',
  'lab',
  'medication',
  'allergy',
  'treatment',
  'note',
  'file',
  'intake',
  'activity',
] as const

export type HealthTimelineKind = (typeof HEALTH_TIMELINE_KINDS)[number]

export const HEALTH_TIMELINE_KIND_LABELS: Record<
  HealthTimelineKind,
  { tr: string; en: string }
> = {
  visit: { tr: 'Randevu', en: 'Visit' },
  lab: { tr: 'Tahlil', en: 'Lab' },
  medication: { tr: 'İlaç', en: 'Medication' },
  allergy: { tr: 'Alerji', en: 'Allergy' },
  treatment: { tr: 'Tedavi', en: 'Treatment' },
  note: { tr: 'Not', en: 'Note' },
  file: { tr: 'Dosya', en: 'File' },
  intake: { tr: 'Anket', en: 'Intake' },
  activity: { tr: 'Aktivite', en: 'Activity' },
}
