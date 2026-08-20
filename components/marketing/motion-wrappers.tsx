'use client'

import { type CSSProperties, type ReactNode, useEffect, useRef, useState } from 'react'

type FramerMotionModule = typeof import('framer-motion')

let framerModulePromise: Promise<FramerMotionModule> | null = null
let framerModuleCache: FramerMotionModule | null = null

function loadFramerModule() {
  if (framerModuleCache) return Promise.resolve(framerModuleCache)
  if (!framerModulePromise) {
    framerModulePromise = import('framer-motion').then((module) => {
      framerModuleCache = module
      return module
    })
  }
  return framerModulePromise
}

function useRevealTrigger(rootMargin = '-50px') {
  const ref = useRef<HTMLDivElement | null>(null)
  const [isInView, setIsInView] = useState(false)

  useEffect(() => {
    if (isInView) return
    const node = ref.current
    if (!node) return

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (!entry) return
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      { rootMargin }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [isInView, rootMargin])

  return { ref, isInView }
}

function useLazyFramer(enabled: boolean) {
  const [framer, setFramer] = useState<FramerMotionModule | null>(framerModuleCache)

  useEffect(() => {
    if (!enabled || framer) return

    const connection = (navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string }
    }).connection
    const constrainedNetwork = Boolean(connection?.saveData) || ['slow-2g', '2g', '3g'].includes(connection?.effectiveType ?? '')
    if (constrainedNetwork) return

    let cancelled = false

    loadFramerModule().then((module) => {
      if (!cancelled) setFramer(module)
    })

    return () => {
      cancelled = true
    }
  }, [enabled, framer])

  return framer
}

export function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const isMobileViewport = window.matchMedia('(max-width: 1023px)').matches
    const hasCoarsePointer = window.matchMedia('(pointer: coarse)').matches
    const connection = (navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string }
    }).connection
    const constrainedNetwork = Boolean(connection?.saveData) || ['slow-2g', '2g', '3g'].includes(connection?.effectiveType ?? '')

    if (reducedMotion || isMobileViewport || hasCoarsePointer || constrainedNetwork) return

    let rafId = 0
    let destroyed = false
    let lenisInstance: { raf: (time: number) => void; destroy: () => void } | null = null

    const start = async () => {
      const { default: Lenis } = await import('lenis')
      if (destroyed) return

      lenisInstance = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 1,
      })

      const raf = (time: number) => {
        if (!lenisInstance) return
        lenisInstance.raf(time)
        rafId = window.requestAnimationFrame(raf)
      }

      rafId = window.requestAnimationFrame(raf)
    }

    void start()

    return () => {
      destroyed = true
      if (rafId) window.cancelAnimationFrame(rafId)
      if (lenisInstance) lenisInstance.destroy()
    }
  }, [])

  return <>{children}</>
}

interface RevealProps {
  children: ReactNode
  className?: string
  delay?: number
  duration?: number
  yOffset?: number
}

function RevealMotion({
  children,
  className = '',
  delay = 0,
  duration = 0.6,
  initial,
  inView,
  triggerRef,
}: {
  children: ReactNode
  className?: string
  delay?: number
  duration?: number
  initial: { opacity: number; x?: number; y?: number; scale?: number }
  inView: boolean
  triggerRef: React.RefObject<HTMLDivElement | null>
}) {
  const framer = useLazyFramer(inView)

  if (!framer) {
    return (
      <div ref={triggerRef} className={className}>
        {children}
      </div>
    )
  }

  const MotionDiv = framer.motion.div
  return (
    <MotionDiv
      ref={triggerRef}
      className={className}
      initial={initial}
      animate={inView ? { opacity: 1, x: 0, y: 0, scale: 1 } : initial}
      transition={{ duration, delay, ease: [0.25, 0.4, 0.25, 1] }}
    >
      {children}
    </MotionDiv>
  )
}

export function FadeUp({ children, className = '', delay = 0, duration = 0.6, yOffset = 40 }: RevealProps) {
  const { ref, isInView } = useRevealTrigger('-80px')
  return (
    <RevealMotion
      className={className}
      delay={delay}
      duration={duration}
      // Never opacity:0 — live hydrate misses left sector cards blank.
      initial={{ opacity: 1, y: yOffset }}
      inView={isInView}
      triggerRef={ref}
    >
      {children}
    </RevealMotion>
  )
}

export function FadeLeft({ children, className = '', delay = 0, duration = 0.6 }: RevealProps) {
  const { ref, isInView } = useRevealTrigger('-80px')
  return (
    <RevealMotion
      className={className}
      delay={delay}
      duration={duration}
      initial={{ opacity: 1, x: 40 }}
      inView={isInView}
      triggerRef={ref}
    >
      {children}
    </RevealMotion>
  )
}

export function ScaleIn({ children, className = '', delay = 0, duration = 0.5 }: RevealProps) {
  const { ref, isInView } = useRevealTrigger('-80px')
  return (
    <RevealMotion
      className={className}
      delay={delay}
      duration={duration}
      initial={{ opacity: 1, scale: 0.96 }}
      inView={isInView}
      triggerRef={ref}
    >
      {children}
    </RevealMotion>
  )
}

export function MouseParallax({
  children,
  className = '',
  strength = 20,
}: {
  children: ReactNode
  className?: string
  strength?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const allowHover = window.matchMedia('(hover: hover)').matches
    const finePointer = window.matchMedia('(pointer: fine)').matches
    setEnabled(!reducedMotion && allowHover && finePointer)
  }, [])

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!enabled || !ref.current) return
    const { left, top, width, height } = ref.current.getBoundingClientRect()
    const x = (e.clientX - left) / width - 0.5
    const y = (e.clientY - top) / height - 0.5
    ref.current.style.transform = `translate(${x * strength}px, ${y * strength}px)`
  }

  const handleMouseLeave = () => {
    if (!enabled || !ref.current) return
    ref.current.style.transform = 'translate(0px, 0px)'
  }

  const style: CSSProperties | undefined = enabled ? undefined : { transform: 'none' }

  return (
    <div
      ref={ref}
      className={`transition-transform duration-[var(--motion-interaction-duration)] ease-[var(--motion-interaction-ease)] ${className}`}
      onMouseMove={enabled ? handleMouseMove : undefined}
      onMouseLeave={enabled ? handleMouseLeave : undefined}
      style={style}
    >
      {children}
    </div>
  )
}
