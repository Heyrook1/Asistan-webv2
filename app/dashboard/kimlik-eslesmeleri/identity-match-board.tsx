'use client'

import { useState, useTransition } from 'react'
import type {
  PendingIdentityMatch,
  RecentIdentityMerge,
} from '@/lib/actions/identity-matches'
import type { ActionResult } from '@/lib/actions/result'
import { IDENTITY_MERGE_CONFIRM_PHRASE } from '@/lib/identity/match-policy'
import { labelIdentityMatchMethod } from '@/lib/ui-labels'

type DecideFn = (raw: unknown) => Promise<ActionResult<{ ledgerId?: string }>>
type UndoFn = (raw: unknown) => Promise<ActionResult>

export function IdentityMatchBoard({
  initialMatches,
  recentMerges: initialMerges,
  decideAction,
  undoAction,
}: {
  initialMatches: PendingIdentityMatch[]
  recentMerges: RecentIdentityMerge[]
  decideAction: DecideFn
  undoAction: UndoFn
}) {
  const [matches, setMatches] = useState(initialMatches)
  const [merges, setMerges] = useState(initialMerges)
  const [error, setError] = useState<string | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [confirmPhrase, setConfirmPhrase] = useState('')
  const [pending, startTransition] = useTransition()

  function reject(matchId: string) {
    setError(null)
    startTransition(async () => {
      const result = await decideAction({ matchId, decision: 'reject' })
      if (!result.ok) {
        setError(result.error)
        return
      }
      setMatches((prev) => prev.filter((m) => m.id !== matchId))
      setConfirmId(null)
      setConfirmPhrase('')
    })
  }

  function accept(match: PendingIdentityMatch) {
    setError(null)
    startTransition(async () => {
      const result = await decideAction({
        matchId: match.id,
        decision: 'accept',
        confirmPhrase,
      })
      if (!result.ok) {
        setError(result.error)
        return
      }
      setMatches((prev) => prev.filter((m) => m.id !== match.id))
      setConfirmId(null)
      setConfirmPhrase('')
      if (result.data?.ledgerId) {
        setMerges((prev) => [
          {
            id: result.data!.ledgerId!,
            matchId: match.id,
            score: match.score,
            acceptedAt: new Date().toISOString(),
            patientIdsMovedCount: match.clinicPatientMoves,
            summaryText: match.mergeSummary,
            canUndo: true,
          },
          ...prev,
        ])
      }
    })
  }

  function undo(ledgerId: string) {
    setError(null)
    startTransition(async () => {
      const result = await undoAction({ ledgerId })
      if (!result.ok) {
        setError(result.error)
        return
      }
      setMerges((prev) => prev.filter((m) => m.id !== ledgerId))
    })
  }

  return (
    <div className="space-y-8">
      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      {matches.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-600">
          Bekleyen kimlik eşleşmesi yok.
        </p>
      ) : (
        <ul className="space-y-4">
          {matches.map((match) => {
            const pct = Math.round(match.score * 100)
            const canMerge = match.eligibility.canMerge
            const openConfirm = confirmId === match.id
            return (
              <li
                key={match.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span
                    className={
                      pct <= 49
                        ? 'rounded-full bg-amber-100 px-2 py-0.5 font-medium text-amber-900'
                        : canMerge
                          ? 'rounded-full bg-teal-100 px-2 py-0.5 font-medium text-teal-900'
                          : 'rounded-full bg-red-100 px-2 py-0.5 font-medium text-red-800'
                    }
                  >
                    skor %{pct}
                  </span>
                  <RiskBadge risk={match.eligibility.risk} />
                  <span>{labelIdentityMatchMethod(match.method)}</span>
                  <span>{new Date(match.createdAt).toLocaleString('tr-TR')}</span>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <PersonCard label="Sol (kalacak)" person={match.left} />
                  <PersonCard label="Sağ (bağlanacak)" person={match.right} />
                </div>

                <FieldDiffTable rows={match.fieldDiff} />

                {match.eligibility.blockers.length > 0 ? (
                  <ul className="mt-3 space-y-1 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
                    {match.eligibility.blockers.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                ) : null}
                {match.eligibility.warnings.length > 0 ? (
                  <ul className="mt-2 space-y-1 text-sm text-slate-600">
                    {match.eligibility.warnings.map((w) => (
                      <li key={w}>{w}</li>
                    ))}
                  </ul>
                ) : null}

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => reject(match.id)}
                    className={
                      canMerge
                        ? 'rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50'
                        : 'rounded-xl bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-900 disabled:opacity-50'
                    }
                  >
                    Reddet
                  </button>
                  {canMerge ? (
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => {
                        setConfirmId(openConfirm ? null : match.id)
                        setConfirmPhrase('')
                        setError(null)
                      }}
                      className="rounded-xl bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-50"
                    >
                      {openConfirm ? 'İptal' : 'Birleştir…'}
                    </button>
                  ) : (
                    <span className="self-center text-xs text-slate-500">
                      Birleştirme kapalı — yalnızca inceleme / ret
                    </span>
                  )}
                </div>

                {openConfirm && canMerge ? (
                  <div className="mt-4 space-y-3 rounded-xl border border-teal-200 bg-teal-50/60 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-teal-900">
                      Birleştirme özeti
                    </p>
                    <pre className="whitespace-pre-wrap font-sans text-sm text-slate-800">
                      {match.mergeSummary}
                    </pre>
                    {match.requiresOwner ? (
                      <p className="text-sm text-amber-900">
                        Orta güven: işletme sahibi (dört göz) yetkisi gerekir.
                      </p>
                    ) : null}
                    <label className="block text-sm text-slate-700">
                      Onay ifadesi ({IDENTITY_MERGE_CONFIRM_PHRASE})
                      <input
                        type="text"
                        autoComplete="off"
                        value={confirmPhrase}
                        onChange={(e) => setConfirmPhrase(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base text-slate-900"
                        placeholder={IDENTITY_MERGE_CONFIRM_PHRASE}
                        aria-label="Birleştirme onay ifadesi"
                      />
                    </label>
                    <button
                      type="button"
                      disabled={pending || confirmPhrase !== IDENTITY_MERGE_CONFIRM_PHRASE}
                      onClick={() => accept(match)}
                      className="rounded-xl bg-teal-800 px-4 py-2 text-sm font-medium text-white hover:bg-teal-900 disabled:opacity-50"
                    >
                      Birleştirmeyi onayla
                    </button>
                  </div>
                ) : null}
              </li>
            )
          })}
        </ul>
      )}

      {merges.length > 0 ? (
        <section className="space-y-3" aria-labelledby="merge-ledger-heading">
          <h2 id="merge-ledger-heading" className="text-lg font-semibold text-slate-900">
            Son birleştirmeler
          </h2>
          <p className="text-sm text-slate-600">
            Klinik içi hasta bağları geri alınabilir (işletme sahibi). Ledger kaydı silinmez.
          </p>
          <ul className="space-y-3">
            {merges.map((m) => (
              <li
                key={m.id}
                className="rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs text-slate-500">
                    {new Date(m.acceptedAt).toLocaleString('tr-TR')} · skor %
                    {Math.round(m.score * 100)} · {m.patientIdsMovedCount} kart
                  </span>
                  {m.canUndo ? (
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => undo(m.id)}
                      className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                    >
                      Geri al
                    </button>
                  ) : null}
                </div>
                <pre className="mt-2 whitespace-pre-wrap font-sans text-xs text-slate-600">
                  {m.summaryText}
                </pre>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  )
}

function RiskBadge({ risk }: { risk: PendingIdentityMatch['eligibility']['risk'] }) {
  const label =
    risk === 'review_only'
      ? 'yalnızca inceleme'
      : risk === 'block'
        ? 'birleştirme engelli'
        : 'onay gerekli'
  const cls =
    risk === 'confirm_required'
      ? 'rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-700'
      : 'rounded-full bg-amber-100 px-2 py-0.5 font-medium text-amber-900'
  return <span className={cls}>{label}</span>
}

function FieldDiffTable({ rows }: { rows: PendingIdentityMatch['fieldDiff'] }) {
  return (
    <div className="mt-3 overflow-x-auto">
      <table className="w-full min-w-[28rem] border-collapse text-left text-sm">
        <caption className="sr-only">Alan bazlı karşılaştırma</caption>
        <thead>
          <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
            <th scope="col" className="py-2 pr-2 font-semibold">
              Alan
            </th>
            <th scope="col" className="py-2 pr-2 font-semibold">
              Sol
            </th>
            <th scope="col" className="py-2 pr-2 font-semibold">
              Sağ
            </th>
            <th scope="col" className="py-2 font-semibold">
              Durum
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.field} className="border-b border-slate-100">
              <th scope="row" className="py-2 pr-2 font-medium text-slate-800">
                {row.label}
              </th>
              <td className="py-2 pr-2 text-slate-700">{row.left}</td>
              <td className="py-2 pr-2 text-slate-700">{row.right}</td>
              <td className="py-2">
                <DiffStatus status={row.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function DiffStatus({ status }: { status: PendingIdentityMatch['fieldDiff'][number]['status'] }) {
  const map: Record<typeof status, { label: string; className: string }> = {
    match: { label: 'Uyuşuyor', className: 'text-teal-800' },
    mismatch: { label: 'Uyuşmuyor', className: 'text-red-700 font-medium' },
    left_only: { label: 'Yalnız sol', className: 'text-amber-800' },
    right_only: { label: 'Yalnız sağ', className: 'text-amber-800' },
    both_empty: { label: 'Boş', className: 'text-slate-500' },
  }
  const item = map[status]
  return <span className={item.className}>{item.label}</span>
}

function PersonCard({
  label,
  person,
}: {
  label: string
  person: PendingIdentityMatch['left']
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-3 text-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 font-medium text-slate-900">{person.fullNameCanon || '—'}</p>
      <p className="text-xs text-slate-500">{person.gpiDisplay}</p>
      <p className="mt-2 text-slate-600">{person.phoneE164 ?? 'telefon yok'}</p>
      <p className="text-slate-600">{person.emailNorm ?? 'e-posta yok'}</p>
    </div>
  )
}
