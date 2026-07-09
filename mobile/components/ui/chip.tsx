import { Pressable } from 'react-native'
import { AppText } from '@/components/ui/app-text'
import { useAppTheme } from '@/lib/use-app-theme'

type Props = {
  label: string
  selected?: boolean
  onPress?: () => void
}

export function Chip({ label, selected, onPress }: Props) {
  const theme = useAppTheme()
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={{
        borderWidth: 1,
        borderColor: selected ? theme.colors.primary : theme.colors.border,
        backgroundColor: selected ? theme.colors.primarySoft : theme.colors.surface,
        borderRadius: theme.radii.pill,
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: theme.spacing.xs,
        minHeight: 36,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <AppText variant="caption" color={selected ? theme.colors.primary : theme.colors.textMuted}>
        {label}
      </AppText>
    </Pressable>
  )
}
