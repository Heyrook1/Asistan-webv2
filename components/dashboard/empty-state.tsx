import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Inbox } from 'lucide-react'

type Props = {
  title: string
  description: string
  ctaLabel?: string
  ctaHref?: string
  onCtaClick?: () => void
  secondaryCtaLabel?: string
  secondaryCtaHref?: string
  onSecondaryCtaClick?: () => void
  icon?: React.ReactNode
}

export function EmptyState({
  title,
  description,
  ctaLabel,
  ctaHref,
  onCtaClick,
  secondaryCtaLabel,
  secondaryCtaHref,
  onSecondaryCtaClick,
  icon,
}: Props) {
  const hasPrimary = Boolean(ctaLabel && (ctaHref || onCtaClick))
  const hasSecondary = Boolean(secondaryCtaLabel && (secondaryCtaHref || onSecondaryCtaClick))

  return (
    <div className="rounded-2xl border border-dashed bg-white p-10 text-center">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-teal/10 text-brand-teal">
        {icon ?? <Inbox className="h-6 w-6" />}
      </div>
      <p className="text-base font-semibold text-brand-ink">{title}</p>
      <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">{description}</p>
      {(hasPrimary || hasSecondary) && (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          {hasPrimary &&
            (ctaHref ? (
              <Button asChild className="bg-brand-teal text-white hover:bg-brand-teal-hover">
                <Link href={ctaHref}>{ctaLabel}</Link>
              </Button>
            ) : (
              <Button type="button" onClick={onCtaClick} className="bg-brand-teal text-white hover:bg-brand-teal-hover">
                {ctaLabel}
              </Button>
            ))}
          {hasSecondary &&
            (secondaryCtaHref ? (
              <Button asChild variant="outline" className="border-slate-200 bg-white">
                <Link href={secondaryCtaHref}>{secondaryCtaLabel}</Link>
              </Button>
            ) : (
              <Button type="button" variant="outline" onClick={onSecondaryCtaClick} className="border-slate-200 bg-white">
                {secondaryCtaLabel}
              </Button>
            ))}
        </div>
      )}
    </div>
  )
}
