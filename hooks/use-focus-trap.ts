import { useEffect, useRef, useCallback } from 'react'

/**
 * Hook to trap focus within a modal or dialog
 * Ensures keyboard navigation stays within the trap boundary
 * @param options - Configuration options
 */
export function useFocusTrap(options?: { onEscape?: () => void }) {
  const elementRef = useRef<HTMLDivElement>(null)

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && options?.onEscape) {
        options.onEscape()
        return
      }

      if (e.key !== 'Tab') return

      const element = elementRef.current
      if (!element) return

      // Get all focusable elements within the trap
      const focusableElements = element.querySelectorAll<HTMLElement>(
        'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
      )

      if (focusableElements.length === 0) return

      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]
      const activeElement = document.activeElement as HTMLElement

      // Trap Tab key
      if (e.shiftKey) {
        // Shift+Tab on first element → focus last element
        if (activeElement === firstElement) {
          e.preventDefault()
          lastElement.focus()
        }
      } else {
        // Tab on last element → focus first element
        if (activeElement === lastElement) {
          e.preventDefault()
          firstElement.focus()
        }
      }
    },
    [options]
  )

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    element.addEventListener('keydown', handleKeyDown)
    return () => {
      element.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown])

  return elementRef
}
