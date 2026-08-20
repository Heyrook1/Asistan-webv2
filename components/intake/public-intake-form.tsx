'use client'

import { useMemo, useState, useTransition } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { IntakeFieldDef } from '@/lib/intake/schema'

type Props = {
  token: string
  clinicName: string
  primaryColor: string
  logoUrl: string | null
  formName: string
  formDescription: string | null
  fields: IntakeFieldDef[]
  patientName: string
  appointment: { date: string; startTime: string; serviceName: string }
  alreadySubmitted?: boolean
  submittedAt?: string | null
}

export function PublicIntakeForm(props: Props) {
  const accent = props.primaryColor || '#0071E3'
  const [answers, setAnswers] = useState<Record<string, string | boolean>>(() => {
    const init: Record<string, string | boolean> = {}
    for (const field of props.fields) {
      init[field.id] = field.type === 'CHECKBOX' ? false : ''
    }
    return init
  })
  const [pending, startTransition] = useTransition()
  const [done, setDone] = useState(Boolean(props.alreadySubmitted))

  const subtitle = useMemo(
    () => `${props.appointment.serviceName} · ${props.appointment.date} ${props.appointment.startTime}`,
    [props.appointment]
  )

  function submit() {
    startTransition(async () => {
      try {
        const res = await fetch(`/api/public/intake/${encodeURIComponent(props.token)}`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ answers }),
        })
        const json = (await res.json()) as {
          ok?: boolean
          error?: string
          fieldErrors?: Record<string, string>
          message?: string
        }
        if (!res.ok || !json.ok) {
          const firstFieldError = json.fieldErrors && Object.values(json.fieldErrors)[0]
          toast.error(firstFieldError || json.error || 'Gönderilemedi')
          return
        }
        setDone(true)
        toast.success(json.message || 'Form alındı')
      } catch {
        toast.error('Ağ hatası')
      }
    })
  }

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-8 sm:px-6">
      <header className="mb-6 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Ön kayıt formu</p>
        <div className="flex items-start gap-3">
          {props.logoUrl ? (
            <img src={props.logoUrl} alt="" className="size-12 rounded-2xl object-cover" />
          ) : (
            <div
              className="flex size-12 items-center justify-center rounded-2xl text-lg font-bold text-white"
              style={{ backgroundColor: accent }}
            >
              {props.clinicName.slice(0, 1)}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">{props.formName}</h1>
            <p className="text-sm text-slate-600">
              {props.clinicName} · {props.patientName}
            </p>
            <p className="text-xs text-slate-500">{subtitle}</p>
          </div>
        </div>
        {props.formDescription ? <p className="text-sm text-slate-600">{props.formDescription}</p> : null}
      </header>

      <div className="rounded-3xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-6">
        {done ? (
          <div className="space-y-3 py-6 text-center">
            <CheckCircle2 className="mx-auto size-12" style={{ color: accent }} />
            <h2 className="text-xl font-bold text-slate-900">Form alındı</h2>
            <p className="text-sm text-slate-600">Cevaplarınız klinik kaydınıza eklendi.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {props.fields.map((field) => (
              <div key={field.id}>
                <label className="mb-1.5 block text-sm font-medium text-slate-800">
                  {field.label}
                  {field.required ? <span className="text-red-500"> *</span> : null}
                </label>
                {field.type === 'TEXTAREA' ? (
                  <Textarea
                    rows={4}
                    placeholder={field.placeholder ?? undefined}
                    value={String(answers[field.id] ?? '')}
                    onChange={(e) => setAnswers((prev) => ({ ...prev, [field.id]: e.target.value }))}
                  />
                ) : field.type === 'SELECT' ? (
                  <select
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"
                    value={String(answers[field.id] ?? '')}
                    onChange={(e) => setAnswers((prev) => ({ ...prev, [field.id]: e.target.value }))}
                  >
                    <option value="">Seçin…</option>
                    {(field.options ?? []).map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : field.type === 'CHECKBOX' ? (
                  <label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      className="size-4 shrink-0"
                      checked={Boolean(answers[field.id])}
                      onChange={(e) => setAnswers((prev) => ({ ...prev, [field.id]: e.target.checked }))}
                    />
                    Onaylıyorum
                  </label>
                ) : (
                  <Input
                    type={field.type === 'DATE' ? 'date' : field.type === 'PHONE' ? 'tel' : 'text'}
                    placeholder={field.placeholder ?? undefined}
                    value={String(answers[field.id] ?? '')}
                    onChange={(e) => setAnswers((prev) => ({ ...prev, [field.id]: e.target.value }))}
                  />
                )}
              </div>
            ))}
            <Button
              type="button"
              disabled={pending}
              className="w-full text-white"
              style={{ backgroundColor: accent }}
              onClick={submit}
            >
              {pending ? 'Gönderiliyor…' : 'Gönder'}
            </Button>
          </div>
        )}
      </div>
      <p className="mt-6 text-center text-xs text-slate-500">
        Powered by <span className="font-semibold text-slate-700">Asistan</span>
      </p>
    </div>
  )
}
