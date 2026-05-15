'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Loader2, Plus, X } from 'lucide-react'
import type { CalendarAvailability } from '@/lib/types'
import { dayOfWeekLabels } from '@/lib/types'

interface AvailabilityEditorProps {
  availability: CalendarAvailability[]
  providerId: string
}

interface DaySchedule {
  dayOfWeek: number
  isOpen: boolean
  slots: { id?: string; startTime: string; endTime: string }[]
}

export function AvailabilityEditor({ availability, providerId }: AvailabilityEditorProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  // Initialize schedule from availability data
  const initializeSchedule = (): DaySchedule[] => {
    return [0, 1, 2, 3, 4, 5, 6].map((dayOfWeek) => {
      const daySlots = availability.filter((a) => a.day_of_week === dayOfWeek)
      return {
        dayOfWeek,
        isOpen: daySlots.length > 0 && daySlots.some((s) => s.is_available),
        slots: daySlots.length > 0
          ? daySlots.map((s) => ({
              id: s.id,
              startTime: s.start_time.slice(0, 5),
              endTime: s.end_time.slice(0, 5),
            }))
          : [{ startTime: '09:00', endTime: '17:00' }],
      }
    })
  }

  const [schedule, setSchedule] = useState<DaySchedule[]>(initializeSchedule)

  function toggleDay(dayOfWeek: number) {
    setSchedule((prev) =>
      prev.map((day) =>
        day.dayOfWeek === dayOfWeek
          ? { ...day, isOpen: !day.isOpen }
          : day
      )
    )
  }

  function updateSlot(dayOfWeek: number, slotIndex: number, field: 'startTime' | 'endTime', value: string) {
    setSchedule((prev) =>
      prev.map((day) =>
        day.dayOfWeek === dayOfWeek
          ? {
              ...day,
              slots: day.slots.map((slot, i) =>
                i === slotIndex ? { ...slot, [field]: value } : slot
              ),
            }
          : day
      )
    )
  }

  function addSlot(dayOfWeek: number) {
    setSchedule((prev) =>
      prev.map((day) =>
        day.dayOfWeek === dayOfWeek
          ? { ...day, slots: [...day.slots, { startTime: '09:00', endTime: '17:00' }] }
          : day
      )
    )
  }

  function removeSlot(dayOfWeek: number, slotIndex: number) {
    setSchedule((prev) =>
      prev.map((day) =>
        day.dayOfWeek === dayOfWeek
          ? { ...day, slots: day.slots.filter((_, i) => i !== slotIndex) }
          : day
      )
    )
  }

  async function saveSchedule() {
    setLoading(true)

    try {
      const supabase = createClient()

      // Delete existing availability for this provider
      await supabase
        .from('calendar_availability')
        .delete()
        .eq('provider_id', providerId)

      // Insert new availability
      const newSlots = schedule
        .filter((day) => day.isOpen)
        .flatMap((day) =>
          day.slots.map((slot) => ({
            provider_id: providerId,
            day_of_week: day.dayOfWeek,
            start_time: slot.startTime,
            end_time: slot.endTime,
            is_available: true,
          }))
        )

      if (newSlots.length > 0) {
        const { error } = await supabase
          .from('calendar_availability')
          .insert(newSlots)

        if (error) throw error
      }

      toast.success('Müsaitlik ayarları kaydedildi')
      router.refresh()
    } catch (error) {
      toast.error('Kaydetme başarısız')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  // Reorder days to start from Monday (1) and end with Sunday (0)
  const orderedDays = [1, 2, 3, 4, 5, 6, 0]

  return (
    <div className="space-y-4">
      {orderedDays.map((dayOfWeek) => {
        const day = schedule.find((d) => d.dayOfWeek === dayOfWeek)!
        
        return (
          <Card key={dayOfWeek}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{dayOfWeekLabels[dayOfWeek]}</CardTitle>
                <Switch
                  checked={day.isOpen}
                  onCheckedChange={() => toggleDay(dayOfWeek)}
                />
              </div>
              {!day.isOpen && (
                <CardDescription>Kapalı</CardDescription>
              )}
            </CardHeader>
            {day.isOpen && (
              <CardContent className="space-y-3">
                {day.slots.map((slot, slotIndex) => (
                  <div key={slotIndex} className="flex items-center gap-2">
                    <Input
                      type="time"
                      value={slot.startTime}
                      onChange={(e) => updateSlot(dayOfWeek, slotIndex, 'startTime', e.target.value)}
                      className="w-auto"
                    />
                    <span className="text-muted-foreground">-</span>
                    <Input
                      type="time"
                      value={slot.endTime}
                      onChange={(e) => updateSlot(dayOfWeek, slotIndex, 'endTime', e.target.value)}
                      className="w-auto"
                    />
                    {day.slots.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeSlot(dayOfWeek, slotIndex)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addSlot(dayOfWeek)}
                  className="mt-2"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Zaman Dilimi Ekle
                </Button>
              </CardContent>
            )}
          </Card>
        )
      })}

      <div className="flex justify-end pt-4">
        <Button onClick={saveSchedule} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Kaydediliyor...
            </>
          ) : (
            'Değişiklikleri Kaydet'
          )}
        </Button>
      </div>
    </div>
  )
}
