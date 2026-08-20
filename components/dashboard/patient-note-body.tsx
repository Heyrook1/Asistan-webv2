'use client'

import { Badge } from '@/components/ui/badge'
import {
  isSoapFormattedNote,
  parseSoapNoteBody,
  SOAP_SECTION_LABELS,
} from '@/lib/clinical-notes/soap'

export function PatientNoteBody({ note }: { note: string }) {
  if (!isSoapFormattedNote(note)) {
    return <p className="mt-1 text-sm whitespace-pre-line text-brand-ink">{note}</p>
  }

  const sections = parseSoapNoteBody(note)
  if (!sections) {
    return <p className="mt-1 text-sm whitespace-pre-line text-brand-ink">{note}</p>
  }

  const rows: Array<{ key: keyof typeof sections; label: string }> = [
    { key: 'subjective', label: SOAP_SECTION_LABELS.subjective },
    { key: 'objective', label: SOAP_SECTION_LABELS.objective },
    { key: 'assessment', label: SOAP_SECTION_LABELS.assessment },
    { key: 'plan', label: SOAP_SECTION_LABELS.plan },
  ]

  return (
    <div className="mt-2 space-y-2.5">
      {rows.map(({ key, label }) => (
        <div key={key} className="rounded-lg bg-dashboard-surface px-3 py-2">
          <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="mt-1 text-sm whitespace-pre-line text-brand-ink">
            {sections[key].trim() || '—'}
          </p>
        </div>
      ))}
    </div>
  )
}

export function SoapNoteBadge({ note }: { note: string }) {
  if (!isSoapFormattedNote(note)) return null
  return (
    <Badge variant="outline" className="border-brand-teal/30 bg-brand-teal/5 text-[10px] text-brand-teal">
      SOAP
    </Badge>
  )
}
