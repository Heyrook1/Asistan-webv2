import { Ionicons } from '@expo/vector-icons'
import { View } from 'react-native'
import { AppButton } from '@/components/ui/app-button'
import { AppText } from '@/components/ui/app-text'
import { useAppTheme } from '@/lib/use-app-theme'

type Props = {
  title: string
  description: string
  icon?: keyof typeof Ionicons.glyphMap
  primaryActionLabel?: string
  onPrimaryAction?: () => void
}

export function EmptyState({
  title,
  description,
  icon = 'sparkles-outline',
  primaryActionLabel,
  onPrimaryAction,
}: Props) {
  const theme = useAppTheme()
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', padding: theme.spacing.xl }}>
      <View
        style={{
          width: 64,
          height: 64,
          borderRadius: theme.radii.xl,
          backgroundColor: theme.colors.primarySoft,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: theme.spacing.sm,
        }}
      >
        <Ionicons name={icon} size={24} color={theme.colors.primary} />
      </View>
      <AppText variant="subtitle" style={{ textAlign: 'center' }}>
        {title}
      </AppText>
      <AppText
        variant="body"
        color={theme.colors.textMuted}
        style={{ textAlign: 'center', marginTop: theme.spacing.xs }}
      >
        {description}
      </AppText>
      {primaryActionLabel && onPrimaryAction ? (
        <AppButton
          label={primaryActionLabel}
          onPress={onPrimaryAction}
          style={{ marginTop: theme.spacing.md, minWidth: 160 }}
        />
      ) : null}
    </View>
  )
}
