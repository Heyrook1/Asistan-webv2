import { decideIdentityMatch, listPendingIdentityMatches } from '@/lib/actions/identity-matches'
import { IdentityMatchBoard } from './identity-match-board'

export const dynamic = 'force-dynamic'

export default async function IdentityMatchesPage() {
  const matches = await listPendingIdentityMatches()

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-4 md:p-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Kimlik eşleşmeleri</h1>
        <p className="max-w-2xl text-sm text-slate-600">
          Zayıf sinyalde otomatik birleştirme yapılmaz. Burada önerilen Person eşleşmelerini onaylayın
          veya reddedin (KVKK / PHI birleştirme kontrolü).
        </p>
      </header>
      <IdentityMatchBoard initialMatches={matches} decideAction={decideIdentityMatch} />
    </div>
  )
}
