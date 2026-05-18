import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Inbox } from 'lucide-react'

type Props = {
  title: string
  description: string
  ctaLabel?: string
  ctaHref?: string
  icon?: React.ReactNode
}

export function EmptyState({ title, description, ctaLabel, ctaHref, icon }: Props) {
  return (
    <div className="rounded-2xl border border-dashed bg-white p-10 text-center">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#12C8AD]/10 text-[#0b7f6f]">
        {icon ?? <Inbox className="h-6 w-6" />}
      </div>
      <p className="text-base font-semibold text-[#0C1D36]">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground max-w-md mx-auto">{description}</p>
      {ctaLabel && ctaHref && (
        <Button asChild className="mt-4 bg-[#12C8AD] text-white hover:bg-[#10b49c]">
          <Link href={ctaHref}>{ctaLabel}</Link>
        </Button>
      )}
    </div>
  )
}
