import { useRef, type ReactNode } from 'react'
import {
  Animated,
  Pressable,
  type GestureResponderEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native'

type Props = {
  children: ReactNode
  onPress?: (event: GestureResponderEvent) => void
  style?: StyleProp<ViewStyle>
  disabled?: boolean
  accessibilityLabel?: string
  scaleTo?: number
}

export function PressableScale({
  children,
  onPress,
  style,
  disabled = false,
  accessibilityLabel,
  scaleTo = 0.97,
}: Props) {
  const scale = useRef(new Animated.Value(1)).current

  function animate(to: number) {
    Animated.spring(scale, {
      toValue: to,
      useNativeDriver: true,
      speed: 40,
      bounciness: 6,
    }).start()
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      disabled={disabled}
      onPress={onPress}
      onPressIn={() => animate(scaleTo)}
      onPressOut={() => animate(1)}
    >
      <Animated.View style={[{ transform: [{ scale }] }, style]}>{children}</Animated.View>
    </Pressable>
  )
}
