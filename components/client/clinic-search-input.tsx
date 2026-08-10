'use client'

import { useCallback, useEffect, useRef, useState, useTransition } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Loader2, Search, X } from 'lucide-react'

import { useLanguage } from '@/hooks/useLanguage'
import { markPwaEngagement } from '@/lib/pwa/engagement'
import { cn } from '@/lib/utils'

const DEBOUNCE_MS = 400

/** Search box — URL `query` param; debounce + explicit submit + loading. */
export function ClinicSearchInput({ className }: { className?: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { t } = useLanguage()
  const urlQuery = searchParams.get('query') ?? ''
  const [value, setValue] = useState(urlQuery)
  const [pending, startTransition] = useTransition()
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setValue(urlQuery)
  }, [urlQuery])

  const pushQuery = useCallback(
    (nextQuery: string) => {
      const next = new URLSearchParams(searchParams.toString())
      const trimmed = nextQuery.trim()
      if (trimmed) next.set('query', trimmed)
      else next.delete('query')
      const qs = next.toString()
      const href = qs ? `${pathname}?${qs}` : pathname
      const current = searchParams.toString()
      if (qs === current) return
      if (trimmed) markPwaEngagement('clinic_search')
      startTransition(() => {
        router.push(href)
      })
    },
    [pathname, router, searchParams],
  )

  function scheduleDebounced(next: string) {
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => pushQuery(next), DEBOUNCE_MS)
  }

  function onChange(next: string) {
    setValue(next)
    scheduleDebounced(next)
  }

  function submitNow() {
    if (timer.current) clearTimeout(timer.current)
    pushQuery(value)
  }

  function clear() {
    setValue('')
    if (timer.current) clearTimeout(timer.current)
    pushQuery('')
    inputRef.current?.focus()
  }

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current)
    }
  }, [])

  return (
    <form
      role="search"
      className={cn(
        'flex h-12 items-center gap-1 rounded-full bg-white pl-4 pr-1.5 ring-1 ring-slate-200/90',
        'focus-within:ring-2 focus-within:ring-[#0071E3]/35',
        className,
      )}
      onSubmit={(e) => {
        e.preventDefault()
        submitNow()
      }}
      aria-busy={pending || undefined}
    >
      <label className="flex min-w-0 flex-1 items-center gap-2.5">
        <Search className="size-4 shrink-0 text-slate-400" aria-hidden />
        <span className="sr-only">
          {t({ tr: 'Doktor, klinik veya hizmet ara', en: 'Search doctor, clinic or service' })}
        </span>
        <input
          ref={inputRef}
          type="search"
          name="query"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={t({
            tr: 'Doktor, klinik, branş veya hizmet…',
            en: 'Doctor, clinic, specialty or service…',
          })}
          className="min-w-0 flex-1 bg-transparent text-[14px] text-slate-900 outline-none placeholder:text-slate-400"
          autoComplete="off"
          enterKeyHint="search"
          inputMode="search"
          aria-label={t({ tr: 'Arama', en: 'Search' })}
        />
      </label>
      {value ? (
        <button
          type="button"
          onClick={clear}
          className="flex size-9 shrink-0 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          aria-label={t({ tr: 'Aramayı temizle', en: 'Clear search' })}
        >
          <X className="size-4" aria-hidden />
        </button>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className={cn(
          'flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-full bg-[#0071E3] px-3.5',
          'text-[12px] font-bold text-white transition hover:bg-[#0063C8]',
          'disabled:opacity-70',
          'min-w-[44px]',
        )}
        aria-label={t({ tr: 'Ara', en: 'Search' })}
      >
        {pending ? (
          <Loader2 className="size-4 animate-spin" aria-hidden />
        ) : (
          <Search className="size-4 sm:hidden" aria-hidden />
        )}
        <span className="hidden sm:inline">{t({ tr: 'Ara', en: 'Search' })}</span>
        {pending ? (
          <span className="sr-only">{t({ tr: 'Aranıyor…', en: 'Searching…' })}</span>
        ) : null}
      </button>
    </form>
  )
}
