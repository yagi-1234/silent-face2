import React, { useState, useEffect } from 'react'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { DayPicker } from 'react-day-picker'

import { formatDateTime } from '@/utils/dateFormat'

type PartialDateMode = 'flexible' | 'fullOnly'

type PartialDateInputProps = {
  name: string
  value: string
  onChange: (value: string, name: string) => void
  mode?: PartialDateMode
  scope?: string
}

const parseDate = (value: string) => {
  const delimiter = value.includes('/') ? '/' : '-'
  const [y, m = '', d = ''] = value.split(delimiter)
  return {
    year: y || '',
    month: m,
    day: d,
  }
}

const formatDate = (year: string, month?: string, day?: string) => {
  const pad = (v: string) => v.padStart(2, '0')
  if (!year) return ''
  if (year && !month) return `${year}`
  if (year && month && !day) return `${year}/${pad(month)}`
  return `${year}-${pad(month || '')}-${pad(day || '')}`
}

const PartialDateInputWithCalendar: React.FC<PartialDateInputProps> = ({
  name,
  value,
  onChange,
  mode = 'flexible',
  scope = 'ymd'
}) => {
  const [year, setYear] = useState('')
  const [month, setMonth] = useState('')
  const [day, setDay] = useState('')
  const [showCalendar, setShowCalendar] = useState<boolean>(false)

  useEffect(() => {
    const { year, month, day } = parseDate(value)
    setYear(year)
    setMonth(month)
    setDay(day)
  }, [value])

  const handleUpdate = (newYear: string, newMonth: string, newDay: string) => {
    const newValue = formatDate(newYear, newMonth, newDay)
    onChange(newValue, name)
  }

  const handleSelectDate = (date?: Date) => {
    if (!date) return
    handleUpdate(date.getFullYear().toString(), (date.getMonth() + 1).toString(), date.getDate().toString())
    setShowCalendar(false)
  }

  return (
    <div className="flex items-center space-x-2">
      <input type="number"
          value={year}
          onChange={(e) => { setYear(e.target.value) }}
          placeholder="yyyy"
          className="numeric-field w-16 sm:w-20 border p-1" />
      {(scope === 'ym' || scope === 'ymd')&& (
        <>
          <span>/</span>
          <input type="number"
              value={month}
              onChange={(e) => { setMonth(e.target.value) }}
              onBlur={() => {
                const padded = month ? month.padStart(2, '0') : ''
                if (padded !== month) setMonth(padded)
                if (scope === 'ym') handleUpdate(year, padded, day)
              }}
              placeholder="mm"
              className="numeric-field w-12 sm:w-15 border p-1"
              disabled={mode === 'fullOnly'} />
        </>
      )}
      {scope === 'ymd' && (
        <>
          <span>/</span>
          <input type="number"
              value={day}
              onChange={(e) => { setDay(e.target.value) }}
              onBlur={() => {
                const padded = day ? day.padStart(2, '0') : ''
                if (padded !== day) setDay(padded)
                handleUpdate(year, month, day)
              }}
              placeholder="dd"
              className="numeric-field w-12 sm:w-15 border p-1"
              disabled={mode === 'fullOnly'} />
        </>
      )}
      <button>
        <Calendar size={16} 
            onClick={() => setShowCalendar(true)}/>
      </button>
      {showCalendar && (
        <div className="absolute mb-2 z-50 bg-white shadow p-2">
          <div>
            <DatePicker
                scope={scope}
                selected={new Date(value)}
                onSelect={handleSelectDate} />
          </div>
        </div>
      )}
    </div>
  )
}

type Props = {
  selected?: Date
  onSelect: (date: Date | undefined) => void
}

export function CalendarOnly({ selected, onSelect }: Props) {
  return (
    <div>
      <DayPicker
          mode="single"
          selected={selected ?? new Date()}
          onSelect={onSelect} />
    </div>
  )
}

export default PartialDateInputWithCalendar

interface DatePickerProps {
  scope: string
  selected: Date
  onSelect?: (date: Date) => void
}

