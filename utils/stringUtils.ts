export const removeArticle = (str: string): string => {
  if (!str) return str
  return str.replace(/^(a |an |the )/i, '').trim()
}

export const makeKeywordForSql = (str: string, isLike: boolean): string => {
  if (!str)
    return str
  const raw = str.trim().replace(/"/g, '\\"')
  if (isLike)
    return `"${`%${raw}%`}"`
  else
    return `"${raw}"`
}
