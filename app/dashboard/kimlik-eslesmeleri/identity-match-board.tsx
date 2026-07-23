'use client'

import { useState, useTransition } from 'react'
import type { PendingIdentityMatch } from '@/lib/actions/identity-matches'
import type { ActionResult } from '@/lib/actions/result'

type DecideFn = (raw: unknown) => Promise<ActionResult>

export function IdentityMatchBoard({
  initialMatches,
  decideAction,
}: {
  initialMatches: PendingIdentityMatch[]
  decideAction: DecideFn
}) {
  const [matches, setMatches] = useState(initialMatches)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function decide(matchId: string, decision: 'accept' | 'reject') {
    setError(null)
    startTransition(async () => {
      const result = await decideAction({ matchId, decision })
      if (!result.ok) {
        setError(result.error)
        return
      }
      setMatches((prev) => prev.filter((m) => m.id !== matchId))
    })
  }

  if (matches.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-600">
        Bekleyen kimlik eşleşmesi yok.
      </p>
    )
  }

  return (
    <div className="space-y-4">
      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      ) : null}
      <ul className="space-y-4">
        {matches.map((match) => (
          <li
            key={match.id}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span className="rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-700">
                skor {(match.score * 100).toFixed(0)}%
              </span>
              <span>{match.method}</span>
              <span>{new Date(match.createdAt).toLocaleString('tr-TR')}</span>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <PersonCard label="Sol" person={match.left} />
              <PersonCard label="Sağ" person={match.right} />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={pending}
                onClick={() => decide(match.id, 'accept')}
                className="rounded-xl bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-50"
              >
                Birleştir (kabul)
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => decide(match.id, 'reject')}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Reddet
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
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
