'use client'

import { useEffect, useState } from 'react'
import { Download, Share, X } from 'lucide-react'

import { useLanguage } from '@/hooks/useLanguage'
import { cn } from '@/lib/utils'

const DISMISS_KEY = 'asistan-pwa-install-dismissed'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function isIosSafari() {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent
  const iOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  const webkit = /WebKit/.test(ua)
  const chrome = /CriOS|FxiOS|EdgiOS/.test(ua)
  return iOS && webkit && !chrome
}

function isStandaloneDisplay() {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    // iOS Safari
    ('standalone' in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone))
  )
}

/**
 * Soft install CTA for the patient app-shell (/client).
 * Chromium: beforeinstallprompt. iOS: Share → Add to Home Screen hint.
 */
export function InstallPrompt({ className }: { className?: string }) {
  const { t } = useLanguage()
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [visible, setVisible] = useState(false)
  const [iosHint, setIosHint] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (isStandaloneDisplay()) return
    if (window.localStorage.getItem(DISMISS_KEY) === '1') return

    const onBeforeInstall = (event: Event) => {
      event.preventDefault()
      setDeferred(event as BeforeInstallPromptEvent)
      setVisible(true)
      setIosHint(false)
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstall)

    if (isIosSafari()) {
      setIosHint(true)
      setVisible(true)
    }

    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstall)
  }, [])

  function dismiss() {
    window.localStorage.setItem(DISMISS_KEY, '1')
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

  return (
    <div
      className={cn(
        'mb-4 rounded-2xl border border-[#0071E3]/15 bg-[#0071E3]/5 px-4 py-3 text-[#1D1D1F]',
        className,
      )}
      role="region"
      aria-label={t({ tr: 'Uygulamayı yükle', en: 'Install app' })}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#0071E3] text-white">
          {iosHint ? <Share className="h-4 w-4" aria-hidden /> : <Download className="h-4 w-4" aria-hidden />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold tracking-tight">
            {t({
              tr: 'Asistan’ı ana ekrana ekleyin',
              en: 'Add Asistan to your home screen',
            })}
          </p>
          <p className="mt-1 text-xs leading-5 text-[#5D6068]">
            {iosHint
              ? t({
                  tr: 'Safari’de Paylaş → Ana Ekrana Ekle ile uygulama gibi kullanın.',
                  en: 'In Safari: Share → Add to Home Screen for an app-like experience.',
                })
              : t({
                  tr: 'Tarayıcıdan yükleyin; randevu ve klinik keşfi tek dokunuşla açılsın.',
                  en: 'Install from the browser for one-tap clinic discovery and bookings.',
                })}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {!iosHint && deferred ? (
              <button
                type="button"
                onClick={install}
                className="inline-flex min-h-9 items-center rounded-xl bg-[#0071E3] px-3.5 text-xs font-bold text-white"
              >
                {t({ tr: 'Yükle', en: 'Install' })}
              </button>
            ) : null}
            <button
              type="button"
              onClick={dismiss}
              className="inline-flex min-h-9 items-center rounded-xl border border-black/10 bg-white px-3.5 text-xs font-semibold text-[#5D6068]"
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
}
