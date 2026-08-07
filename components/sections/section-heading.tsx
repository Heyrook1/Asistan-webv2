import { cn } from '@/lib/utils'

type SectionHeadingProps = {
  eyebrow: string
  title: string
  description?: string
  align?: 'left' | 'center'
  titleId?: string
  className?: string
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'center',
  titleId,
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        'mx-auto max-w-2xl',
        align === 'center' ? 'text-center' : 'text-left',
        className,
      )}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0071E3]">{eyebrow}</p>
      <h2
        id={titleId}
        className="mt-2 font-display text-2xl font-extrabold tracking-tight text-[#1D1D1F] sm:text-3xl lg:text-[2.15rem]"
      >
        {title}
      </h2>
      {description ? (
        <p className="mt-3 text-base leading-relaxed text-[#5D6068] sm:text-[1.05rem]">{description}</p>
      ) : null}
    </div>
  )
}
