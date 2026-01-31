export const ellipsis = (value: string | null | undefined, maxLength: number): string => {
  if (!value) return ''
  return value.length > maxLength ? value.slice(0, maxLength) + '...' : value
}

export const isEllipsed = (value: string | null | undefined, maxLength: number): boolean => {
  if (!value) return false
  return value.length > maxLength ? true : false
}
