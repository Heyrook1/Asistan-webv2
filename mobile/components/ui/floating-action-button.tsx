import { Ionicons } from '@expo/vector-icons'
import { Pressable } from 'react-native'
import { useAppTheme } from '@/lib/use-app-theme'

type Props = {
  icon?: keyof typeof Ionicons.glyphMap
  onPress: () => void
  accessibilityLabel: string
}

export function FloatingActionButton({ icon = 'sparkles', onPress, accessibilityLabel }: Props) {
  const theme = useAppTheme()
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [
        {
          width: 58,
          height: 58,
          borderRadius: theme.radii.pill,
          backgroundColor: theme.colors.primary,
          alignItems: 'center',
          justifyContent: 'center',
          ...theme.elevations.floating,
          opacity: pressed ? 0.9 : 1,
        },
      ]}
    >
      <Ionicons name={icon} size={24} color="#FFFFFF" />
    </Pressable>
  )
}
