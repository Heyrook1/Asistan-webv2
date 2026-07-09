import { View } from 'react-native'
import { AppText } from '@/components/ui/app-text'
import { useAppTheme } from '@/lib/use-app-theme'

type Props = {
  label: string
  tone?: 'success' | 'warning' | 'danger' | 'info'
}

export function Badge({ label, tone = 'info' }: Props) {
  const theme = useAppTheme()
  const byTone = {
    success: { bg: theme.colors.successSoft, text: theme.colors.success },
    warning: { bg: 'rgba(216, 138, 29, 0.16)', text: theme.colors.warning },
    danger: { bg: 'rgba(214, 40, 57, 0.14)', text: theme.colors.danger },
    info: { bg: theme.colors.primarySoft, text: theme.colors.secondary },
  }[tone]
  return (
    <View
      style={{
        borderRadius: theme.radii.pill,
        paddingHorizontal: 10,
        paddingVertical: 5,
        backgroundColor: byTone.bg,
        alignSelf: 'flex-start',
      }}
    >
      <AppText variant="micro" color={byTone.text}>
        {label}
      </AppText>
    </View>
  )
}
