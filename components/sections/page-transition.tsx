'use client'

import type { ReactNode } from 'react'
import { motion } from 'framer-motion'

import { pageEnter } from '@/lib/animations'

export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <motion.div initial={false} animate="visible" variants={pageEnter}>
      {children}
    </motion.div>
  )
}
