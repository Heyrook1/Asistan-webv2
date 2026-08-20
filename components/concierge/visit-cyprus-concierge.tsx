'use client'

import { useMemo, useState, useTransition } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { AccessibleField } from '@/components/ui/accessible-field'
import {
  CONCIERGE_LANGS,
  getConciergeCopy,
  type ConciergeLang,
} from '@/lib/concierge'
import { getPublicBookPath } from '@/lib/public-booking/paths'

export function VisitCyprusConcierge({ initialLang = 'en' }: { initialLang?: ConciergeLang }) {
  const [lang, setLang] = useState<ConciergeLang>(initialLang)
  const copy = useMemo(() => getConciergeCopy(lang), [lang])
  const [pending, startTransition] = useTransition()
  const [done, setDone] = useState(false)
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    procedureInterest: '',
    travelDates: '',
    clinicSlug: '',
    notes: '',
  })

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.fullName.trim() || !form.phone.trim() || !form.procedureInterest.trim()) {
      toast.error(copy.errors.required)
      return
    }
    startTransition(async () => {
      try {
        const res = await fetch('/api/tourism-leads', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            ...form,
            preferredLang: lang,
            clinicSlug: form.clinicSlug.trim() || undefined,
            email: form.email.trim() || undefined,
            travelDates: form.travelDates.trim() || undefined,
            notes: form.notes.trim() || undefined,
          }),
        })
        const json = (await res.json()) as { ok?: boolean; error?: string }
        if (!res.ok || json.ok === false) {
          toast.error(json.error || copy.errors.generic)
          return
        }
        setDone(true)
        toast.success(copy.success)
      } catch {
        toast.error(copy.errors.generic)
      }
    })
  }

  const bookHref = form.clinicSlug.trim()
    ? `${getPublicBookPath(form.clinicSlug.trim().toLowerCase())}?lang=${lang}`
    : `/client/clinics`

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:py-14">
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Language">
        {CONCIERGE_LANGS.map((code) => (
          <button
            key={code}
            type="button"
            onClick={() => setLang(code)}
            className={
              lang === code
                ? 'rounded-full bg-[#0071E3] px-3 py-1.5 text-xs font-semibold text-white'
                : 'rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600'
            }
            aria-pressed={lang === code}
          >
            {getConciergeCopy(code).langLabel}
          </button>
        ))}
      </div>

      <header className="mt-6 max-w-2xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0071E3]">
          {copy.eyebrow}
        </p>
        <h1 className="mt-3 font-heading text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          {copy.title}
        </h1>
        <p className="mt-3 text-base leading-7 text-slate-600">{copy.subtitle}</p>
        <p className="mt-3 text-sm leading-6 text-slate-500">{copy.honesty}</p>
      </header>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_1.1fr]">
        <section className="space-y-6">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">{copy.stepsTitle}</h2>
            <ol className="mt-3 space-y-2">
              {copy.steps.map((step, i) => (
                <li key={step} className="flex gap-3 text-sm leading-6 text-slate-600">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#0071E3]/10 text-xs font-bold text-[#0071E3]">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-900">{copy.notIncludedTitle}</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-500">
              {copy.notIncluded.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-slate-900">{copy.bookHint}</p>
            <Button asChild className="mt-3 h-11 rounded-full bg-[#0071E3] font-semibold text-white hover:bg-[#0077ed]">
              <Link href={bookHref}>{copy.bookCta}</Link>
            </Button>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-base font-semibold text-slate-900">{copy.formTitle}</h2>
          {done ? (
            <p className="mt-4 text-sm leading-6 text-emerald-700" role="status">
              {copy.success}
            </p>
          ) : (
            <form onSubmit={submit} className="mt-4 grid gap-3">
              <AccessibleField label={copy.fullName}>
                <Input
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  required
                  autoComplete="name"
                  className="h-11"
                />
              </AccessibleField>
              <AccessibleField label={copy.phone}>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  required
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="+90 5XX XXX XX XX"
                  className="h-11 text-base"
                />
              </AccessibleField>
              <AccessibleField label={copy.email}>
                <Input
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  type="email"
                  autoComplete="email"
                  className="h-11"
                />
              </AccessibleField>
              <AccessibleField label={copy.procedure}>
                <Input
                  value={form.procedureInterest}
                  onChange={(e) => setForm({ ...form, procedureInterest: e.target.value })}
                  required
                  className="h-11"
                />
              </AccessibleField>
              <AccessibleField label={copy.travelDates}>
                <Input
                  value={form.travelDates}
                  onChange={(e) => setForm({ ...form, travelDates: e.target.value })}
                  className="h-11"
                />
              </AccessibleField>
              <AccessibleField label={copy.clinicSlug}>
                <Input
                  value={form.clinicSlug}
                  onChange={(e) => setForm({ ...form, clinicSlug: e.target.value })}
                  className="h-11"
                  aria-describedby="clinic-slug-hint"
                />
              </AccessibleField>
              <p id="clinic-slug-hint" className="-mt-1 text-xs text-slate-500">
                {copy.clinicSlugHint}
              </p>
              <AccessibleField label={copy.notes}>
                <Textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={3}
                />
              </AccessibleField>
              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  disabled={pending}
                  className="h-11 min-w-[10rem] rounded-full bg-[#0071E3] font-semibold text-white hover:bg-[#0077ed]"
                >
                  {pending ? copy.submitting : copy.submit}
                </Button>
              </div>
            </form>
          )}
        </section>
      </div>
    </div>
  )
}