const DatePicker = ({ scope, selected, onSelect }: DatePickerProps) => {
  
  const weekNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const [selectedDate, setSelectedDate] = useState<Date>(formatDateTime(selected, 'yyyy') ? selected : new Date())
  const [displayMonth, setDisplayMonth] = useState<Date>(
    new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
  )

  const firstDay = new Date(
    displayMonth.getFullYear(), displayMonth.getMonth(), 1
  ).getDay()
  const startDay = firstDay % 7
  const daysInMonth = new Date(
    displayMonth.getFullYear(), displayMonth.getMonth() + 1, 0
  ).getDate()

  const isToday = (day: number) => {
    const today = new Date()
    return (
      today.getFullYear() === displayMonth.getFullYear() &&
      today.getMonth() === displayMonth.getMonth() &&
      today.getDate() === day
    )
  }
  const isThisMonth = (month: number) => {
    const today = new Date()
    return (
      today.getFullYear() === displayMonth.getFullYear() &&
      today.getMonth() === month
    )
  }
  const isSelected = (month: number, day: number) => {
    return (
      selectedDate.getFullYear() === displayMonth.getFullYear() &&
      selectedDate.getMonth() === month &&
      selectedDate.getDate() === day
    )
  }

  const handlePrevYear = () => {
    setDisplayMonth(new Date(displayMonth.getFullYear() -1, 1, 1))
  }
  const handleNextYear = () => {
    setDisplayMonth(new Date(displayMonth.getFullYear() + 1, 1, 1))
  }
  const handlePrevMonth = () => {
    setDisplayMonth(new Date(displayMonth.getFullYear(), displayMonth.getMonth() - 1, 1))
  }
  const handleNextMonth = () => {
    setDisplayMonth(new Date(displayMonth.getFullYear(), displayMonth.getMonth() + 1, 1))
  }
  const handleToday = () => {
    setDisplayMonth(new Date())
  }

  const handleSelect = (day: number) => {
    const date = new Date(displayMonth.getFullYear(), displayMonth.getMonth(), day)
    setSelectedDate(date)
    onSelect?.(date)
  }
  const handleSelectMonth = (month: number) => {
    const date = new Date(displayMonth.getFullYear(), month - 1, 1)
    setSelectedDate(date)
    onSelect?.(date)
  }
  const handleClose = () => {
    onSelect?.(selectedDate)
  }

  return (
    <div className="w-72 rounded border bg-white p-3 shadow-lg">
      {scope === 'ymd' && (
        <>
          <div className="mb-3 flex items-center justify-between">
            <button className="p-1 hover:bg-gray"
                onClick={handlePrevMonth}>
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="font-semibold">{formatDateTime(displayMonth, 'MMMM yyyy')}</div>
            <button className="p-1 hover:bg-gray"
                onClick={handleNextMonth}>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <div className="mb-1 grid grid-cols-7 text-center text-sm">
            {weekNames.map(day => (
              <div key={day} className="font-semibold">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 text-center gap-1">
            {Array.from({ length: startDay }).map((_, index) => (
              <div key={`empty-${index}`} />
            ))}
            {Array.from({ length: daysInMonth }, (_, index) => index + 1).map(day => (
              <button key={day}
                  className={`h-6 w-6 rounded-full hover:bg-blue-200
                      ${isSelected(displayMonth.getMonth(), day)? 'border border-blue-500 bg-blue-100' : ''}
                      ${(isToday(day) && !isSelected(displayMonth.getMonth(), day)) ? 'border border-yellow-500 bg-yellow-100' : ''}`}
                  onClick={() => handleSelect(day)}>
                {day}
              </button>
            ))}
          </div>
        </>
      )}
      {scope === 'ym' && (
        <>
          <div className="mb-3 flex items-center justify-between">
            <button className="p-1 hover:bg-gray"
                onClick={handlePrevYear}>
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="font-semibold">{formatDateTime(displayMonth, 'yyyy')}</div>
            <button className="p-1 hover:bg-gray"
                onClick={handleNextYear}>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-4 text-center gap-1">
            {Array.from({ length: 12 }).map((_, index) => (
              <button key={`month-${index}`}
                  className={`h-6 rounded-full hover:bg-blue-200
                      ${isSelected(index, 1)? 'border border-blue-500 bg-blue-100' : ''}
                      ${(isThisMonth(index) && !isSelected(index, 1)) ? 'border border-yellow-500 bg-yellow-100' : ''}`}
                  onClick={() => handleSelectMonth(index + 1)}>
                {index + 1}
              </button>
            ))}
          </div>
        </>
      )}
      <div className="flex justify-between">
        <button className="button-back h-7 mb-0 text-sm"
            onClick={handleClose}>
          Close
        </button>
        <button className="button-normal h-7 mb-0 text-sm"
            onClick={handleToday}>
          Today
        </button>
      </div>
    </div>
  )
}
