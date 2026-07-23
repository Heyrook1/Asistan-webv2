/** Structured SOAP clinical note helpers — template only, no STT/LLM. */

export type SoapSections = {
  subjective: string
  objective: string
  assessment: string
  plan: string
}

export const SOAP_SECTION_LABELS = {
  subjective: 'S (Öznel)',
  objective: 'O (Nesnel)',
  assessment: 'A (Değerlendirme)',
  plan: 'P (Plan)',
} as const

const SECTION_MARKERS: Array<{ key: keyof SoapSections; marker: string }> = [
  { key: 'subjective', marker: 'S (Öznel):' },
  { key: 'objective', marker: 'O (Nesnel):' },
  { key: 'assessment', marker: 'A (Değerlendirme):' },
  { key: 'plan', marker: 'P (Plan):' },
]

export function emptySoapSections(): SoapSections {
  return { subjective: '', objective: '', assessment: '', plan: '' }
}

export function formatSoapNoteBody(sections: SoapSections): string {
  return SECTION_MARKERS.map(({ key, marker }) => {
    const body = sections[key].trim()
    return `${marker}\n${body || '—'}`
  }).join('\n\n')
}

export function soapSectionsHaveContent(sections: SoapSections): boolean {
  return Object.values(sections).some((v) => v.trim().length > 0)
}

/** Detect notes written with our SOAP template markers. */
export function isSoapFormattedNote(note: string): boolean {
  const text = note.trim()
  return (
    text.includes('S (Öznel):') &&
    text.includes('O (Nesnel):') &&
    text.includes('A (Değerlendirme):') &&
    text.includes('P (Plan):')
  )
}

export function parseSoapNoteBody(note: string): SoapSections | null {
  if (!isSoapFormattedNote(note)) return null

  const positions = SECTION_MARKERS.map(({ key, marker }) => {
    const index = note.indexOf(marker)
    return { key, marker, index }
  })
  if (positions.some((p) => p.index < 0)) return null

  positions.sort((a, b) => a.index - b.index)
  const result = emptySoapSections()

  for (let i = 0; i < positions.length; i += 1) {
    const current = positions[i]
    const next = positions[i + 1]
    const start = current.index + current.marker.length
    const end = next ? next.index : note.length
    result[current.key] = note.slice(start, end).trim().replace(/^—$/, '')
  }

  return result
}

export function defaultSoapNoteTitle(date = new Date()): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `SOAP — ${y}-${m}-${d}`
}
