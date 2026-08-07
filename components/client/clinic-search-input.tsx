'use client'

import { useCallback, useEffect, useRef, useState, useTransition } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Search, X } from 'lucide-react'

import { useLanguage } from '@/hooks/useLanguage'
import { cn } from '@/lib/utils'

const DEBOUNCE_MS = 320

/** Debounced search box — syncs `query` URL param (back/forward safe). */
export function ClinicSearchInput({ className }: { className?: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { t } = useLanguage()
  const urlQuery = searchParams.get('query') ?? ''
  const [value, setValue] = useState(urlQuery)
  const [, startTransition] = useTransition()
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

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
      startTransition(() => {
        router.push(qs ? `${pathname}?${qs}` : pathname)
      })
    },
    [pathname, router, searchParams],
  )

  function onChange(next: string) {
    setValue(next)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => pushQuery(next), DEBOUNCE_MS)
  }

  function clear() {
    setValue('')
    if (timer.current) clearTimeout(timer.current)
    pushQuery('')
  }

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current)
    }
  }, [])

  return (
    <label
      className={cn(
        'flex h-12 items-center gap-2.5 rounded-full bg-white px-4 ring-1 ring-slate-200/90',
        'focus-within:ring-2 focus-within:ring-[#0071E3]/35',
        className,
      )}
    >
      <Search className="size-4 shrink-0 text-slate-400" aria-hidden />
      <span className="sr-only">
        {t({ tr: 'Doktor, klinik veya hizmet ara', en: 'Search doctor, clinic or service' })}
      </span>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t({
          tr: 'Doktor, klinik, branş veya hizmet…',
          en: 'Doctor, clinic, specialty or service…',
        })}
        className="min-w-0 flex-1 bg-transparent text-[14px] text-slate-900 outline-none placeholder:text-slate-400"
        autoComplete="off"
        enterKeyHint="search"
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            if (timer.current) clearTimeout(timer.current)
            pushQuery(value)
          }
        }}
      />
      {value ? (
        <button
          type="button"
          onClick={clear}
          className="flex size-8 shrink-0 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          aria-label={t({ tr: 'Aramayı temizle', en: 'Clear search' })}
        >
          <X className="size-4" aria-hidden />
        </button>
      ) : null}
    </label>
  )
}
