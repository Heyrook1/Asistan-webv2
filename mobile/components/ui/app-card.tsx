import type { ReactNode } from 'react'
import { View, type StyleProp, type ViewStyle } from 'react-native'
import { useAppTheme } from '@/lib/use-app-theme'

type Props = {
  children: ReactNode
  style?: StyleProp<ViewStyle>
  elevated?: boolean
}

export function AppCard({ children, style, elevated = true }: Props) {
  const theme = useAppTheme()
  return (
    <View
      style={[
        {
          borderRadius: theme.radii.lg,
          borderWidth: 1,
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.surface,
          padding: theme.spacing.md,
        },
        elevated ? theme.elevations.card : null,
        style,
      ]}
    >
      {children}
    </View>
  )
}
