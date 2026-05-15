'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Users, Phone, Mail, Calendar } from 'lucide-react'
import type { Customer } from '@/lib/types'
import { formatPhone } from '@/lib/format'

interface CustomersListProps {
  customers: Customer[]
  stats: Record<string, { total: number; completed: number }>
}

export function CustomersList({ customers, stats }: CustomersListProps) {
  if (customers.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Users className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Henüz Müşteri Yok</h3>
          <p className="text-muted-foreground text-center max-w-sm">
            Randevu aldığınızda müşterileriniz burada görünecek.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {customers.map((customer) => {
        const customerName = customer.user?.full_name || 'Müşteri'
        const initials = customerName
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
        const customerStats = stats[customer.id] || { total: 0, completed: 0 }

        return (
          <Card key={customer.id}>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{customerName}</h3>
                  
                  <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                    {customer.user?.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5" />
                        <span className="truncate">{customer.user.email}</span>
                      </div>
                    )}
                    {customer.user?.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5" />
                        <span>{formatPhone(customer.user.phone)}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      <Calendar className="h-3 w-3 mr-1" />
                      {customerStats.total} randevu
                    </Badge>
                    {customerStats.completed > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {customerStats.completed} tamamlanan
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {customer.notes && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">Not:</span> {customer.notes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
