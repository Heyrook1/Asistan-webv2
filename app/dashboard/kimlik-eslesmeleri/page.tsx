import {
  decideIdentityMatch,
  listPendingIdentityMatches,
  listRecentIdentityMerges,
  undoIdentityMerge,
} from '@/lib/actions/identity-matches'
import { IdentityMatchBoard } from './identity-match-board'

export const dynamic = 'force-dynamic'

export default async function IdentityMatchesPage() {
  const [matches, recentMerges] = await Promise.all([
    listPendingIdentityMatches(),
    listRecentIdentityMerges(),
  ])

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-4 md:p-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Kimlik eşleşmeleri</h1>
        <p className="max-w-2xl text-sm text-slate-600">
          Düşük skorlu veya isim uyuşmayan öneriler birleştirilemez — yalnızca ret / inceleme.
          Birleştirme için alan karşılaştırması, sonuç özeti, onay ifadesi ve (orta güvende) işletme
          sahibi onayı gerekir; her kabul ledger’a yazılır ve geri alınabilir.
        </p>
      </header>
      <IdentityMatchBoard
        initialMatches={matches}
        recentMerges={recentMerges}
        decideAction={decideIdentityMatch}
        undoAction={undoIdentityMerge}
      />
    </div>
  )
}
