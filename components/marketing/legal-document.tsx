import type { ReactNode } from 'react'
import Link from 'next/link'

import { cn } from '@/lib/utils'

export type LegalSection = {
  id: string
  title: string
  content: ReactNode
}

export function LegalHero({
  badge,
  title,
  summary,
  effectiveDate,
}: {
  badge: string
  title: string
  summary: ReactNode
  effectiveDate: string
}) {
  return (
    <section className="relative overflow-hidden pb-12 pt-28 md:pb-16 md:pt-32">
      <div className="marketing-hero-bg absolute inset-0" />
      <div className="soft-grid absolute inset-0 opacity-60" />
      <div className="marketing-container relative z-10">
        <div className="mx-auto max-w-3xl text-center">
          <p className="marketing-chip mb-5 inline-flex border-0 text-xs font-semibold">{badge}</p>
          <h1 className="font-heading text-4xl font-black leading-[1.08] text-brand-navy md:text-5xl">
            {title}
          </h1>
          <p className="mt-5 text-base leading-8 text-slate-600 md:text-lg">{summary}</p>
          <p className="mt-4 text-sm font-medium text-slate-500">
            Yürürlük tarihi: {effectiveDate}
          </p>
        </div>
      </div>
    </section>
  )
}

export function LegalDocumentBody({
  sections,
  className,
}: {
  sections: LegalSection[]
  className?: string
}) {
  return (
    <section className={cn('bg-white py-14 md:py-20', className)}>
      <div className="marketing-container grid gap-10 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-14">
        <nav
          aria-label="İçindekiler"
          className="lg:sticky lg:top-28 lg:self-start"
        >
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
            İçindekiler
          </p>
          <ol className="mt-4 space-y-2">
            {sections.map((section, index) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="text-sm leading-6 text-slate-600 underline-offset-2 transition-colors hover:text-brand-blue hover:underline"
                >
                  {index + 1}. {section.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <article className="marketing-surface rounded-2xl p-6 md:p-9">
          <div className="space-y-10">
            {sections.map((section, index) => (
              <section key={section.id} id={section.id} className="scroll-mt-28">
                <h2 className="text-xl font-black text-brand-navy md:text-2xl">
                  {index + 1}. {section.title}
                </h2>
                <div className="legal-prose mt-4 space-y-3 text-sm leading-7 text-slate-600 md:text-[15px] md:leading-8">
                  {section.content}
                </div>
              </section>
            ))}
          </div>
        </article>
      </div>
    </section>
  )
}

export function LegalCta({
  title,
  description,
  actionHref,
  actionLabel,
}: {
  title: string
  description: string
  actionHref: string
  actionLabel: string
}) {
  const isMail = actionHref.startsWith('mailto:')

  return (
    <section className="bg-dashboard-surface py-16">
      <div className="marketing-container">
        <div className="rounded-2xl bg-brand-navy p-7 text-white md:p-9">
          <h2 className="text-2xl font-black md:text-3xl">{title}</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-white/75 md:text-base">
            {description}
          </p>
          {isMail ? (
            <a
              href={actionHref}
              className="mt-6 inline-flex text-sm font-semibold text-brand-cyan hover:text-white"
            >
              {actionLabel}
            </a>
          ) : (
            <Link
              href={actionHref}
              className="mt-6 inline-flex text-sm font-semibold text-brand-cyan hover:text-white"
            >
              {actionLabel}
            </Link>
          )}
        </div>
      </div>
    </section>
  )
}

export function LegalP({ children }: { children: ReactNode }) {
  return <p>{children}</p>
}

export function LegalUl({ items }: { items: ReactNode[] }) {
  return (
    <ul className="list-disc space-y-2 pl-5">
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  )
}
