import { useEffect, useRef, type ReactNode } from 'react'
import { Animated, type StyleProp, type ViewStyle } from 'react-native'

type Props = {
  children: ReactNode
  style?: StyleProp<ViewStyle>
  delay?: number
  duration?: number
  translateY?: number
}

export function FadeInView({
  children,
  style,
  delay = 0,
  duration = 320,
  translateY = 12,
}: Props) {
  const opacity = useRef(new Animated.Value(0)).current
  const offset = useRef(new Animated.Value(translateY)).current

  useEffect(() => {
    const animation = Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(offset, {
        toValue: 0,
        duration,
        delay,
        useNativeDriver: true,
      }),
    ])
    animation.start()
    return () => animation.stop()
  }, [delay, duration, offset, opacity])

  return (
    <Animated.View style={[{ opacity, transform: [{ translateY: offset }] }, style]}>
      {children}
    </Animated.View>
  )
}
