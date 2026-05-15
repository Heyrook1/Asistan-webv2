'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, ChevronDown } from 'lucide-react'

const DAY_LABELS = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cts', 'Paz']
const MONTH_NAMES = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
]

type DayDot = 'appointment' | 'pending' | 'available'

export function MiniCalendar() {
  const today = new Date()
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1))

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  // Monday-based: 0 = Mon, 6 = Sun
  const startDayIndex = (firstDay.getDay() + 6) % 7

  // Days from previous month
  const prevLastDay = new Date(year, month, 0).getDate()
  const prevMonthDays: number[] = []
  for (let i = startDayIndex - 1; i >= 0; i--) prevMonthDays.push(prevLastDay - i)

  // Days from next month to fill to 42 cells (6 weeks)
  const totalCells = 42
  const nextMonthDays: number[] = []
  const usedCells = prevMonthDays.length + daysInMonth
  for (let i = 1; i <= totalCells - usedCells; i++) nextMonthDays.push(i)

  const isCurrentMonth =
    today.getFullYear() === year && today.getMonth() === month
  const todayDate = today.getDate()

  // Demo: mark certain days with dots
  const dotMap: Record<number, DayDot> = {
    11: 'appointment',
    12: 'appointment',
    13: 'appointment',
    18: 'appointment',
    19: 'appointment',
    20: 'appointment',
    21: 'pending',
    24: 'appointment',
    25: 'pending',
    26: 'available',
    27: 'appointment',
  }

  const dotColor: Record<DayDot, string> = {
    appointment: 'bg-[#12C8AD]',
    pending:     'bg-orange-400',
    available:   'bg-[#16A9E8]',
  }

  function previousMonth() {
    setViewDate(new Date(year, month - 1, 1))
  }
  function nextMonth() {
    setViewDate(new Date(year, month + 1, 1))
  }
  function goToday() {
    setViewDate(new Date(today.getFullYear(), today.getMonth(), 1))
  }

  return (
    <div className="rounded-2xl border border-border/50 bg-white shadow-sm h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <h3 className="text-sm font-bold text-[#0C1D36]">Takvim</h3>
        <div className="flex items-center gap-1">
          <button
            onClick={previousMonth}
            className="h-7 w-7 inline-flex items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary/60 transition-colors"
            aria-label="Önceki ay"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={goToday}
            className="h-7 px-2.5 text-xs font-medium text-muted-foreground hover:bg-secondary/60 rounded-lg transition-colors"
          >
            Bugün
          </button>
          <button
            onClick={nextMonth}
            className="h-7 w-7 inline-flex items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary/60 transition-colors"
            aria-label="Sonraki ay"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <button className="h-7 w-7 inline-flex items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary/60 transition-colors ml-1">
            <CalendarIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Month label */}
      <button className="mx-5 mb-2 flex items-center gap-1.5 text-[15px] font-semibold text-[#0C1D36] hover:text-[#12C8AD] transition-colors w-fit">
        {MONTH_NAMES[month]} {year}
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </button>

      {/* Day labels */}
      <div className="grid grid-cols-7 px-5 pb-1.5">
        {DAY_LABELS.map((d) => (
          <div key={d} className="text-center text-[11px] font-medium text-muted-foreground/70 py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-y-0.5 px-3 pb-3 flex-1">
        {prevMonthDays.map((d, i) => (
          <DayCell key={`p-${i}`} day={d} muted />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => (
          <DayCell
            key={`c-${d}`}
            day={d}
            isToday={isCurrentMonth && d === todayDate}
            dot={dotMap[d]}
          />
        ))}
        {nextMonthDays.map((d, i) => (
          <DayCell key={`n-${i}`} day={d} muted />
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 px-5 py-3 border-t border-border/40">
        <LegendItem color="bg-[#12C8AD]" label="Randevu" />
        <LegendItem color="bg-orange-400" label="Bekleyen" />
        <LegendItem color="bg-[#16A9E8]" label="Müsait" />
      </div>
    </div>
  )

  function DayCell({
    day, isToday, muted, dot,
  }: { day: number; isToday?: boolean; muted?: boolean; dot?: DayDot }) {
    return (
      <button
        type="button"
        className={[
          'group relative flex flex-col items-center justify-center h-9 w-full rounded-lg text-[12.5px] font-medium transition-colors',
          muted
            ? 'text-muted-foreground/30'
            : isToday
              ? 'bg-[#12C8AD] text-white shadow-[0_4px_12px_-2px_rgba(18,200,173,0.5)]'
              : 'text-[#0C1D36] hover:bg-secondary/60',
        ].join(' ')}
      >
        <span>{day}</span>
        {dot && !isToday && !muted && (
          <span className={`absolute bottom-[3px] h-1 w-1 rounded-full ${dotColor[dot]}`} />
        )}
      </button>
    )
  }
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`h-1.5 w-1.5 rounded-full ${color}`} />
      <span className="text-[11px] text-muted-foreground">{label}</span>
    </div>
  )
}
