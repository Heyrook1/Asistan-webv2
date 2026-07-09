import { useColorScheme } from 'react-native'
import { getTheme } from '@/lib/theme'

export function useAppTheme() {
  const scheme = useColorScheme()
  return getTheme(scheme)
}
