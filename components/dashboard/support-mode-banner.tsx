'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { LifeBuoy } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { stopSupportMode } from '@/lib/actions/support-mode'

export function SupportModeBanner({ businessName }: { businessName: string }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  return (
    <div
      className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-violet-200 bg-violet-50 px-4 py-3 text-violet-950"
      role="status"
    >
      <div className="flex items-start gap-2">
        <LifeBuoy className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
        <div>
          <p className="text-sm font-semibold">Destek modu</p>
          <p className="text-xs leading-relaxed opacity-90">
            Şu an <strong>{businessName}</strong> klinik panelini destek için görüntülüyorsunuz. Yazma
            işlemleri gerçek veriye yansır — dikkatli olun.
          </p>
        </div>
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={pending}
        className="border-violet-300 bg-white"
        onClick={() => {
          startTransition(async () => {
            const result = await stopSupportMode()
            if (!result.ok) {
              toast.error(result.error)
              return
            }
            toast.success('Destek modu kapatıldı')
            router.push('/dashboard/sistem-admin')
            router.refresh()
          })
        }}
      >
        Çık
      </Button>
    </div>
  )
}
