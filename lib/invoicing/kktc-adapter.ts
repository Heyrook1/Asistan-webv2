/**
 * Optional KKTC Maliye e-Fatura API adapter.
 * Submits only when env credentials are set — never claims GİB e-SMM.
 *
 * Env:
 * - KKTC_EFATURA_BASE_URL (e.g. https://efatura-test.maliye.gov.ct.tr)
 * - KKTC_EFATURA_BEARER_TOKEN (Keycloak access token)
 * - KKTC_EFATURA_VKN (mukellef VKN path segment; falls back to business taxVkn)
 */

import type { InvoiceDraftDocument } from './document'

export type KktcEFaturaSubmitResult =
  | { ok: true; providerRef: string; raw?: unknown }
  | { ok: false; error: string; notConfigured?: boolean }

export function isKktcEFaturaConfigured(): boolean {
  return Boolean(
    process.env.KKTC_EFATURA_BASE_URL?.trim() && process.env.KKTC_EFATURA_BEARER_TOKEN?.trim()
  )
}

export async function submitKktcEFatura(input: {
  document: InvoiceDraftDocument
  taxVkn: string | null
}): Promise<KktcEFaturaSubmitResult> {
  const base = process.env.KKTC_EFATURA_BASE_URL?.trim()
  const token = process.env.KKTC_EFATURA_BEARER_TOKEN?.trim()
  if (!base || !token) {
    return {
      ok: false,
      notConfigured: true,
      error:
        'KKTC e-Fatura API yapılandırılmadı (KKTC_EFATURA_BASE_URL + KKTC_EFATURA_BEARER_TOKEN). Taslak yazdırılabilir.',
    }
  }

  if (input.document.kind === 'SMM_TR') {
    return {
      ok: false,
      error: 'TR GİB e-SMM bu üründen gönderilmez. KKTC hizmet faturası (SERVICE) kullanın.',
    }
  }

  const vkn =
    process.env.KKTC_EFATURA_VKN?.trim() ||
    input.taxVkn?.trim() ||
    input.document.seller.taxId?.trim()
  if (!vkn) {
    return { ok: false, error: 'Vergi kimlik numarası (VKN) gerekli' }
  }

  const url = `${base.replace(/\/$/, '')}/api/mukellefler/${encodeURIComponent(vkn)}/faturalar`

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        source: 'asistan',
        document: input.document,
      }),
      signal: AbortSignal.timeout(20_000),
    })

    const text = await res.text()
    let json: unknown = null
    try {
      json = text ? JSON.parse(text) : null
    } catch {
      json = { raw: text }
    }

    if (!res.ok) {
      const msg =
        typeof json === 'object' &&
        json &&
        'message' in json &&
        typeof (json as { message: unknown }).message === 'string'
          ? (json as { message: string }).message
          : `KKTC e-Fatura API ${res.status}`
      return { ok: false, error: msg }
    }

    const ref =
      (typeof json === 'object' &&
        json &&
        'id' in json &&
        typeof (json as { id: unknown }).id === 'string' &&
        (json as { id: string }).id) ||
      (typeof json === 'object' &&
        json &&
        'uuid' in json &&
        typeof (json as { uuid: unknown }).uuid === 'string' &&
        (json as { uuid: string }).uuid) ||
      `kktc-${Date.now()}`

    return { ok: true, providerRef: ref, raw: json }
  } catch (e) {
    const message = e instanceof Error ? e.message : 'KKTC e-Fatura gönderimi başarısız'
    return { ok: false, error: message }
  }
}
