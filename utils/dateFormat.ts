import { format as formatTz } from 'date-fns-tz'

export const formatDateTime = (value: string | Date | null | undefined, formatString: string): string => {

    if (!value) return ''
    try {
        const date = new Date(value)
        return formatTz(date, formatString, { timeZone: 'Asia/Tokyo' })
    } catch {
        return ''
    }
}

export const formatDateToYYYYMMDD = (date: Date) => {
    return date.toISOString().slice(0, 10)
}

export const compareDate = (date1: string | Date | null, date2: string | Date | null) => {
  if (!date1 && date2) return false
  if (date1 && !date2) return false
  if (!date1 && !date2) return true
  if (new Date(date1 || '').getTime() !== new Date(date2 || '').getTime()) return false
  return true
}
