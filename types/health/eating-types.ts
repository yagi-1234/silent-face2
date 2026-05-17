export type EatingRow = {
  eating_id: string | null
  eating_date: Date | null
  breakfast: string | null
  breakfast_score: number | null
  lunch: string | null
  lunch_score: number | null
  dinner: string | null
  dinner_score: number | null
  othres: string | null
  others_score: number | null
  snacks: number | null
  deserts: number | null
  eating_comment: string | null
  created_at: Date | null
  updated_at: Date | null
  updated_count: number | null
}

export type EatingView = EatingRow & {
  work_date: Date | null
  is_edit: boolean
}

export const initialEating: EatingView = {
  eating_id: null,
  eating_date: null,
  breakfast: null,
  breakfast_score: null,
  lunch: null,
  lunch_score: null,
  dinner: null,
  dinner_score: null,
  othres: null,
  others_score: null,
  snacks: null,
  deserts: null,
  eating_comment: null,
  created_at: null,
  updated_at: null,
  updated_count: 0,
  work_date: null,
  is_edit: false
}
