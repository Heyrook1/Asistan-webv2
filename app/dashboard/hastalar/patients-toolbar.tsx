'use client'

import { useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Archive, Search, UserPlus } from 'lucide-react'
import { PatientFormDrawer } from '@/components/dashboard/patient-form-drawer'

export function PatientsToolbar({ canCreate }: { canCreate: boolean }) {
  const router = useRouter()
  const params = useSearchParams()
  const [drawer, setDrawer] = useState(false)
  const [query, setQuery] = useState(params.get('q') ?? '')
  const archived = params.get('archived') === '1'
  const [, startTransition] = useTransition()

  function applyQuery(value: string) {
    const next = new URLSearchParams(params.toString())
    if (value.trim()) next.set('q', value.trim())
    else next.delete('q')
    startTransition(() => router.replace(`/dashboard/hastalar?${next.toString()}`))
  }

  function toggleArchived() {
    const next = new URLSearchParams(params.toString())
    if (archived) next.delete('archived')
    else next.set('archived', '1')
    startTransition(() => router.replace(`/dashboard/hastalar?${next.toString()}`))
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          applyQuery(query)
        }}
        className="relative"
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="İsim, telefon, e-posta, no..."
          className="pl-9 w-64 bg-white"
        />
      </form>
      <Button
        type="button"
        variant={archived ? 'default' : 'outline'}
        onClick={toggleArchived}
        className={archived ? 'bg-[#0C1D36] text-white' : ''}
      >
        <Archive className="mr-2 h-4 w-4" />
        {archived ? 'Aktif Hastalar' : 'Arşiv'}
      </Button>
      {canCreate && (
        <>
          <Button
            type="button"
            onClick={() => setDrawer(true)}
            className="bg-[#12C8AD] hover:bg-[#10b49c] text-white"
          >
            <UserPlus className="mr-2 h-4 w-4" /> Hasta Ekle
          </Button>
          <PatientFormDrawer open={drawer} onOpenChange={setDrawer} />
        </>
      )}
    </div>
  )
}
