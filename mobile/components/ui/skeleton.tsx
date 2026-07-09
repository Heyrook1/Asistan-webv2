import { View, type DimensionValue, type ViewStyle } from 'react-native'
import { useAppTheme } from '@/lib/use-app-theme'

type Props = {
  height?: number
  width?: DimensionValue
  style?: ViewStyle
}

export function Skeleton({ height = 14, width = '100%', style }: Props) {
  const theme = useAppTheme()
  return (
    <View
      style={[
        {
          height,
          width,
          borderRadius: theme.radii.sm,
          backgroundColor: theme.colors.skeleton,
        },
        style,
      ]}
    />
  )
}
