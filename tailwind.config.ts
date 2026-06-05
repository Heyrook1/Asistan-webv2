import type { Config } from 'tailwindcss'

const config = {
  theme: {
    extend: {
      fontFamily: {
        sans: ['SF Pro Text', 'SF Pro Display', 'Inter', 'Manrope', 'system-ui', 'sans-serif'],
        display: ['SF Pro Display', 'SF Pro Text', 'Inter', 'Manrope', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glass: '0 20px 50px -28px rgba(29, 29, 31, 0.32)',
        'glass-soft': '0 12px 30px -22px rgba(29, 29, 31, 0.24)',
        'accent-glow': '0 0 0 1px rgba(0, 113, 227, 0.25), 0 14px 40px -20px rgba(0, 113, 227, 0.45)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      transitionTimingFunction: {
        apple: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      backdropBlur: {
        xl: '22px',
      },
    },
  },
} satisfies Config

export default config

