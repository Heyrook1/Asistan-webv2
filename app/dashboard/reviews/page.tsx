import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ReviewsList } from '@/components/dashboard/reviews-list'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Star } from 'lucide-react'
import type { Review, Provider } from '@/lib/types'

export const metadata = {
  title: 'Değerlendirmeler',
}

export default async function ReviewsPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  // Get provider
  const { data: provider } = await supabase
    .from('providers')
    .select('*')
    .eq('user_id', user.id)
    .single() as { data: Provider | null }

  if (!provider) {
    redirect('/dashboard')
  }

  // Fetch reviews
  const { data: reviews } = await supabase
    .from('reviews')
    .select(`
      *,
      customer:customers(*, user:users(*)),
      appointment:appointments(*, service:services(*))
    `)
    .eq('provider_id', provider.id)
    .eq('is_visible', true)
    .order('created_at', { ascending: false })

  // Calculate rating distribution
  const ratingCounts = [0, 0, 0, 0, 0]
  reviews?.forEach((review) => {
    ratingCounts[review.rating - 1]++
  })

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Değerlendirmeler</h1>
        <p className="text-muted-foreground">
          Müşteri geri bildirimlerini görüntüleyin
        </p>
      </div>

      {/* Rating Overview */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Ortalama Puan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="text-4xl font-bold">{provider.average_rating?.toFixed(1) || '0.0'}</div>
              <div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-5 w-5 ${
                        star <= Math.round(provider.average_rating || 0)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {provider.total_reviews || 0} değerlendirme
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Puan Dağılımı</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = ratingCounts[rating - 1]
              const percentage = reviews?.length ? (count / reviews.length) * 100 : 0

              return (
                <div key={rating} className="flex items-center gap-2">
                  <span className="text-sm w-8">{rating} ★</span>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-8">{count}</span>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>

      {/* Reviews List */}
      <ReviewsList 
        reviews={(reviews || []) as Review[]} 
        providerId={provider.id}
      />
    </div>
  )
}
