'use client'

// @ts-ignore
import Kuroshiro from 'kuroshiro'
// @ts-ignore
import KuromojiAnalyzer from 'kuroshiro-analyzer-kuromoji'

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

export const convertToRome = async (text: string): Promise<string>  => {
  if (!text) return text
  if (!(/[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9faf]/.test(text))) return text
  const kuroshiro = new Kuroshiro()
  await kuroshiro.init(new KuromojiAnalyzer({ dictPath: '/dict' }))
  const result = await kuroshiro.convert(text, {
    to: 'romaji',
    mode: 'spaced',
    romajiSystem: 'hepburn'
  })
  return toUpperCase(result)
}

export const toUpperCase = (text: string) => {
  if (!text) return text
  return text.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}
