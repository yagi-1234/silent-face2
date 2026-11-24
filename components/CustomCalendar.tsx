'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'

import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import type { EventItem } from '@/types/tasks/event-types'
import { formatDateTime } from '@/utils/dateFormat'

type CustomCalendarProps = {
  events: EventItem[]
  selectedMonth?: Date
  onSelectMonth: (selectedMonth: Date) => void
  onShowForm: (eventId: string, eventType: string) => void
}

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const formatDate = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export default function CustomCalendar({ events, onShowForm, selectedMonth = new Date(), onSelectMonth }: CustomCalendarProps) {

  const today = new Date()
  const [selectedDate, setSelectedDate] = useState(formatDate(today))
  const [hiddenNumber, setHiddenNumber] = useState<string>("")

  const lastDay = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0).getDate()

  const firstDayOfWeek = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1).getDay()

  const calendarDays = [
    ...Array(firstDayOfWeek).fill(null),
    ...Array.from({ length: lastDay }, (_, i) => i + 1)
  ]

  while (calendarDays.length % 7 !== 0) {
    calendarDays.push(null)
  }

  const changeMonth = (offset: number) => {
    onSelectMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + offset, 1))
  }
  const changeYearAndMonth = (year: number, month: number) => {
    onSelectMonth(new Date(year, month - 1, 1))
  }

  const monthLabel = formatDateTime(selectedMonth, 'MMMM yyyy')
  const currentYear = formatDateTime(selectedMonth, 'yyyy')
  const currentMonth = formatDateTime(selectedMonth, 'M')

  const getEventStyle = (eventType: string) => {
    let bgColor = 'bg-blue-100'
    const textColor = 'text-white'
    switch (eventType) {
      case '01': bgColor = 'bg-red-400'; break
      case '02': bgColor = 'bg-green-600'; break
      case '03': bgColor = 'bg-yellow-400'; break
      case '04': bgColor = 'bg-blue-400'; break
      case '05': bgColor = 'bg-orange-400'; break
      case '06': bgColor = 'bg-pink-400'; break
      case '07': bgColor = 'bg-yellow-600'; break
      case '08': bgColor = 'bg-purple-400'; break
      case '11': bgColor = 'bg-purple-600'; break
      case '23': bgColor = 'bg-gray-400'; break
      default: bgColor = 'bg-gray-600'; break
    }
    return `truncate rounded px-1 py-0.5 w-36 text-left text-xs ${bgColor} ${textColor}`
  }

const MonthList: { [key: number]: string | '' } = {
  1: "January",
  2: "February",
  3: "March",
  4: "April",
  5: "May",
  6: "June",
  7: "July",
  8: "August",
  9: "September",
  10: "October",
  11: "November",
  12: "December"
}

const YearList = Array.from({ length: Number(currentYear) - 2020 + 4 }, (_, i) => {
  const year = 2020 + i
  return { key: year, value: year.toString()}
})

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          <select
              id="currentMonth"
              name="currentMonth"
              className="w-36 mr-2"
              value={currentMonth}
              onChange={(e) => changeYearAndMonth(Number(currentYear), Number(e.target.value))} >
            {Object.entries(MonthList)
                .sort(([a], [b]) => Number(a) - Number(b))
                .map(([key, label]) => (<option key={key} value={key}>{label}</option>
            ))}
          </select>
          <select
              id="currentYear"
              name="currentYear"
              className="w-24"
              value={currentYear}
              onChange={(e) => changeYearAndMonth(Number(e.target.value), Number(currentMonth))} >
            {YearList.map(year => (
              <option key={year.key} value={year.value}>{year.value}</option>
            ))}
          </select>
        </h2>
        <div className="flex items-center gap-2">
          <input type="text"
              className="w-16 border-gray-50"
              value={hiddenNumber ?? ""}
              onChange={(e) => setHiddenNumber(e.target.value)} />
          <button
              className="button-normal w-16"
              onClick={() => onSelectMonth(new Date(today.getFullYear(), today.getMonth(), 1))}>
            Today
          </button>
          <button
              className="button-normal w-12"
              onClick={() => changeMonth(-1)}>
            <ChevronLeft size={18} />
          </button>
          <button
              className="button-normal w-12"
              onClick={() => changeMonth(1)}>
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 border-t border-l border-gray-200">
        {weekDays.map((day) => (
          <div key={day}
              className="border-b border-r border-gray-200 p-1 bg-blue-100 text-center text-semibold">
            {day}
          </div>
        ))}
        {calendarDays.map((day, index) => {
          if (day === null) {
            return (
              <div key={`empty-${index}`}
                  className="min-h-16 min-w-24 border-b border-r border-gray-200 bg-gray-50" />
            )
          }
          const date = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), day)
          const dateString = formatDate(date)
          const isToday = dateString === formatDate(today)
          const isSelected = dateString === selectedDate

          const dayEvents = events.filter((event) => formatDateTime(event.start_at, 'yyyy-MM-dd') === dateString && (event.event_type !== '23' || hiddenNumber === '423'))

          return (
            <div
                key={dateString}
                className={['min-h-16 min-w-24 border-b border-r border-gray-200 p-2 flex flex-col items-start justify-start transition-colors',
                    'hover:bg-gray-200',
                    isSelected ? 'bg-yellow-50' : 'bg-white'
                ].join(' ')}
                onClick={() => setSelectedDate(dateString)}>
              <span
                  className={[
                      'inline-flex h-7 w-7 items-center justify-center rounded-full text-sm',
                      isToday ? 'bg-blue-600 font-semibold text-white' : ''
                  ].join(' ')}>
                {day}
              </span>
              <div className="mt-1 space-y-1">
                {dayEvents.slice(0, 2).map((event) => (
                  <button key={event.event_id}
                      className={getEventStyle(event.event_type ?? '')}
                      onClick={() => onShowForm(event.event_id, event.event_type ?? '')}>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="truncate">
                            {event.start_time && `${event.start_time} `}
                            {event.event_name}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{event.start_time && `${event.start_time}`}</p>
                          <p>{event.event_name}</p>
                          <p>{event.event_name_2}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </button>
                ))}
                {/* {dayEvents.length > 3 && (
                  <div className="text-xs text-gray-500">
                    他 {dayEvents.length - 3} 件
                  </div>
                )} */}
              </div>
            </div>
          )
        })}
      </div>
      <div className="rounded-lg border border-gray-200 p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h3 className="font-semibold">
            {formatDateTime(selectedDate, 'yyyy/MM/dd')}
          </h3>
          <button
              className="button-save"
              onClick={() => onShowForm("", "")}>
            <Plus size={16} />
          </button>
        </div>
        {events.filter((event) => formatDateTime(event.start_at, 'yyyy-MM-dd') === selectedDate && (event.event_type !== '23' || hiddenNumber === '423')).length === 0 ? (
          <p className="text-gray-500">
            No Event
          </p>
        ) : (
          <ul className="space-y-2">
            {events.filter((event) => formatDateTime(event.start_at, 'yyyy-MM-dd') === selectedDate && (event.event_type !== '23' || hiddenNumber === '423')).map((event) => (
              <li key={event.event_id}
                  className="rounded bg-gray-100 px-3 py-2 text-sm">
                {event.start_time} {event.event_name} {event.event_name_2}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
