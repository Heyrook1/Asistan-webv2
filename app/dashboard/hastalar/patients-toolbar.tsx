'use client'

import { useEffect, useState, useTransition, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Archive, Search, Upload, UserPlus, X, Users } from 'lucide-react'
import { PatientFormDrawer } from '@/components/dashboard/patient-form-drawer'
import { PatientImportDialog } from '@/components/dashboard/patient-import-dialog'
import { readUiPreference, UI_PREF_KEYS, writeUiPreference, type PatientsToolbarPref } from '@/lib/ui-preferences'
import { cn } from '@/lib/utils'

type Chip = { key: 'active' | 'archived'; label: string; icon: typeof Users }

const chips: Chip[] = [
  { key: 'active', label: 'Aktif', icon: Users },
  { key: 'archived', label: 'Arşiv', icon: Archive },
]

export function PatientsToolbar({
  canCreate,
  initialCreateOpen = false,
}: {
  canCreate: boolean
  initialCreateOpen?: boolean
}) {
  const router = useRouter()
  const params = useSearchParams()
  const [drawer, setDrawer] = useState(initialCreateOpen)
  const [importOpen, setImportOpen] = useState(false)
  const [query, setQuery] = useState(params.get('q') ?? '')
  const archived = params.get('archived') === '1'
  const [, startTransition] = useTransition()
  const prefsApplied = useRef(false)

  useEffect(() => {
    if (prefsApplied.current) return
    prefsApplied.current = true
    const hasUrlState = params.has('q') || params.has('archived') || params.has('create')
    if (hasUrlState) return
    const saved = readUiPreference<PatientsToolbarPref>(UI_PREF_KEYS.patientsToolbar)
    if (!saved) return
    const next = new URLSearchParams()
    if (saved.archived) next.set('archived', '1')
    if (saved.q?.trim()) {
      next.set('q', saved.q.trim())
      setQuery(saved.q.trim())
    }
    if ([...next.keys()].length === 0) return
    startTransition(() => router.replace(`/dashboard/hastalar?${next.toString()}`, { scroll: false }))
  }, [params, router, startTransition])

  useEffect(() => {
    if (!initialCreateOpen) return
    setDrawer(true)
    const next = new URLSearchParams(params.toString())
    if (!next.has('create')) return
    next.delete('create')
    const queryString = next.toString()
    const href = queryString ? `/dashboard/hastalar?${queryString}` : '/dashboard/hastalar'
    startTransition(() => router.replace(href, { scroll: false }))
  }, [initialCreateOpen, params, router, startTransition])

  function pushParams(next: URLSearchParams) {
    writeUiPreference<PatientsToolbarPref>(UI_PREF_KEYS.patientsToolbar, {
      archived: next.get('archived') === '1',
      q: next.get('q') ?? undefined,
    })
    const queryString = next.toString()
    const href = queryString ? `/dashboard/hastalar?${queryString}` : '/dashboard/hastalar'
    startTransition(() => router.replace(href, { scroll: false }))
  }

  function applyQuery(value: string) {
    const next = new URLSearchParams(params.toString())
    if (value.trim()) next.set('q', value.trim())
    else next.delete('q')
    pushParams(next)
  }

  function selectChip(key: Chip['key']) {
    const next = new URLSearchParams(params.toString())
    if (key === 'archived') next.set('archived', '1')
    else next.delete('archived')
    pushParams(next)
  }

  return (
    <div className="-mx-4 sticky top-14 z-20 bg-dashboard-bg/95 px-4 pt-1 pb-3 backdrop-blur lg:static lg:mx-0 lg:bg-transparent lg:px-0 lg:pb-0 lg:pt-0 lg:backdrop-blur-none">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:gap-2">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            applyQuery(query)
          }}
          className="relative flex-1 lg:flex-none"
        >
          <label htmlFor="patients-search" className="sr-only">
            Hasta ara
          </label>
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" aria-hidden="true" />
          <Input
            id="patients-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="İsim, telefon, no..."
            className="h-11 w-full bg-white pl-9 pr-9 lg:h-10 lg:w-64"
            inputMode="search"
            aria-label="Hasta ara"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('')
                applyQuery('')
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground hover:bg-slate-100"
              aria-label="Aramayı temizle"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </form>

        {canCreate && (
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setImportOpen(true)}
              className="h-11 flex-1 gap-2 lg:h-10 lg:flex-none"
            >
              <Upload className="h-4 w-4" /> CSV İçe Aktar
            </Button>
            <Button
              type="button"
              onClick={() => setDrawer(true)}
              className="hidden h-10 bg-brand-teal text-white hover:bg-brand-teal-hover lg:inline-flex"
            >
              <UserPlus className="mr-2 h-4 w-4" /> Hasta Ekle
            </Button>
          </div>
        )}
      </div>

      <div className="mt-2 flex gap-2 lg:mt-3">
        {chips.map((chip) => {
          const active = chip.key === 'archived' ? archived : !archived
          return (
            <button
              key={chip.key}
              type="button"
              onClick={() => selectChip(chip.key)}
              className={cn(
                'tap-target inline-flex items-center gap-1.5 rounded-full border px-4 text-sm font-medium transition-colors',
                active
                  ? 'border-brand-teal bg-brand-teal text-white'
                  : 'border-border bg-white text-muted-foreground hover:border-brand-teal/40'
              )}
              aria-pressed={active}
            >
              <chip.icon className="h-4 w-4" />
              {chip.label}
            </button>
          )
        })}
      </div>

      <PatientFormDrawer open={drawer} onOpenChange={setDrawer} />
      <PatientImportDialog open={importOpen} onOpenChange={setImportOpen} />
    </div>
  )
}
