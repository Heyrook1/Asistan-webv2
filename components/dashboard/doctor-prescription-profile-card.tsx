'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AccessibleField } from '@/components/ui/accessible-field'
import { updateDoctorPrescriptionProfile } from '@/lib/actions/prescriptions'

export function DoctorPrescriptionProfileCard({
  teamMemberId,
  initial,
}: {
  teamMemberId: string
  initial: {
    prescriptionTitle: string
    specialty: string
    kktcIdentityNo: string
    medicalLicenseNo: string
    diplomaNo: string
  }
}) {
  const router = useRouter()
  const [form, setForm] = useState(initial)
  const [pending, startTransition] = useTransition()

  function submit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const result = await updateDoctorPrescriptionProfile({
        teamMemberId,
        ...form,
      })
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      toast.success('Klinik reçete profili güncellendi')
      router.refresh()
    })
  }

  return (
    <Card>
      <CardContent className="p-5">
        <p className="mb-1 text-sm font-semibold text-brand-ink">Klinik reçete profili</p>
        <p className="mb-4 text-xs text-muted-foreground">
          Yazdırılabilir klinik reçetelerde kullanılacak doktor bilgileri. Resmi e-reçete ağı entegrasyonu yoktur.
        </p>
        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          <Field label="Unvan">
            <Input
              value={form.prescriptionTitle}
              onChange={(e) => setForm({ ...form, prescriptionTitle: e.target.value })}
              placeholder="Dr."
            />
          </Field>
          <Field label="Uzmanlık">
            <Input
              value={form.specialty}
              onChange={(e) => setForm({ ...form, specialty: e.target.value })}
              placeholder="Dahiliye"
            />
          </Field>
          <Field label="KKTC kimlik no">
            <Input
              value={form.kktcIdentityNo}
              onChange={(e) => setForm({ ...form, kktcIdentityNo: e.target.value })}
            />
          </Field>
          <Field label="Ruhsat / sicil no">
            <Input
              value={form.medicalLicenseNo}
              onChange={(e) => setForm({ ...form, medicalLicenseNo: e.target.value })}
            />
          </Field>
          <Field label="Diploma no">
            <Input
              value={form.diplomaNo}
              onChange={(e) => setForm({ ...form, diplomaNo: e.target.value })}
            />
          </Field>
          <div className="sm:col-span-2 flex justify-end">
            <Button type="submit" disabled={pending} className="bg-brand-teal text-white hover:bg-brand-teal-hover">
              {pending ? 'Kaydediliyor...' : 'Profili kaydet'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

function Field({ label, children }: { label: string; children: React.ReactElement }) {
  return (
    <AccessibleField label={label} labelClassName="text-xs text-muted-foreground" className="grid gap-1.5">
      {children}
    </AccessibleField>
  )
}
