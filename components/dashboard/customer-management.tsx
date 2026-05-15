'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

type Customer = {
  id: string
  name: string
  phone: string
  email: string
  notes: string
  tags: string[]
}

interface CustomerManagementProps {
  initialCustomers: Customer[]
}

export function CustomerManagement({ initialCustomers }: CustomerManagementProps) {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers)
  const [selected, setSelected] = useState<Customer | null>(null)
  const [activeTab, setActiveTab] = useState('Genel Bilgi')

  async function addMockCustomer() {
    const name = `Yeni Musteri ${customers.length + 1}`
    const email = `musteri${Date.now()}@ornek.com`
    const supabase = createClient()
    const userId = crypto.randomUUID()
    const { error: userError } = await supabase.from('users').insert({
      id: userId,
      email,
      full_name: name,
      role: 'customer',
      is_active: true,
    })
    if (userError) {
      toast.error('Musteri eklenemedi')
      return
    }
    const { data: customerRow, error: customerError } = await supabase.from('customers').insert({ user_id: userId }).select('*').single()
    if (customerError || !customerRow) {
      toast.error('Hasta profili olusturulamadi')
      return
    }
    const customer: Customer = { id: customerRow.id, name, phone: '-', email, notes: '', tags: ['Yeni Hasta'] }
    setCustomers((prev) => [customer, ...prev])
    toast.success('Musteri eklendi')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0C1D36]">Musteriler / Hastalar</h1>
          <p className="text-sm text-muted-foreground">Tum musteri kayitlari, gecmis ve klinik dokumantasyon burada.</p>
        </div>
        <Button onClick={addMockCustomer} className="bg-[#12C8AD] text-white hover:bg-[#10b49c]">Musteri Ekle</Button>
      </div>

      <Card>
        <CardHeader><CardTitle>Musteri Kartlari</CardTitle></CardHeader>
        <CardContent>
          {customers.length === 0 ? (
            <div className="rounded-xl border border-dashed p-10 text-center">
              <p className="font-medium">Henuz musteri yok</p>
              <p className="text-sm text-muted-foreground mt-1">Ilk hasta kaydini olusturarak timeline takibini baslatin.</p>
              <Button onClick={addMockCustomer} className="mt-4 bg-[#12C8AD] text-white hover:bg-[#10b49c]">Ilk Musteriyi Ekle</Button>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {customers.map((c) => (
                <button key={c.id} onClick={() => setSelected(c)} className="rounded-xl border p-4 text-left transition hover:-translate-y-1 hover:shadow-sm">
                  <p className="font-semibold">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.phone}</p>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader><DialogTitle>{selected?.name || 'Musteri Profili'}</DialogTitle></DialogHeader>
          <div className="flex flex-wrap gap-2">
            {['Genel Bilgi', 'Randevular', 'Notlar', 'Tahliller', 'Tedaviler', 'Dosyalar'].map((t) => (
              <Button key={t} size="sm" variant={activeTab === t ? 'default' : 'outline'} onClick={() => setActiveTab(t)} className={activeTab === t ? 'bg-[#12C8AD] hover:bg-[#10b49c]' : ''}>{t}</Button>
            ))}
          </div>

          {activeTab === 'Genel Bilgi' && (
            <div className="space-y-3 rounded-xl border p-4">
              <p><span className="font-semibold">Telefon:</span> {selected?.phone || '-'}</p>
              <p><span className="font-semibold">E-posta:</span> {selected?.email || '-'}</p>
              <p><span className="font-semibold">Not:</span> {selected?.notes || 'Not yok'}</p>
              <div className="flex flex-wrap gap-2">{(selected?.tags || ['Yeni Hasta']).map((x) => <Badge key={x}>{x}</Badge>)}</div>
            </div>
          )}

          {activeTab !== 'Genel Bilgi' && (
            <div className="rounded-xl border p-4">
              <p className="text-sm text-muted-foreground">{activeTab} icerigi yakinda canli verilerle doldurulacak.</p>
              <div className="mt-4 space-y-2">
                {['08:30 - Kayit acildi', '10:00 - Doktor notu eklendi', '14:20 - Dosya yuklendi'].map((line) => (
                  <div key={line} className="rounded-lg bg-secondary/50 p-2 text-sm">{line}</div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
