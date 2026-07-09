import type { ReactNode } from 'react'
import { Text, type TextProps, type TextStyle } from 'react-native'
import { useAppTheme } from '@/lib/use-app-theme'

type Variant =
  | 'display'
  | 'hero'
  | 'title'
  | 'subtitle'
  | 'body'
  | 'caption'
  | 'micro'
  | 'button'
  | 'label'

type Props = TextProps & {
  children: ReactNode
  variant?: Variant
  color?: string
  style?: TextStyle | TextStyle[]
}

export function AppText({ children, variant = 'body', color, style, ...rest }: Props) {
  const theme = useAppTheme()
  return (
    <Text
      style={[theme.typography[variant], { color: color ?? theme.colors.text }, style]}
      maxFontSizeMultiplier={1.4}
      {...rest}
    >
      {children}
    </Text>
  )
}
