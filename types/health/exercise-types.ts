export type ExerciseRow = {
  exercise_id: string | null
  exercise_date: Date | null
  exercise_content: string | null
  exercise_length: number | null
  exercise_place: string | null
  created_at: Date | null
  updated_at: Date | null
  updated_count: number | null
}

export type ExerciseView = ExerciseRow & {
  work_date: Date | null
  rownumber: number | null
  is_edit: boolean
}

export const initialExercise: ExerciseView = {
  exercise_id: null,
  exercise_date: null,
  exercise_content: null,
  exercise_length: null,
  exercise_place: null,
  created_at: null,
  updated_at: null,
  updated_count: 0,
  work_date: null,
  rownumber: null,
  is_edit: false
}

export type ExerciseCondition = {
  exercise_date_from: Date | null,
  exercise_date_to: Date | null,
}

export const initialExerciseCondition: ExerciseCondition = {
  exercise_date_from: null,
  exercise_date_to: null,
}
