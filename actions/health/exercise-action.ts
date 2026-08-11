import { supabase } from '@/lib/supabase'

import type { ExerciseRow, ExerciseView, ExerciseCondition } from '@/types/health/exercise-types'
import { formatDateTime } from '@/utils/dateFormat'

export const fetchExercise = async (exerciseId: string): Promise<ExerciseView> => {
  console.log('fetchExercise exerciseId:', exerciseId)
  const today = new Date()
  let query = supabase
      .from('hv02_exercises')
      .select('*')
      .eq('exercise_id', exerciseId)
      .single()
  const { data: result, error } = await query
  if (error) {
    console.error('Error fetchExercise:', error)
    throw error
  }
  return result
}

export const fetchExercises = async (condition: ExerciseCondition): Promise<ExerciseView[]> => {
  console.log(condition)
  let query = supabase
      .from('hv02_exercises')
      .select('*')
      // .gte('work_date', formatDateTime(today, 'yyyy-MM-01'))
      // .lte('work_date', formatDateTime(new Date(today.getFullYear(), today.getMonth() + 1, 0), 'yyyy-MM-dd'))
  if (condition.exercise_date_from)
    query = query.gte('work_date', formatDateTime(condition.exercise_date_from, 'yyyy-MM-dd'))
  if (condition.exercise_date_to)
    query = query.lte('work_date', formatDateTime(condition.exercise_date_to, 'yyyy-MM-dd'))
  query = query.order('work_date')
      .order('exercise_content')
  const { data: result, error } = await query
  if (error) {
    console.error('Error fetchExercises:', error)
    return []
  }
  return result
}

export const mergeExercise = async (newData: ExerciseView): Promise<ExerciseView> => {
  if (newData.exercise_id) {
    const result = await updateExercise(newData)
    return fetchExercise(result.exercise_id || '')
  } else {
    const result = await insertExercise(newData)
    return fetchExercise(result.exercise_id || '')
  }
}
const insertExercise = async (newData: ExerciseView): Promise<ExerciseRow> => {
  const insertData = copyViewToRecord(newData, 'i')
  console.log('insertData:', insertData)
  const { data: result, error } = await supabase
      .from('ht02_exercises')
      .insert(insertData)
      .select()
      .single()
  if (error || !result) {
    console.error('Error insertExercise:', error)
    throw(error)
  }
  console.log('insertExercise Complete Result:', result)
  return result
}
const updateExercise = async (newData: ExerciseView): Promise<ExerciseRow> => {
  const updateData = copyViewToRecord(newData, 'u')
  console.log('updateData:', updateData)
  const { data: result, error } = await supabase
      .from('ht02_exercises')
      .update(updateData)
      .eq('exercise_id', newData.exercise_id)
      .select()
      .single()
  if (error || !result) {
    console.error('Error updateExercise:', error)
    throw(error)
  }
  console.log("updateExercise Complete Result:", result)
  return result
}

const copyViewToRecord = (view: ExerciseView, processType: string): Partial<ExerciseRow> => {
  const nowDate = new Date()
  const {
    ...row
  } = view
  switch (processType) {
    case 'i': {
      const { exercise_id, work_date, rownumber, is_edit, ...insertData } = {
        ...row,
        created_at: nowDate,
        updated_at: nowDate,
      }
      return insertData
    }
    case 'u': {
      const { work_date, rownumber, is_edit, ...updateData } = {
        ...row,
        updated_at: nowDate,
        updated_count: Number(row.updated_count ?? 0) + 1
      }
      return updateData
    }
  }
  return row
}