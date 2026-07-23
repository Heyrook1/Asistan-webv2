'use client'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

export function UserAvatar({ fullName, size = 'md' }: { fullName: string; size?: 'sm' | 'md' }) {
  const initials = fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
  return (
    <Avatar className={cn(size === 'sm' ? 'h-7 w-7 text-[10px]' : 'h-10 w-10')}>
      <AvatarFallback
        className="font-bold text-white"
        style={{ background: 'linear-gradient(135deg, var(--brand-blue), var(--brand-blue-hover))' }}
      >
        {initials || '?'}
      </AvatarFallback>
    </Avatar>
  )
}
