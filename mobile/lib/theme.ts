import { Platform, type ViewStyle } from 'react-native'

export const palette = {
  bg: '#F3F7FC',
  surface: '#FFFFFF',
  surfaceSoft: '#F8FBFF',
  text: '#0B1A33',
  textMuted: '#5A6A85',
  border: '#DCE5F2',
  primary: '#0FAE9F',
  primaryDark: '#0A8C80',
  accent: '#1E80FF',
  danger: '#D62839',
  successSoft: '#E8FCF8',
  primarySoft: '#E9F6FF',
  heroDark: '#061B3A',
  heroMid: '#0A2D5F',
} as const

export const radii = {
  xs: 8,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 22,
  pill: 999,
} as const

export const spacing = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
} as const

export const shadows: Record<'card' | 'floating', ViewStyle> = {
  card: Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#0B1A33',
      shadowOpacity: 0.08,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
    },
    android: {
      elevation: 2,
      shadowColor: '#0B1A33',
    },
    default: {},
  }) as ViewStyle,
  floating: Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#0B1A33',
      shadowOpacity: 0.16,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 8 },
    },
    android: {
      elevation: 8,
      shadowColor: '#0B1A33',
    },
    default: {},
  }) as ViewStyle,
}
