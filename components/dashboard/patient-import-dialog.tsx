'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Download, FileUp, Loader2, Upload } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { importPatientsFromCsv, type PatientImportSummary } from '@/lib/actions/patient-import'
import {
  buildPatientImportTemplateCsv,
  flagDuplicatePhonesInCsv,
  parsePatientCsv,
  PATIENT_IMPORT_MAX_ROWS,
  type PatientImportRowResult,
} from '@/lib/patients/csv-import'
import { cn } from '@/lib/utils'

type PreviewState = {
  fileName: string
  csvText: string
  rows: PatientImportRowResult[]
  validCount: number
  errorCount: number
}

export function PatientImportDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (next: boolean) => void
}) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [pending, startTransition] = useTransition()
  const [preview, setPreview] = useState<PreviewState | null>(null)
  const [summary, setSummary] = useState<PatientImportSummary | null>(null)
  const [skipDuplicates, setSkipDuplicates] = useState(true)

  function reset() {
    setPreview(null)
    setSummary(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  function handleOpenChange(next: boolean) {
    if (!next) reset()
    onOpenChange(next)
  }

  function downloadTemplate() {
    const blob = new Blob([buildPatientImportTemplateCsv()], {
      type: 'text/csv;charset=utf-8;',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'asistan-hasta-sablon.csv'
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Şablon indirildi')
  }

  async function onFileSelected(file: File | null) {
    setSummary(null)
    if (!file) {
      setPreview(null)
      return
    }
    if (!/\.csv$/i.test(file.name) && file.type && !file.type.includes('csv') && !file.type.includes('text')) {
      toast.error('Lütfen .csv dosyası seçin (Excel → Farklı Kaydet → CSV)')
      return
    }
    if (file.size > 2_000_000) {
      toast.error('Dosya 2 MB’dan büyük olamaz')
      return
    }

    const csvText = await file.text()
    const parsed = parsePatientCsv(csvText)
    if ('error' in parsed) {
      setPreview(null)
      toast.error(parsed.error)
      return
    }

    const rows = flagDuplicatePhonesInCsv(parsed.rows)
    const validCount = rows.filter((r) => r.ok).length
    const errorCount = rows.length - validCount
    setPreview({
      fileName: file.name,
      csvText,
      rows,
      validCount,
      errorCount,
    })
  }

  function runImport() {
    if (!preview || preview.validCount === 0) {
      toast.error('İçe aktarılacak geçerli satır yok')
      return
    }

    startTransition(async () => {
      const result = await importPatientsFromCsv({
        csvText: preview.csvText,
        skipDuplicatePhones: skipDuplicates,
      })
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      setSummary(result.data)
      if (result.data.created > 0) {
        toast.success(`${result.data.created} hasta eklendi`)
        router.refresh()
      } else if (result.data.skippedDuplicates > 0) {
        toast.message('Yeni hasta eklenmedi — satırlar mükerrer veya hatalı')
      } else {
        toast.error('Hiçbir satır içe aktarılamadı')
      }
    })
  }

  const previewRows = preview?.rows.slice(0, 40) ?? []

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full max-w-full flex-col overflow-hidden p-0 sm:max-w-xl bg-brand-light"
      >
        <SheetHeader className="border-b bg-white px-5 py-4 text-left">
          <SheetTitle className="text-brand-ink">Hasta CSV içe aktar</SheetTitle>
          <SheetDescription>
            Excel’deki listenizi CSV olarak kaydedin. En fazla {PATIENT_IMPORT_MAX_ROWS} satır.
            Zorunlu sütunlar: Ad Soyad, Telefon.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" className="h-10 gap-2" onClick={downloadTemplate}>
              <Download className="h-4 w-4" />
              Şablon indir
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-10 gap-2"
              onClick={() => inputRef.current?.click()}
              disabled={pending}
            >
              <Upload className="h-4 w-4" />
              CSV seç
            </Button>
            <input
              ref={inputRef}
              type="file"
              accept=".csv,text/csv"
              className="sr-only"
              onChange={(e) => void onFileSelected(e.target.files?.[0] ?? null)}
            />
          </div>

          <label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm text-brand-ink">
            <input
              type="checkbox"
              className="size-4 shrink-0"
              checked={skipDuplicates}
              onChange={(e) => setSkipDuplicates(e.target.checked)}
              disabled={pending}
            />
            <span>
              Klinikte aynı telefona sahip hastaları atla (önerilir — mükerrer kart açılmaz).
            </span>
          </label>

          {preview && (
            <div className="rounded-xl border bg-white p-3 text-sm">
              <div className="flex items-center gap-2 font-medium text-brand-ink">
                <FileUp className="h-4 w-4 text-brand-teal" />
                <span className="truncate">{preview.fileName}</span>
              </div>
              <p className="mt-2 text-muted-foreground">
                {preview.validCount} hazır · {preview.errorCount} sorunlu · {preview.rows.length} satır
              </p>
              <div className="mt-3 max-h-64 overflow-auto rounded-lg border">
                <table className="w-full text-left text-[12px]">
                  <thead className="sticky top-0 bg-dashboard-surface text-muted-foreground">
                    <tr>
                      <th className="px-2 py-1.5 font-medium">Satır</th>
                      <th className="px-2 py-1.5 font-medium">Ad</th>
                      <th className="px-2 py-1.5 font-medium">Durum</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {previewRows.map((row) => (
                      <tr key={row.row}>
                        <td className="px-2 py-1.5 tabular-nums text-muted-foreground">{row.row}</td>
                        <td className="px-2 py-1.5 text-brand-ink">
                          {row.draft?.fullName || '—'}
                        </td>
                        <td
                          className={cn(
                            'px-2 py-1.5',
                            row.ok ? 'text-emerald-700' : 'text-rose-700'
                          )}
                        >
                          {row.ok ? 'Hazır' : row.error}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {preview.rows.length > 40 && (
                <p className="mt-2 text-[11px] text-muted-foreground">
                  Önizlemede ilk 40 satır gösterilir; içe aktarımda tüm geçerli satırlar işlenir.
                </p>
              )}
            </div>
          )}

          {summary && (
            <div className="rounded-xl border border-brand-teal/30 bg-brand-teal/5 p-3 text-sm text-brand-ink">
              <p className="font-medium">Sonuç</p>
              <ul className="mt-2 space-y-1 text-muted-foreground">
                <li>{summary.created} yeni hasta oluşturuldu</li>
                <li>{summary.skippedDuplicates} mükerrer atlandı</li>
                <li>{summary.failed} satır hatalı</li>
              </ul>
              {summary.errors.length > 0 && (
                <ul className="mt-3 max-h-36 space-y-1 overflow-auto text-[12px] text-rose-700">
                  {summary.errors.slice(0, 25).map((e) => (
                    <li key={`${e.row}-${e.error}`}>
                      Satır {e.row}: {e.error}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t bg-white px-5 py-3">
          <Button type="button" variant="ghost" onClick={() => handleOpenChange(false)} disabled={pending}>
            Kapat
          </Button>
          <Button
            type="button"
            className="bg-brand-teal text-white hover:bg-brand-teal-hover"
            disabled={pending || !preview || preview.validCount === 0}
            onClick={runImport}
          >
            {pending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Aktarılıyor…
              </>
            ) : (
              <>İçe aktar{preview ? ` (${preview.validCount})` : ''}</>
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
