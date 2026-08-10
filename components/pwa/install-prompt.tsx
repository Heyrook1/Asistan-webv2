'use client'

import { useEffect, useState } from 'react'
import { Download, Share, X } from 'lucide-react'

import { useLanguage } from '@/hooks/useLanguage'
import {
  hasPwaEngagement,
  PWA_ENGAGED_EVENT,
} from '@/lib/pwa/engagement'
import { cn } from '@/lib/utils'

const DEFAULT_DISMISS_KEY = 'asistan-pwa-install-dismissed-v2'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

/** One global capture — multiple InstallPrompt mounts must not each call preventDefault. */
let sharedDeferred: BeforeInstallPromptEvent | null = null
let globalBeforeInstallBound = false

function bindGlobalBeforeInstall() {
  if (typeof window === 'undefined' || globalBeforeInstallBound) return
  globalBeforeInstallBound = true
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault()
    sharedDeferred = event as BeforeInstallPromptEvent
    window.dispatchEvent(new Event('asistan:pwa-deferred'))
  })
}

function isIosSafari() {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent
  const iOS =
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  const webkit = /WebKit/.test(ua)
  const chrome = /CriOS|FxiOS|EdgiOS/.test(ua)
  return iOS && webkit && !chrome
}

function isStandaloneDisplay() {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    ('standalone' in navigator &&
      Boolean((navigator as Navigator & { standalone?: boolean }).standalone))
  )
}

type InstallPromptProps = {
  className?: string
  /** Delay after eligibility before showing (ms). */
  delayMs?: number
  /** Separate dismiss bucket (e.g. post-book). */
  dismissKey?: string
  /** Override title for intent-gated surfaces. */
  title?: { tr: string; en: string }
  /**
   * When true (default), wait for search/clinic view/booking engagement.
   * Post-book surfaces should pass false — booking itself is the signal.
   */
  requireEngagement?: boolean
  /** Sit above the patient bottom dock (not behind it). */
  placement?: 'inline' | 'above-dock'
}

/**
 * Soft install CTA — /client, post-book.
 * Chromium: beforeinstallprompt. iOS: Share → Add to Home Screen.
 * Does not show on first paint when requireEngagement is true.
 */
export function InstallPrompt({
  className,
  delayMs = 1200,
  dismissKey = DEFAULT_DISMISS_KEY,
  title,
  requireEngagement = true,
  placement = 'inline',
}: InstallPromptProps) {
  const { t } = useLanguage()
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [visible, setVisible] = useState(false)
  const [mode, setMode] = useState<'chromium' | 'ios' | 'manual'>('manual')
  const [engaged, setEngaged] = useState(() =>
    requireEngagement ? false : true,
  )

  useEffect(() => {
    if (!requireEngagement) {
      setEngaged(true)
      return
    }
    if (hasPwaEngagement()) {
      setEngaged(true)
      return
    }
    const onEngaged = () => setEngaged(true)
    window.addEventListener(PWA_ENGAGED_EVENT, onEngaged)
    return () => window.removeEventListener(PWA_ENGAGED_EVENT, onEngaged)
  }, [requireEngagement])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (isStandaloneDisplay()) return
    if (window.localStorage.getItem(dismissKey) === '1') return
    if (!engaged) return

    let cancelled = false
    bindGlobalBeforeInstall()

    const adoptDeferred = () => {
      if (cancelled || !sharedDeferred) return
      setDeferred(sharedDeferred)
      setMode('chromium')
      setVisible(true)
    }

    if (sharedDeferred) adoptDeferred()
    window.addEventListener('asistan:pwa-deferred', adoptDeferred)

    const timer = window.setTimeout(() => {
      if (cancelled) return
      if (sharedDeferred) {
        adoptDeferred()
        return
      }
      if (isIosSafari()) {
        setMode('ios')
        setVisible(true)
        return
      }
      setMode((current) => (current === 'chromium' ? current : 'manual'))
      setVisible(true)
    }, delayMs)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
      window.removeEventListener('asistan:pwa-deferred', adoptDeferred)
    }
  }, [delayMs, dismissKey, engaged])

  function dismiss() {
    window.localStorage.setItem(dismissKey, '1')
    setVisible(false)
    setDeferred(null)
  }

  async function install() {
    if (!deferred) return
    await deferred.prompt()
    await deferred.userChoice
    setDeferred(null)
    setVisible(false)
  }

  if (!visible) return null

  const body =
    mode === 'ios'
      ? t({
          tr: 'Safari’de Paylaş → Ana Ekrana Ekle. Asistan Rezervasyon uygulama gibi açılır.',
          en: 'In Safari: Share → Add to Home Screen. Asistan Booking opens like an app.',
        })
      : mode === 'chromium' && deferred
        ? t({
            tr: 'Ana ekrana ekleyin; klinik keşfi ve randevu tek dokunuşla açılsın.',
            en: 'Add to your home screen for one-tap clinic discovery and bookings.',
          })
        : t({
            tr: 'Tarayıcı menüsünden “Uygulamayı yükle” veya “Ana ekrana ekle” seçin.',
            en: 'Use your browser menu: “Install app” or “Add to Home Screen”.',
          })

  const heading =
    title ??
    ({
      tr: 'Asistan Rezervasyon’u yükleyin',
      en: 'Install Asistan Booking',
    } as const)

  const card = (
    <div
      className={cn(
        'rounded-2xl border border-[#0071E3]/15 bg-white/95 px-4 py-3 text-[#1D1D1F] shadow-[0_8px_28px_rgba(15,23,42,0.12)] backdrop-blur-sm',
        placement === 'inline' && 'mb-4',
        className,
      )}
      role="region"
      aria-label={t({ tr: 'Uygulamayı yükle', en: 'Install app' })}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0071E3] text-white">
          {mode === 'ios' ? (
            <Share className="h-4 w-4" aria-hidden />
          ) : (
            <Download className="h-4 w-4" aria-hidden />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold tracking-tight">{t(heading)}</p>
          <p className="mt-1 text-xs leading-5 text-[#5D6068]">{body}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {mode === 'chromium' && deferred ? (
              <button
                type="button"
                onClick={install}
                className="inline-flex min-h-11 items-center rounded-xl bg-[#0071E3] px-3.5 text-xs font-bold text-white"
              >
                {t({ tr: 'Yükle', en: 'Install' })}
              </button>
            ) : null}
            <button
              type="button"
              onClick={dismiss}
              className="inline-flex min-h-11 items-center rounded-xl border border-black/10 bg-white px-3.5 text-xs font-semibold text-[#5D6068]"
            >
              {t({ tr: 'Şimdi değil', en: 'Not now' })}
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="tap-target -mr-1 -mt-1 rounded-lg p-1.5 text-[#5D6068] hover:bg-black/5"
          aria-label={t({ tr: 'Kapat', en: 'Dismiss' })}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )

  if (placement === 'above-dock') {
    return (
      <div
        className="pointer-events-none fixed inset-x-0 z-40 px-4"
        style={{ bottom: 'var(--rz-dock-clearance)' }}
      >
        <div className="pointer-events-auto mx-auto mb-2 max-w-[480px]">{card}</div>
      </div>
    )
  }

  return card
}
