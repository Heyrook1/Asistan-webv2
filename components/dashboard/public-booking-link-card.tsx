'use client'

import { useMemo, useState } from 'react'
import { Check, Copy, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  buildPublicBookEmbedSnippet,
  getPublicBookEmbedPath,
  getPublicBookPath,
} from '@/lib/public-booking/paths'
import { absoluteUrl } from '@/lib/seo'

export function PublicBookingLinkCard({
  slug,
  clinicName,
}: {
  slug: string
  clinicName: string
}) {
  const [copied, setCopied] = useState<'link' | 'embed' | null>(null)

  const bookPath = useMemo(() => getPublicBookPath(slug), [slug])
  const bookUrl = useMemo(() => absoluteUrl(bookPath), [bookPath])
  const embedUrl = useMemo(() => absoluteUrl(getPublicBookEmbedPath(slug)), [slug])
  const embedSnippet = useMemo(
    () => buildPublicBookEmbedSnippet(bookUrl, clinicName),
    [bookUrl, clinicName]
  )

  async function copy(value: string, kind: 'link' | 'embed') {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(kind)
      toast.success(kind === 'link' ? 'Randevu linki kopyalandı' : 'Embed kodu kopyalandı')
      window.setTimeout(() => setCopied(null), 1600)
    } catch {
      toast.error('Kopyalanamadı')
    }
  }

  return (
    <div className="space-y-4 rounded-xl border border-border/70 bg-slate-50/70 p-4">
      <div>
        <p className="text-sm font-semibold text-brand-ink">Genel randevu linki</p>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          Instagram bio, WhatsApp veya web siteniz için Calendly tarzı klinik sayfası. Hasta hesabı
          gerekmez; klinik paneline randevu düşer.
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground">Paylaşım linki</label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input readOnly value={bookUrl} className="bg-white font-mono text-xs" />
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => copy(bookUrl, 'link')}>
              {copied === 'link' ? <Check className="mr-1 size-3.5" /> : <Copy className="mr-1 size-3.5" />}
              Kopyala
            </Button>
            <Button type="button" variant="ghost" size="sm" asChild>
              <a href={bookPath} target="_blank" rel="noreferrer">
                <ExternalLink className="mr-1 size-3.5" />
                Aç
              </a>
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground">Embed (iframe)</label>
        <Textarea readOnly value={embedSnippet} rows={4} className="bg-white font-mono text-[11px] leading-5" />
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => copy(embedSnippet, 'embed')}>
            {copied === 'embed' ? <Check className="mr-1 size-3.5" /> : <Copy className="mr-1 size-3.5" />}
            Embed kopyala
          </Button>
          <Button type="button" variant="ghost" size="sm" asChild>
            <a href={`${bookPath}?embed=1`} target="_blank" rel="noreferrer">
              Embed önizleme
            </a>
          </Button>
        </div>
        <p className="text-[11px] text-muted-foreground">
          Embed URL: <span className="font-mono">{embedUrl}</span>
        </p>
      </div>

      <p className="rounded-lg border border-dashed border-border/80 bg-white/80 px-3 py-2 text-[11px] leading-5 text-muted-foreground">
        Medikal turizm (TR/EN/RU) talepleri için{' '}
        <a href="/visit-cyprus" className="font-semibold text-brand-teal underline-offset-2 hover:underline">
          /visit-cyprus
        </a>{' '}
        sayfasını paylaşabilirsiniz. Vize/otel satılmaz — yalnızca randevu yönlendirmesi.
      </p>
    </div>
  )
}
