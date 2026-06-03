export type ItDicsRow = {
  dics_id: string | null
  word: string | null
  word_category_1: string | null
  word_category_2: string | null
  word_category_3: string | null
  word_type: string | null
  importance: string | null
  explanation: string | null
  checked: string | null
  created_at: Date | null
  updated_at: Date | null
  updated_count: number | null
}
export type ItDicsView = ItDicsRow & {
  edited: string | null
}
export const initialItDics: ItDicsView = {
  dics_id: null,
  word: null,
  word_category_1: null,
  word_category_2: null,
  word_category_3: null,
  word_type: null,
  importance: null,
  explanation: null,
  checked: null,
  created_at: null,
  updated_at: null,
  updated_count: 0,
  edited: null,
}