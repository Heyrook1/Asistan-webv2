/** Shared public booking URL helpers — safe for client + server. */

export function getPublicBookPath(slug: string) {
  const cleaned = slug.trim().toLowerCase()
  return `/book/${cleaned}`
}

export function getPublicBookEmbedPath(slug: string) {
  return `${getPublicBookPath(slug)}?embed=1`
}

export function buildPublicBookEmbedSnippet(absoluteBookUrl: string, clinicName: string) {
  const base = absoluteBookUrl.split('?')[0]
  const safeTitle = clinicName.replace(/"/g, "'")
  return `<iframe src="${base}?embed=1" title="${safeTitle} randevu" width="100%" height="720" style="border:0;border-radius:16px;overflow:hidden;" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`
}
