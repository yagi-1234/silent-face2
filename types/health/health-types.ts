export type WeightRow = {
  weight_id: string | null
  user_id: string | null
  weight_date: Date | null
  weight: number | null
  bfp: number | null
  muscle_mass: number | null
  vfl: number | null
  bmr: number | null
  body_age: number | null
  created_at: Date | null
  updated_at: Date | null
  updated_count: number | null
}

export type WeightView = WeightRow & {
}

export const initialWeight: WeightView = {
  weight_id: null,
  user_id: null,
  weight_date: null,
  weight: null,
  bfp: null,
  muscle_mass: null,
  vfl: null,
  bmr: null,
  body_age: null,
  created_at: null,
  updated_at: null,
  updated_count: 0,
}

export type WeightCondition = {
  weight_date_from: Date | null,
  weight_date_to: Date | null,
}

export const initialWeightCondition: WeightCondition = {
  weight_date_from: null,
  weight_date_to: null,
}
