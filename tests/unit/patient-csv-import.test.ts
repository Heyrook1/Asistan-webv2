import { describe, expect, it } from 'vitest'
import {
  buildPatientImportTemplateCsv,
  flagDuplicatePhonesInCsv,
  mapCsvRowToDraft,
  normalizeImportGender,
  parseImportDate,
  parsePatientCsv,
  phoneMatchCandidates,
  splitCsvLine,
} from '@/lib/patients/csv-import'

describe('patient CSV import helpers', () => {
  it('splits quoted semicolon cells', () => {
    expect(splitCsvLine('Ayşe;"Not; içi";0555', ';')).toEqual(['Ayşe', 'Not; içi', '0555'])
  })

  it('parses TR and ISO birth dates', () => {
    expect(parseImportDate('15.03.1988')).toBe('1988-03-15')
    expect(parseImportDate('15/3/1988')).toBe('1988-03-15')
    expect(parseImportDate('1988-03-15')).toBe('1988-03-15')
    expect(parseImportDate('bad')).toBeUndefined()
  })

  it('normalizes gender aliases', () => {
    expect(normalizeImportGender('kadin')).toBe('Kadın')
    expect(normalizeImportGender('F')).toBe('Kadın')
    expect(normalizeImportGender('erkek')).toBe('Erkek')
    expect(normalizeImportGender('male')).toBe('Erkek')
  })

  it('maps export-style headers and ignores hasta no / yas', () => {
    const csv = [
      'Hasta no;Ad Soyad;Telefon;E-posta;Cinsiyet;Dogum tarihi;Yas;Etiketler',
      'P-1;Ayşe Yılmaz;05551234567;ayse@ornek.com;Kadın;15.03.1988;36;VIP, kronik',
      ';Mehmet Demir;05557654321;;Erkek;01.01.1990;;',
    ].join('\n')

    const parsed = parsePatientCsv(csv)
    expect('error' in parsed).toBe(false)
    if ('error' in parsed) return

    expect(parsed.validCount).toBe(2)
    expect(parsed.rows[0]).toMatchObject({
      ok: true,
      draft: {
        fullName: 'Ayşe Yılmaz',
        phone: '05551234567',
        email: 'ayse@ornek.com',
        gender: 'Kadın',
        birthDate: '1988-03-15',
        tags: ['VIP', 'kronik'],
      },
    })
  })

  it('rejects rows missing phone', () => {
    const { draft, error } = mapCsvRowToDraft(['Ali Veli', ''], ['fullName', 'phone'])
    expect(error).toMatch(/Telefon/)
    expect(draft.fullName).toBe('Ali Veli')
  })

  it('requires ad soyad + telefon headers', () => {
    const parsed = parsePatientCsv('Sehir;Adres\nİstanbul;Cadde')
    expect(parsed).toMatchObject({ error: expect.stringMatching(/Ad Soyad/) })
  })

  it('flags duplicate phones inside the CSV', () => {
    const rows = flagDuplicatePhonesInCsv([
      { row: 2, ok: true, draft: { fullName: 'A', phone: '0555 111 22 33', tags: [] } },
      { row: 3, ok: true, draft: { fullName: 'B', phone: '05551112233', tags: [] } },
    ])
    expect(rows[0].ok).toBe(true)
    expect(rows[1].ok).toBe(false)
    if (!rows[1].ok) expect(rows[1].error).toMatch(/satır 2/)
  })

  it('builds a BOM template with required headers', () => {
    const tpl = buildPatientImportTemplateCsv()
    expect(tpl.startsWith('\uFEFF')).toBe(true)
    expect(tpl).toContain('Ad Soyad;Telefon')
  })

  it('builds phone match candidates for TR mobiles', () => {
    const c = phoneMatchCandidates('05551234567')
    expect(c).toEqual(expect.arrayContaining(['05551234567', '+905551234567', '905551234567']))
  })

  it('accepts comma-delimited Excel exports', () => {
    const csv = 'Ad Soyad,Telefon,E-posta\nZeynep Kaya,05321112233,z@ornek.com\n'
    const parsed = parsePatientCsv(csv)
    expect('error' in parsed).toBe(false)
    if ('error' in parsed) return
    expect(parsed.delimiter).toBe(',')
    expect(parsed.validCount).toBe(1)
  })
})
