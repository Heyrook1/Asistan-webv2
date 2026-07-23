import { describe, expect, it } from 'vitest'

import {
  defaultSoapNoteTitle,
  formatSoapNoteBody,
  isSoapFormattedNote,
  parseSoapNoteBody,
  soapSectionsHaveContent,
} from '@/lib/clinical-notes/soap'

describe('SOAP note template', () => {
  it('formats and round-trips sections without inventing content', () => {
    const body = formatSoapNoteBody({
      subjective: 'Baş ağrısı 2 gündür',
      objective: 'TA 120/80',
      assessment: 'Gerilim tipi baş ağrısı',
      plan: 'Parasetamol PRN; kontrol 1 hafta',
    })

    expect(isSoapFormattedNote(body)).toBe(true)
    expect(parseSoapNoteBody(body)).toEqual({
      subjective: 'Baş ağrısı 2 gündür',
      objective: 'TA 120/80',
      assessment: 'Gerilim tipi baş ağrısı',
      plan: 'Parasetamol PRN; kontrol 1 hafta',
    })
  })

  it('rejects freeform notes as SOAP', () => {
    expect(isSoapFormattedNote('Rutin kontrol notu')).toBe(false)
    expect(parseSoapNoteBody('Rutin kontrol notu')).toBeNull()
  })

  it('requires at least one non-empty section', () => {
    expect(soapSectionsHaveContent({ subjective: '', objective: '', assessment: '', plan: '' })).toBe(
      false
    )
    expect(
      soapSectionsHaveContent({ subjective: 'x', objective: '', assessment: '', plan: '' })
    ).toBe(true)
  })

  it('builds a dated default title', () => {
    expect(defaultSoapNoteTitle(new Date('2026-07-18T12:00:00'))).toBe('SOAP — 2026-07-18')
  })
})
