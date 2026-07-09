import type { ReactNode } from 'react'
import { SafeAreaView, type StyleProp, type ViewStyle } from 'react-native'
import { useAppTheme } from '@/lib/use-app-theme'

type Props = {
  children: ReactNode
  style?: StyleProp<ViewStyle>
}

export function Screen({ children, style }: Props) {
  const theme = useAppTheme()
  return (
    <SafeAreaView style={[{ flex: 1, backgroundColor: theme.colors.background }, style]}>
      {children}
    </SafeAreaView>
  )
}
