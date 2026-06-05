import { Image, type ImageStyle, type StyleProp } from 'react-native'

type BrandLogoVariant = 'dark' | 'light'

const logoDark = require('../assets/branding/asistan-full-logo.png')
const logoLight = require('../assets/branding/asistan-full-logo-light.png')

const fullAspectDark = 1210 / 334
const fullAspectLight = 2172 / 724

export function BrandLogo({
  variant = 'dark',
  height = 30,
  style,
}: {
  variant?: BrandLogoVariant
  height?: number
  style?: StyleProp<ImageStyle>
}) {
  const width = Math.round(height * (variant === 'light' ? fullAspectLight : fullAspectDark))
  const source = variant === 'light' ? logoLight : logoDark

  return (
    <Image
      source={source}
      accessibilityLabel="Asistan"
      resizeMode="contain"
      style={[{ width, height }, style]}
    />
  )
}
