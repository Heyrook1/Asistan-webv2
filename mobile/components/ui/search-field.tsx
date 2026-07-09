import { Ionicons } from '@expo/vector-icons'
import { Pressable, TextInput, View } from 'react-native'
import { useAppTheme } from '@/lib/use-app-theme'

type Props = {
  value: string
  onChangeText: (value: string) => void
  placeholder?: string
  onSubmit?: () => void
}

export function SearchField({ value, onChangeText, placeholder, onSubmit }: Props) {
  const theme = useAppTheme()
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.radii.lg,
        backgroundColor: theme.colors.surfaceSoft,
        paddingHorizontal: theme.spacing.md,
        minHeight: 50,
        gap: theme.spacing.xs,
      }}
    >
      <Ionicons name="search-outline" size={18} color={theme.colors.textMuted} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder ?? 'Ara'}
        placeholderTextColor={theme.colors.textMuted}
        style={{ flex: 1, color: theme.colors.text, fontSize: 15 }}
        onSubmitEditing={onSubmit}
        accessibilityLabel="Arama"
        returnKeyType="search"
      />
      {value ? (
        <Pressable onPress={() => onChangeText('')} accessibilityRole="button" accessibilityLabel="Aramayi temizle">
          <Ionicons name="close-circle" size={18} color={theme.colors.textMuted} />
        </Pressable>
      ) : null}
    </View>
  )
}
