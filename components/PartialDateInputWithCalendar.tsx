import React, { useState, useEffect } from 'react'
import { Calendar } from 'lucide-react'
import { DayPicker } from 'react-day-picker'

type PartialDateMode = 'flexible' | 'fullOnly'

type PartialDateInputProps = {
  name: string
  value: string
  onChange: (value: string, name: string) => void
  mode?: PartialDateMode
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
  mode = 'flexible'
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
      <span>/</span>
      <input type="number"
          value={month}
          onChange={(e) => { setMonth(e.target.value) }}
          onBlur={() => {
            const padded = month ? month.padStart(2, '0') : ''
            if (padded !== month) setMonth(padded)
            // handleUpdate(year, padded, day)
          }}
          placeholder="mm"
          className="numeric-field w-12 sm:w-15 border p-1"
          disabled={mode === 'fullOnly'} />
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
      <button>
        <Calendar size={16} 
            onClick={() => setShowCalendar(true)}/>
      </button>
      {showCalendar && (
        <div className="absolute mb-2 z-50 bg-white shadow p-2">
            <div className="flex justify-end">
              <button
                onClick={() => setShowCalendar(false)}
                className="text-gray-500 hover:text-black" >
                ✕
              </button>
            </div>
            <CalendarOnly
                selected={new Date(value)}
                onSelect={handleSelectDate} />
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
          selected={selected}
          onSelect={onSelect} />
    </div>
  )
}

export default PartialDateInputWithCalendar
