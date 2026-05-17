'use client'

import { Card, CardContent } from '@/components/ui/card'

export default function AyarlarPage() {
  return <div className="space-y-4"><h1 className="text-2xl font-bold text-[#0C1D36]">Ayarlar</h1><Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Profil ve işletme ayarları için kalıcı yerel durum altyapısı hazırlandı. Bu ekranı Supabase ayarlarıyla genişletebilirsiniz.</p></CardContent></Card></div>
}
