import type { ReactNode } from 'react'
import Link from 'next/link'
import { ArrowRight, CheckCircle2 } from 'lucide-react'

import { AsistanLogo } from '@/components/asistan-logo'
import { productName } from '@/lib/brand/masterbrand'
import { cn } from '@/lib/utils'

type AuthShellProps = {
  badge?: string
  title: string
  description: string
  highlights?: string[]
  children: ReactNode
  cardClassName?: string
}

const defaultHighlights = [
  'Tek panelde randevu ve hasta takibi',
  'Rol bazlı erişim ve ekip düzeni',
  'KVKK odaklı veri güvenliği',
]

export function AuthShell({
  badge = productName('health', 'tr'),
  title,
  description,
  highlights = defaultHighlights,
  children,
  cardClassName,
}: AuthShellProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#F7F7F5]">
      <div className="marketing-hero-bg absolute inset-0" />
      <div className="soft-grid absolute inset-0 opacity-55" />

      <header className="relative z-20 border-b border-brand-blue/10 bg-white/85 backdrop-blur-md">
        <div className="marketing-container flex h-[72px] items-center justify-between">
          <Link href="/" className="inline-flex flex-col items-start" aria-label="Asistan ana sayfa">
            <AsistanLogo variant="dark" size="md" priority />
            <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-blue/70">
              {productName('health', 'tr')}
            </span>
          </Link>
          <Link
            href="/"
            className="inline-flex min-h-10 items-center gap-1 rounded-lg border border-brand-blue/20 px-3 text-sm font-semibold text-brand-navy transition-colors hover:bg-brand-light"
          >
            Anasayfa
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </header>

      <main id="main-content" tabIndex={-1} className="marketing-container relative z-10 py-10">
        <div className="grid items-start gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:pt-6">
          <section className="pt-2">
            <p className="marketing-chip border-0">{badge}</p>
            <h1 className="mt-5 max-w-xl font-heading text-4xl font-black leading-[1.08] text-brand-navy md:text-5xl">
              {title}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-8 text-slate-600 md:text-lg">
              {description}
            </p>
            <div className="mt-7 space-y-3">
              {highlights.map((item) => (
                <p key={item} className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                  <CheckCircle2 className="size-4 text-brand-blue" aria-hidden="true" />
                  {item}
                </p>
              ))}
            </div>
            <p className="mt-8 max-w-md text-xs leading-5 text-slate-500">
              Deneme hesabı sonrası açılan panel, bu sayfadaki Asistan Health markası ile aynı renk
              ve logo dilini kullanır.
            </p>
          </section>

          <section
            className={cn(
              'marketing-surface rounded-2xl border-brand-blue/10 bg-white/95 p-5 shadow-[0_20px_50px_rgba(0,113,227,0.10)] md:p-7',
              cardClassName
            )}
          >
            {children}
          </section>
        </div>
      </main>
    </div>
  )
}
