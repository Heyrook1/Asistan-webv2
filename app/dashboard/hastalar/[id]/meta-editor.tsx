'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { updatePatientMeta } from '@/lib/actions/patients'

export function PatientMetaEditor({
  patientId,
  initial,
  staff,
}: {
  patientId: string
  initial: {
    lastDiagnosis: string | null
    currentTreatment: string | null
    assignedDoctorId: string | null
    summary: string | null
    riskNote: string | null
  }
  staff: { id: string; fullName: string }[]
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const [form, setForm] = useState({
    lastDiagnosis: initial.lastDiagnosis ?? '',
    currentTreatment: initial.currentTreatment ?? '',
    assignedDoctorId: initial.assignedDoctorId ?? '',
    summary: initial.summary ?? '',
    riskNote: initial.riskNote ?? '',
  })

  function submit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const result = await updatePatientMeta({
        patientId,
        lastDiagnosis: form.lastDiagnosis.trim() || undefined,
        currentTreatment: form.currentTreatment.trim() || undefined,
        assignedDoctorId: form.assignedDoctorId || null,
        summary: form.summary.trim() || undefined,
        riskNote: form.riskNote.trim() || undefined,
      })
      if (!result.ok) { toast.error(result.error); return }
      toast.success('Hasta özeti güncellendi')
      setOpen(false)
      router.refresh()
    })
  }

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-6 w-6 text-muted-foreground hover:text-brand-teal"
        onClick={() => setOpen(true)}
        title="Hasta özetini düzenle"
      >
        <Pencil className="h-3.5 w-3.5" />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Hasta Özetini Düzenle</DialogTitle></DialogHeader>
          <form onSubmit={submit} className="grid gap-3">
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">Son Tanı</Label>
              <Input value={form.lastDiagnosis} onChange={(e) => setForm({ ...form, lastDiagnosis: e.target.value })} placeholder="Kontrol Muayenesi" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">Devam Eden Tedavi</Label>
              <Input value={form.currentTreatment} onChange={(e) => setForm({ ...form, currentTreatment: e.target.value })} placeholder="Tansiyon takibi" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">Atanmış Doktor</Label>
              <Select
                value={form.assignedDoctorId || '__none'}
                onValueChange={(v) => setForm({ ...form, assignedDoctorId: v === '__none' ? '' : v })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none">Atanmadı</SelectItem>
                  {staff.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.fullName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">Genel Not</Label>
              <Textarea value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} rows={3} placeholder="Hasta son haftalarda baş ağrısı ve yorgunluk bildirdi." />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">Risk Notu</Label>
              <Textarea value={form.riskNote} onChange={(e) => setForm({ ...form, riskNote: e.target.value })} rows={2} placeholder="Düzenli tansiyon takibi önerilir" />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>İptal</Button>
              <Button type="submit" disabled={pending} className="bg-brand-teal hover:bg-brand-teal-hover text-white">
                {pending ? 'Kaydediliyor...' : 'Kaydet'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
