import type { Transition, Variants } from 'framer-motion'

export const appleEase: [number, number, number, number] = [0.22, 1, 0.36, 1]
export const softEase: [number, number, number, number] = [0.32, 0.72, 0, 1]

export const baseSpring = {
  type: 'spring',
  stiffness: 180,
  damping: 22,
  mass: 0.9,
} as const

export const pageEnter: Variants = {
  hidden: { opacity: 0, scale: 0.988 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.58, ease: appleEase },
  },
}

export const revealUp: Variants = {
  hidden: { opacity: 0, y: 26 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.54, ease: appleEase },
  },
}

export const revealSoft: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: softEase },
  },
}

export function staggerContainer(staggerChildren = 0.08, delayChildren = 0): Variants {
  return {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren,
        delayChildren,
        ease: appleEase,
      },
    },
  }
}

export const orbFloatTransition: Transition = {
  duration: 7.5,
  ease: 'easeInOut',
  repeat: Number.POSITIVE_INFINITY,
  repeatType: 'mirror',
}

export const rotateLoopTransition: Transition = {
  duration: 16,
  ease: 'linear',
  repeat: Number.POSITIVE_INFINITY,
}

