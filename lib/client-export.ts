/** Browser-side CSV / printable-PDF helpers for dashboard exports. */

export function downloadCsv(filename: string, rows: string[][]) {
  const escape = (cell: string) => {
    if (/[",\n;]/.test(cell)) return `"${cell.replace(/"/g, '""')}"`
    return cell
  }
  const body = rows.map((row) => row.map((cell) => escape(String(cell ?? ''))).join(';')).join('\n')
  const blob = new Blob(['\uFEFF' + body], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export type PrintableSection = {
  heading: string
  rows: string[][]
}

/** Opens a print dialog — user can Save as PDF. */
export function printReportAsPdf(options: {
  title: string
  subtitle?: string
  sections: PrintableSection[]
}) {
  const { title, subtitle, sections } = options
  const tables = sections
    .map((section) => {
      if (section.rows.length === 0) return ''
      const [header, ...body] = section.rows
      const thead = header.map((c) => `<th>${escapeHtml(c)}</th>`).join('')
      const tbody = body
        .map((row) => `<tr>${row.map((c) => `<td>${escapeHtml(c)}</td>`).join('')}</tr>`)
        .join('')
      return `
        <section>
          <h2>${escapeHtml(section.heading)}</h2>
          <table>
            <thead><tr>${thead}</tr></thead>
            <tbody>${tbody}</tbody>
          </table>
        </section>`
    })
    .join('')

  const html = `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(title)}</title>
  <style>
    body { font-family: system-ui, sans-serif; color: #0f172a; margin: 24px; font-size: 12px; }
    h1 { font-size: 18px; margin: 0 0 4px; }
    .sub { color: #64748b; margin-bottom: 20px; }
    h2 { font-size: 13px; margin: 18px 0 8px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
    th, td { border: 1px solid #e2e8f0; padding: 6px 8px; text-align: left; vertical-align: top; }
    th { background: #f8fafc; font-weight: 600; }
    @media print { body { margin: 12mm; } }
  </style>
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  ${subtitle ? `<p class="sub">${escapeHtml(subtitle)}</p>` : ''}
  ${tables}
  <script>window.onload = function () { window.print(); }</script>
</body>
</html>`

  const win = window.open('', '_blank', 'noopener,noreferrer,width=960,height=720')
  if (!win) return false
  win.document.open()
  win.document.write(html)
  win.document.close()
  return true
}

function escapeHtml(value: string) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
