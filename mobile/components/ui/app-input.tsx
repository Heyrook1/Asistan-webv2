import { View, TextInput, type TextInputProps, type StyleProp, type ViewStyle } from 'react-native'
import { AppText } from '@/components/ui/app-text'
import { useAppTheme } from '@/lib/use-app-theme'

type Props = TextInputProps & {
  label?: string
  error?: string | null
  containerStyle?: StyleProp<ViewStyle>
}

export function AppInput({ label, error, containerStyle, style, ...rest }: Props) {
  const theme = useAppTheme()
  return (
    <View style={containerStyle}>
      {label ? (
        <AppText variant="label" color={theme.colors.textMuted} style={{ marginBottom: theme.spacing.xs }}>
          {label}
        </AppText>
      ) : null}
      <TextInput
        placeholderTextColor={theme.colors.textMuted}
        style={[
          {
            minHeight: 46,
            borderWidth: 1,
            borderColor: error ? theme.colors.danger : theme.colors.border,
            borderRadius: theme.radii.md,
            backgroundColor: theme.colors.surfaceSoft,
            color: theme.colors.text,
            paddingHorizontal: theme.spacing.md,
            paddingVertical: theme.spacing.sm,
            fontSize: 15,
          },
          style,
        ]}
        {...rest}
      />
      {error ? (
        <AppText variant="micro" color={theme.colors.danger} style={{ marginTop: 6 }}>
          {error}
        </AppText>
      ) : null}
    </View>
  )
}
