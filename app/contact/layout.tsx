import type { Metadata } from 'next'

import { withCanonical } from '@/lib/seo'

export const metadata: Metadata = withCanonical('/contact', {
  title: 'İletişim',
  description: 'Asistan Health demo, kurulum ve destek talepleri için iletişime geçin.',
})

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children
}
