'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Star, MessageSquare, Loader2 } from 'lucide-react'
import type { Review } from '@/lib/types'
import { formatDate, formatTimeAgo } from '@/lib/format'

interface ReviewsListProps {
  reviews: Review[]
  providerId: string
}

export function ReviewsList({ reviews, providerId }: ReviewsListProps) {
  const router = useRouter()
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [loading, setLoading] = useState(false)

  async function submitReply(reviewId: string) {
    if (!replyText.trim()) return
    setLoading(true)

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('reviews')
        .update({
          provider_response: replyText,
          responded_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', reviewId)
        .eq('provider_id', providerId)

      if (error) throw error

      toast.success('Yanıt gönderildi')
      setReplyingTo(null)
      setReplyText('')
      router.refresh()
    } catch (error) {
      toast.error('Yanıt gönderilemedi')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  if (reviews.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Star className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Henüz Değerlendirme Yok</h3>
          <p className="text-muted-foreground text-center max-w-sm">
            Müşterileriniz randevu tamamladığında değerlendirme bırakabilirler.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => {
        const customerName = review.customer?.user?.full_name || 'Müşteri'
        const initials = customerName
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()

        return (
          <Card key={review.id}>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-primary text-sm">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold">{customerName}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${
                                star <= review.rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {formatTimeAgo(review.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {review.comment && (
                    <p className="mt-3 text-sm">{review.comment}</p>
                  )}

                  {/* Provider Response */}
                  {review.provider_response ? (
                    <div className="mt-4 pl-4 border-l-2 border-primary/20">
                      <p className="text-sm font-medium text-primary">Yanıtınız</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {review.provider_response}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {review.responded_at && formatDate(review.responded_at)}
                      </p>
                    </div>
                  ) : (
                    <>
                      {replyingTo === review.id ? (
                        <div className="mt-4 space-y-2">
                          <Textarea
                            placeholder="Yanıtınızı yazın..."
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            rows={3}
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => submitReply(review.id)}
                              disabled={loading || !replyText.trim()}
                            >
                              {loading ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                  Gönderiliyor...
                                </>
                              ) : (
                                'Gönder'
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setReplyingTo(null)
                                setReplyText('')
                              }}
                            >
                              Vazgeç
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-3"
                          onClick={() => setReplyingTo(review.id)}
                        >
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Yanıtla
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
