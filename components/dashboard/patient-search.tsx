'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { searchPatients } from '@/lib/actions/patients'
import { formatPhone } from '@/lib/format'

type SearchResult = {
  id: string
  fullName: string
  patientNumber: string
  phone: string
  email: string | null
  tags: string[]
}

export function PatientSearch() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [, startTransition] = useTransition()
  const containerRef = useRef<HTMLDivElement>(null)

  // Debounced query → server search
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([])
      return
    }
    const id = setTimeout(() => {
      startTransition(async () => {
        try {
          const data = await searchPatients(query.trim())
          setResults(data as SearchResult[])
          setActiveIndex(0)
        } catch {
          setResults([])
        }
      })
    }, 200)
    return () => clearTimeout(id)
  }, [query])

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  function go(id: string) {
    setOpen(false)
    setQuery('')
    router.push(`/dashboard/hastalar/${id}`)
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
        <Input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (!open || !results.length) return
            if (e.key === 'ArrowDown') {
              e.preventDefault()
              setActiveIndex((i) => Math.min(i + 1, results.length - 1))
            } else if (e.key === 'ArrowUp') {
              e.preventDefault()
              setActiveIndex((i) => Math.max(i - 1, 0))
            } else if (e.key === 'Enter') {
              e.preventDefault()
              go(results[activeIndex].id)
            } else if (e.key === 'Escape') {
              setOpen(false)
            }
          }}
          placeholder="Hasta adı, telefon, e-posta, hasta no veya etiket ara..."
          className="pl-10 h-10 bg-dashboard-hover border-border/40 text-sm rounded-xl focus-visible:ring-brand-teal/40 focus-visible:border-brand-teal/40"
        />
      </div>

      {open && query.trim().length >= 2 && (
        <div className="absolute left-0 right-0 top-full mt-2 max-h-80 overflow-auto rounded-xl border border-border/40 bg-white shadow-xl z-50">
          {results.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-muted-foreground">
              Eşleşen hasta bulunamadı.
            </div>
          ) : (
            <ul>
              {results.map((r, i) => (
                <li key={r.id}>
                  <button
                    type="button"
                    onClick={() => go(r.id)}
                    onMouseEnter={() => setActiveIndex(i)}
                    className={`w-full text-left px-4 py-2.5 flex items-center justify-between gap-3 ${
                      i === activeIndex ? 'bg-dashboard-hover' : ''
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-brand-ink truncate">{r.fullName}</p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        #{r.patientNumber} • {formatPhone(r.phone)}{r.email ? ` • ${r.email}` : ''}
                      </p>
                    </div>
                    {r.tags.length > 0 && (
                      <span className="hidden md:inline-flex shrink-0 rounded-full bg-brand-teal/10 text-brand-teal text-[10px] px-2 py-0.5">
                        {r.tags[0]}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
