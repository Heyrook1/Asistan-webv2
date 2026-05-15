'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import type { User, Provider } from '@/lib/types'

interface SettingsFormProps {
  user: User | null
  provider: Provider | null
  userId: string
}

export function SettingsForm({ user, provider, userId }: SettingsFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  // User form state
  const [userForm, setUserForm] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
  })

  // Provider form state
  const [providerForm, setProviderForm] = useState({
    business_name: provider?.business_name || '',
    business_description: provider?.business_description || '',
    address: provider?.address || '',
    city: provider?.city || '',
    district: provider?.district || '',
    phone: provider?.phone || '',
    website: provider?.website || '',
    instagram: provider?.instagram || '',
  })

  async function saveUserProfile(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('users')
        .update({
          full_name: userForm.full_name,
          phone: userForm.phone,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)

      if (error) throw error

      toast.success('Profil güncellendi')
      router.refresh()
    } catch (error) {
      toast.error('Güncelleme başarısız')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  async function saveProviderProfile(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()

      if (provider) {
        // Update existing provider
        const { error } = await supabase
          .from('providers')
          .update({
            ...providerForm,
            updated_at: new Date().toISOString(),
          })
          .eq('id', provider.id)

        if (error) throw error
      } else {
        // Create new provider
        const { error } = await supabase
          .from('providers')
          .insert({
            user_id: userId,
            ...providerForm,
          })

        if (error) throw error
      }

      toast.success('İşletme bilgileri güncellendi')
      router.refresh()
    } catch (error) {
      toast.error('Güncelleme başarısız')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Tabs defaultValue="profile" className="space-y-6">
      <TabsList>
        <TabsTrigger value="profile">Profil</TabsTrigger>
        <TabsTrigger value="business">İşletme</TabsTrigger>
      </TabsList>

      <TabsContent value="profile">
        <Card>
          <CardHeader>
            <CardTitle>Profil Bilgileri</CardTitle>
            <CardDescription>
              Kişisel bilgilerinizi güncelleyin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={saveUserProfile} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Ad Soyad</Label>
                  <Input
                    id="full_name"
                    value={userForm.full_name}
                    onChange={(e) => setUserForm({ ...userForm, full_name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefon</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={userForm.phone}
                    onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                    placeholder="5XX XXX XX XX"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-posta</Label>
                <Input
                  id="email"
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  E-posta adresi değiştirilemez
                </p>
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Kaydediliyor...
                    </>
                  ) : (
                    'Kaydet'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="business">
        <Card>
          <CardHeader>
            <CardTitle>İşletme Bilgileri</CardTitle>
            <CardDescription>
              İşletmenizin bilgilerini güncelleyin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={saveProviderProfile} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="business_name">İşletme Adı</Label>
                <Input
                  id="business_name"
                  value={providerForm.business_name}
                  onChange={(e) => setProviderForm({ ...providerForm, business_name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="business_description">Açıklama</Label>
                <Textarea
                  id="business_description"
                  value={providerForm.business_description}
                  onChange={(e) => setProviderForm({ ...providerForm, business_description: e.target.value })}
                  rows={3}
                  placeholder="İşletmeniz hakkında kısa bir açıklama..."
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="city">Şehir</Label>
                  <Input
                    id="city"
                    value={providerForm.city}
                    onChange={(e) => setProviderForm({ ...providerForm, city: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="district">İlçe</Label>
                  <Input
                    id="district"
                    value={providerForm.district}
                    onChange={(e) => setProviderForm({ ...providerForm, district: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Adres</Label>
                <Textarea
                  id="address"
                  value={providerForm.address}
                  onChange={(e) => setProviderForm({ ...providerForm, address: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="business_phone">İşletme Telefonu</Label>
                  <Input
                    id="business_phone"
                    type="tel"
                    value={providerForm.phone}
                    onChange={(e) => setProviderForm({ ...providerForm, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Web Sitesi</Label>
                  <Input
                    id="website"
                    type="url"
                    value={providerForm.website}
                    onChange={(e) => setProviderForm({ ...providerForm, website: e.target.value })}
                    placeholder="https://"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram</Label>
                <Input
                  id="instagram"
                  value={providerForm.instagram}
                  onChange={(e) => setProviderForm({ ...providerForm, instagram: e.target.value })}
                  placeholder="@kullanici_adi"
                />
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Kaydediliyor...
                    </>
                  ) : (
                    'Kaydet'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
