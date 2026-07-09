import { ActivityIndicator, Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native'
import { AppText } from '@/components/ui/app-text'
import { useAppTheme } from '@/lib/use-app-theme'

type Props = PressableProps & {
  label: string
  loading?: boolean
  variant?: 'primary' | 'secondary' | 'ghost'
  style?: StyleProp<ViewStyle>
}

export function AppButton({ label, loading, variant = 'primary', style, disabled, ...rest }: Props) {
  const theme = useAppTheme()
  const isDisabled = Boolean(disabled || loading)
  const stylesByVariant = {
    primary: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
      textColor: '#FFFFFF',
    },
    secondary: {
      backgroundColor: theme.colors.primarySoft,
      borderColor: theme.colors.borderStrong,
      textColor: theme.colors.text,
    },
    ghost: {
      backgroundColor: 'transparent',
      borderColor: theme.colors.border,
      textColor: theme.colors.textMuted,
    },
  }[variant]

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      style={({ pressed }) => [
        {
          minHeight: 48,
          borderRadius: theme.radii.md,
          borderWidth: 1,
          borderColor: stylesByVariant.borderColor,
          backgroundColor: stylesByVariant.backgroundColor,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: isDisabled ? 0.65 : pressed ? 0.92 : 1,
          paddingHorizontal: theme.spacing.md,
        },
        style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={stylesByVariant.textColor} />
      ) : (
        <AppText variant="button" color={stylesByVariant.textColor}>
          {label}
        </AppText>
      )}
    </Pressable>
  )
}
