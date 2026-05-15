import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { LucideIcon } from 'lucide-react'

interface PageShellProps {
  title: string
  description: string
  icon: LucideIcon
  cta?: { label: string; href?: string; onClick?: () => void }
  emptyTitle: string
  emptyDescription: string
  emptyCta?: { label: string; href?: string }
  children?: React.ReactNode
}

export function PageShell({
  title,
  description,
  icon: Icon,
  cta,
  emptyTitle,
  emptyDescription,
  emptyCta,
  children,
}: PageShellProps) {
  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-[26px] font-bold tracking-tight text-[#0C1D36]">{title}</h1>
          <p className="mt-1 text-[13px] text-muted-foreground">{description}</p>
        </div>
        {cta && (
          cta.href ? (
            <Button asChild className="gap-2 bg-[#12C8AD] hover:bg-[#10B49C] text-white font-semibold rounded-xl">
              <Link href={cta.href}>{cta.label}</Link>
            </Button>
          ) : (
            <Button className="gap-2 bg-[#12C8AD] hover:bg-[#10B49C] text-white font-semibold rounded-xl">
              {cta.label}
            </Button>
          )
        )}
      </div>

      {children || (
        <Card className="border-border/40 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center px-6">
            <div className="rounded-2xl p-4 bg-[#12C8AD]/10 mb-4">
              <Icon className="h-8 w-8 text-[#12C8AD]" />
            </div>
            <p className="text-base font-semibold text-[#0C1D36] mb-2">{emptyTitle}</p>
            <p className="text-sm text-muted-foreground max-w-md mb-5">{emptyDescription}</p>
            {emptyCta && emptyCta.href && (
              <Button asChild variant="outline" className="rounded-xl">
                <Link href={emptyCta.href}>{emptyCta.label}</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
