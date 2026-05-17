import { supabase } from '@/lib/supabase'

import type { EatingRow, EatingView } from '@/types/health/eating-types'

export const fetchEating = async (eatingId: string): Promise<EatingView> => {
  let query = supabase
      .from('hv03_eatings')
      .select('*')
      .eq('eating_id', eatingId)
      .single()
  const { data: result, error } = await query
  if (error) {
    console.error('Error fetchEating:', error)
    throw error
  }
  return result
}
export const fetchEatings = async (): Promise<EatingView[]> => {
  let query = supabase
      .from('hv03_eatings')
      .select('*')
      .gte('work_date', '2026-05-01')
      .lte('work_date', '2026-05-31')
  query = query.order('work_date')
  // query = query.limit(1000)
  const { data: result, error } = await query
  if (error) {
    console.error('Error fetchEatings:', error)
    return []
  }
  return result
}

export const mergeEating = async (newData: EatingView): Promise<EatingView> => {
  if (newData.eating_id) {
    const result = await updateEating(newData)
    return fetchEating(result.eating_id || '')
  } else {
    const result = await insertEating(newData)
    return fetchEating(result.eating_id || '')
  }
}
const insertEating = async (newData: EatingView): Promise<EatingRow> => {
  const insertData = copyViewToRecord(newData, 'i')
  console.log('insertData:', insertData)
  const { data: result, error } = await supabase
      .from('ht03_eatings')
      .insert(insertData)
      .select()
      .single()
  if (error || !result) {
    console.error('Error insertEating:', error)
    throw(error)
  }
  console.log('insertEating Complete Result:', result)
  return result
}
const updateEating = async (newData:EatingView): Promise<EatingRow> => {
  const updateData = copyViewToRecord(newData, 'u')
  console.log('updateData:', updateData)
  const { data: result, error } = await supabase
      .from('ht03_eatings')
      .update(updateData)
      .eq('eating_id', newData.eating_id)
      .select()
      .single()
  if (error || !result) {
    console.error('Error updateEating:', error)
    throw(error)
  }
  console.log("updateEating Complete Result:", result)
  return result
}

const copyViewToRecord = (view: EatingView, processType: string): Partial<EatingRow> => {
  const nowDate = new Date()
  const {
    ...row
  } = view
  switch (processType) {
    case 'i': {
      const { eating_id, work_date, is_edit, ...insertData } = {
        ...row,
        created_at: nowDate,
        updated_at: nowDate,
      }
      return insertData
    }
    case 'u': {
      const { work_date, is_edit, ...updateData } = {
        ...row,
        updated_at: nowDate,
        updated_count: Number(row.updated_count ?? 0) + 1
      }
      return updateData
    }
  }
  return row
}