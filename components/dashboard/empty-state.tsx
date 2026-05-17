'use client'

import { Button } from '@/components/ui/button'

export function EmptyState({ title, description, ctaLabel, onCta }: { title: string; description: string; ctaLabel: string; onCta: () => void }) {
  return (
    <div className="rounded-2xl border border-dashed bg-white p-10 text-center">
      <p className="text-base font-semibold text-[#0C1D36]">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      <Button onClick={onCta} className="mt-4 bg-[#12C8AD] text-white hover:bg-[#10b49c]">{ctaLabel}</Button>
    </div>
  )
}
