import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

type ColorVariant = 'teal' | 'blue' | 'orange' | 'purple' | 'yellow' | 'green'

const colorConfig: Record<ColorVariant, { bg: string; icon: string }> = {
  teal:   { bg: 'bg-[#12C8AD]/10', icon: 'text-[#12C8AD]' },
  blue:   { bg: 'bg-[#16A9E8]/10', icon: 'text-[#16A9E8]' },
  orange: { bg: 'bg-orange-50',    icon: 'text-orange-500' },
  purple: { bg: 'bg-purple-50',    icon: 'text-purple-500' },
  yellow: { bg: 'bg-amber-50',     icon: 'text-amber-500' },
  green:  { bg: 'bg-emerald-50',   icon: 'text-emerald-500' },
}

interface StatsCardProps {
  title: string
  value: string | number
  description?: string
  icon: LucideIcon
  color?: ColorVariant
  trend?: {
    value: number
    label: string
  }
  className?: string
}

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  color = 'teal',
  trend,
  className,
}: StatsCardProps) {
  const colors = colorConfig[color]
  const isEmpty = value === 0 || value === '0' || value === '0.0' || value === '₺0'

  return (
    <Card
      className={cn(
        'border border-border/60 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 cursor-default',
        className
      )}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-muted-foreground mb-2 truncate">{title}</p>
            <p className="text-2xl font-bold tracking-tight text-foreground">
              {isEmpty ? (
                <span className="text-muted-foreground/50">—</span>
              ) : (
                value
              )}
            </p>
            {description && (
              <p className="text-xs text-muted-foreground mt-1 truncate">
                {isEmpty ? 'Henüz veri yok' : description}
              </p>
            )}
            {trend && !isEmpty && (
              <p
                className={cn(
                  'text-xs mt-1.5 font-medium',
                  trend.value >= 0 ? 'text-emerald-600' : 'text-red-500'
                )}
              >
                {trend.value >= 0 ? '▲' : '▼'} {Math.abs(trend.value)}% {trend.label}
              </p>
            )}
          </div>
          <div className={cn('rounded-xl p-2.5 shrink-0', colors.bg)}>
            <Icon className={cn('h-5 w-5', colors.icon)} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
