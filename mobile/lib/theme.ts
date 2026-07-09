import { Platform, type ColorSchemeName, type TextStyle, type ViewStyle } from 'react-native'

export type ThemeColors = {
  bg: string
  primary: string
  primaryDark: string
  secondary: string
  accent: string
  success: string
  warning: string
  danger: string
  info: string
  background: string
  backgroundElevated: string
  surface: string
  surfaceSoft: string
  text: string
  textMuted: string
  textInverse: string
  border: string
  borderStrong: string
  overlay: string
  skeleton: string
  heroDark: string
  heroMid: string
  primarySoft: string
  successSoft: string
}

const lightColors: ThemeColors = {
  bg: '#F3F7FC',
  primary: '#0FAE9F',
  primaryDark: '#0A8C80',
  secondary: '#1E80FF',
  accent: '#1E80FF',
  success: '#0EA472',
  warning: '#D88A1D',
  danger: '#D62839',
  info: '#1E80FF',
  background: '#F3F7FC',
  backgroundElevated: '#EAF1FB',
  surface: '#FFFFFF',
  surfaceSoft: '#F8FBFF',
  text: '#0B1A33',
  textMuted: '#5A6A85',
  textInverse: '#F8FBFF',
  border: '#DCE5F2',
  borderStrong: '#C4D3EA',
  overlay: 'rgba(8, 17, 36, 0.4)',
  skeleton: '#E2EAF6',
  heroDark: '#061B3A',
  heroMid: '#0A2D5F',
  primarySoft: '#E9F6FF',
  successSoft: '#E8FCF8',
}

const darkColors: ThemeColors = {
  bg: '#06101F',
  primary: '#22C8B8',
  primaryDark: '#1BAA9D',
  secondary: '#5DA8FF',
  accent: '#5DA8FF',
  success: '#4ED9A8',
  warning: '#F4B95A',
  danger: '#FF6E7A',
  info: '#8BC0FF',
  background: '#06101F',
  backgroundElevated: '#0C1A2F',
  surface: '#102038',
  surfaceSoft: '#132740',
  text: '#EBF2FF',
  textMuted: '#A4B6D3',
  textInverse: '#081325',
  border: '#21354F',
  borderStrong: '#2B4568',
  overlay: 'rgba(1, 5, 13, 0.65)',
  skeleton: '#1D314D',
  heroDark: '#031125',
  heroMid: '#13335F',
  primarySoft: 'rgba(34, 200, 184, 0.14)',
  successSoft: 'rgba(78, 217, 168, 0.14)',
}

export const palette = lightColors

export const radii = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 28,
  xxl: 36,
  pill: 999,
} as const

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
} as const

export const motion = {
  fast: 140,
  normal: 220,
  slow: 320,
} as const

export const typography = {
  display: { fontSize: 34, lineHeight: 40, fontWeight: '700' as const, letterSpacing: -0.4 },
  hero: { fontSize: 28, lineHeight: 34, fontWeight: '700' as const, letterSpacing: -0.2 },
  title: { fontSize: 22, lineHeight: 28, fontWeight: '700' as const },
  subtitle: { fontSize: 17, lineHeight: 23, fontWeight: '600' as const },
  body: { fontSize: 15, lineHeight: 22, fontWeight: '400' as const },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: '500' as const },
  micro: { fontSize: 11, lineHeight: 14, fontWeight: '500' as const },
  button: { fontSize: 15, lineHeight: 20, fontWeight: '700' as const },
  label: { fontSize: 12, lineHeight: 16, fontWeight: '600' as const },
} as const satisfies Record<string, TextStyle>

export const elevations: Record<'card' | 'floating' | 'glass', ViewStyle> = {
  card: Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#081125',
      shadowOpacity: 0.08,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 6 },
    },
    android: { elevation: 3, shadowColor: '#081125' },
    default: {},
  }) as ViewStyle,
  floating: Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#081125',
      shadowOpacity: 0.14,
      shadowRadius: 20,
      shadowOffset: { width: 0, height: 10 },
    },
    android: { elevation: 8, shadowColor: '#081125' },
    default: {},
  }) as ViewStyle,
  glass: Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#081125',
      shadowOpacity: 0.1,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 8 },
    },
    android: { elevation: 5, shadowColor: '#081125' },
    default: {},
  }) as ViewStyle,
}

export const shadows = elevations

export type AppTheme = {
  dark: boolean
  colors: ThemeColors
  radii: typeof radii
  spacing: typeof spacing
  typography: typeof typography
  motion: typeof motion
  elevations: typeof elevations
}

export function getTheme(scheme: ColorSchemeName): AppTheme {
  const dark = scheme === 'dark'
  return {
    dark,
    colors: dark ? darkColors : lightColors,
    radii,
    spacing,
    typography,
    motion,
    elevations,
  }
}
