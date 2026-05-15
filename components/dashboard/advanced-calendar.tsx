'use client'

import { Fragment, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { Appointment } from '@/lib/types'

type View = 'gunluk' | 'haftalik' | 'aylik'

type Event = { id: string; title: string; day: number; slot: number; duration: number; color: string; staff: string }

interface AdvancedCalendarProps {
  providerId: string
  initialAppointments: Appointment[]
  canEdit: boolean
}

const slots = Array.from({ length: 12 }, (_, i) => i + 8)
const weekDays = ['Pzt', 'Sal', 'Car', 'Per', 'Cum', 'Cmt', 'Paz']

export function AdvancedCalendar({ providerId, initialAppointments, canEdit }: AdvancedCalendarProps) {
  const [view, setView] = useState<View>('haftalik')
  const [teamFilter, setTeamFilter] = useState('Tum Ekip')
  const [events, setEvents] = useState<Event[]>(
    initialAppointments.map((apt) => ({
      id: apt.id,
      title: apt.service?.name || 'Randevu',
      day: (new Date(apt.appointment_date).getDay() + 6) % 7,
      slot: Number(apt.start_time.split(':')[0]),
      duration: Math.max(1, Math.round((Number(apt.end_time.split(':')[0]) - Number(apt.start_time.split(':')[0])) || 1)),
      color: 'bg-[#12C8AD]/20 border-[#12C8AD]/50',
      staff: 'Doktor A',
    }))
  )
  const [dragId, setDragId] = useState<string | null>(null)

  const busyDay = useMemo(() => {
    const counts = weekDays.map((_, idx) => events.filter((e) => e.day === idx).length)
    const max = Math.max(0, ...counts)
    const index = counts.indexOf(max)
    return max === 0 ? null : weekDays[index]
  }, [events])

  function addAppointment(day: number, slot: number) {
    if (!canEdit) return
    setEvents((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        title: 'Yeni Randevu',
        day,
        slot,
        duration: 1,
        color: 'bg-[#12C8AD]/20 border-[#12C8AD]/50',
        staff: 'Doktor A',
      },
    ])
  }

  async function moveEvent(targetDay: number, targetSlot: number) {
    if (!dragId) return
    const prev = events
    setEvents((prev) => prev.map((e) => (e.id === dragId ? { ...e, day: targetDay, slot: targetSlot } : e)))
    const supabase = createClient()
    const targetDate = new Date()
    const diff = targetDay - ((targetDate.getDay() + 6) % 7)
    targetDate.setDate(targetDate.getDate() + diff)
    const dateStr = targetDate.toISOString().split('T')[0]
    const timeStr = `${String(targetSlot).padStart(2, '0')}:00:00`
    const { error } = await supabase
      .from('appointments')
      .update({ appointment_date: dateStr, start_time: timeStr })
      .eq('id', dragId)
      .eq('provider_id', providerId)
    if (error) {
      setEvents(prev)
      toast.error('Tasimada hata olustu, eski haline alindi')
    }
    setDragId(null)
  }

  async function resizeEvent(id: string, delta: number) {
    if (!canEdit) return
    const snapshot = events
    const target = events.find((e) => e.id === id)
    if (!target) return
    const nextDuration = Math.max(1, Math.min(4, target.duration + delta))
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, duration: nextDuration } : e)))
    const supabase = createClient()
    const endHour = Math.min(23, target.slot + nextDuration)
    const { error } = await supabase
      .from('appointments')
      .update({ end_time: `${String(endHour).padStart(2, '0')}:00:00` })
      .eq('id', id)
      .eq('provider_id', providerId)
    if (error) {
      setEvents(snapshot)
      toast.error('Sure guncellenemedi, geri alindi')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#0C1D36]">Takvim</h1>
          <p className="text-sm text-muted-foreground">Surukle-birak, saat uzatma ve ekip filtresiyle dinamik planlama.</p>
        </div>
        <div className="flex gap-2">
          {(['gunluk', 'haftalik', 'aylik'] as View[]).map((v) => (
            <Button key={v} variant={view === v ? 'default' : 'outline'} onClick={() => setView(v)} className={view === v ? 'bg-[#12C8AD] hover:bg-[#10b49c]' : ''}>{v === 'gunluk' ? 'Gunluk' : v === 'haftalik' ? 'Haftalik' : 'Aylik'}</Button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Bos Saatler</p><p className="text-xl font-bold">{Math.max(0, 84 - events.length)}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Yogun Gun</p><p className="text-xl font-bold">{busyDay || 'Henuz yok'}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Akilli Oneri</p><p className="text-sm font-semibold">Yarin 3 bos saat var</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Planlama Alani</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline">Ekip Filtresi</Badge>
            <select value={teamFilter} onChange={(e) => setTeamFilter(e.target.value)} className="rounded-md border bg-background px-2 py-1 text-sm">
              <option>Tum Ekip</option>
              <option>Doktor A</option>
              <option>Sekreter B</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          {view === 'aylik' ? (
            <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">Aylik gorunumde gun hucrelerine tiklayarak randevu ekleyin.</div>
          ) : (
            <div className="overflow-x-auto">
              <div className="min-w-[900px]">
                <div className="grid grid-cols-8 gap-1">
                  <div className="p-2 text-xs text-muted-foreground">Saat</div>
                  {weekDays.map((d) => <div key={d} className="p-2 text-xs font-semibold">{d}</div>)}
                  {slots.map((slot) => (
                    <Fragment key={`row-${slot}`}>
                      <div key={`label-${slot}`} className="p-2 text-xs text-muted-foreground">{slot}:00</div>
                      {weekDays.map((_, day) => {
                        const dayEvents = events.filter((e) => e.day === day && e.slot === slot && (teamFilter === 'Tum Ekip' || e.staff === teamFilter))
                        return (
                          <div
                            key={`${day}-${slot}`}
                            className="min-h-14 rounded-md border bg-secondary/20 p-1"
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={() => moveEvent(day, slot)}
                            onClick={() => addAppointment(day, slot)}
                          >
                            {dayEvents.length === 0 ? <div className="h-full rounded border border-dashed border-[#12C8AD]/20" /> : null}
                            {dayEvents.map((ev) => (
                              <div
                                key={ev.id}
                                draggable
                                onDragStart={() => setDragId(ev.id)}
                                className={`rounded border px-2 py-1 text-xs ${ev.color}`}
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <span>{ev.title}</span>
                                  <span className="flex gap-1">
                                    <button onClick={(e) => { e.stopPropagation(); resizeEvent(ev.id, -1) }}>-</button>
                                    <button onClick={(e) => { e.stopPropagation(); resizeEvent(ev.id, 1) }}>+</button>
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )
                      })}
                    </Fragment>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
