import React, { useState, useEffect } from 'react'

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

const PartialDateInput: React.FC<PartialDateInputProps> = ({
  name,
  value,
  onChange,
  mode = 'flexible'
}) => {
  const [year, setYear] = useState('')
  const [month, setMonth] = useState('')
  const [day, setDay] = useState('')

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

  return (
    <div className="flex items-center space-x-2">
      <input type="text"
          value={year}
          onChange={(e) => { setYear(e.target.value) }}
          placeholder="yyyy"
          className="w-20 border p-1" />
      <span>/</span>
      <input type="text"
          value={month}
          onChange={(e) => { setMonth(e.target.value) }}
          onBlur={() => {
            const padded = month.padStart(2, '0')
            if (padded !== month) setMonth(padded)
            // handleUpdate(year, padded, day)
          }}
          placeholder="mm"
          className="w-12 border p-1"
          disabled={mode === 'fullOnly'} />
      <span>/</span>
      <input type="text"
          value={day}
          onChange={(e) => { setDay(e.target.value) }}
          onBlur={() => {
            const padded = day.padStart(2, '0')
            if (padded !== day) setDay(padded)
            handleUpdate(year, month, day)
          }}
          placeholder="dd"
          className="w-12 border p-1"
          disabled={mode === 'fullOnly'} />
    </div>
  )
}

export default PartialDateInput