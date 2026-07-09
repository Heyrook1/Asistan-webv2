import type { ReactNode } from 'react'
import { View } from 'react-native'
import { AppText } from '@/components/ui/app-text'
import { useAppTheme } from '@/lib/use-app-theme'

type Props = {
  title: string
  subtitle?: string
  rightSlot?: ReactNode
}

export function SectionHeader({ title, subtitle, rightSlot }: Props) {
  const theme = useAppTheme()
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: theme.spacing.sm }}>
      <View style={{ flex: 1 }}>
        <AppText variant="subtitle">{title}</AppText>
        {subtitle ? (
          <AppText variant="caption" color={theme.colors.textMuted} style={{ marginTop: 2 }}>
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {rightSlot}
    </View>
  )
}
