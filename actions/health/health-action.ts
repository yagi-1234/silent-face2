import { supabase } from '@/lib/supabase'

import type { WeightRow, WeightView, WeightCondition } from '@/types/health/health-types'
import { formatDateTime } from '@/utils/dateFormat'

export const fetchWeight = async (weightId: string): Promise<WeightView> => {
  let query = supabase
      .from('ht01_weights')
      .select('*')
      .eq('weight_id', weightId)
      .single()
  const { data: result, error } = await query
  if (error) {
    console.error('Error fetchWeight:', error)
    throw error
  }
  return result
}

export const fetchWeights = async (condition: WeightCondition): Promise<WeightView[]> => {
  let query = supabase
      .from('ht01_weights')
      .select('*')
  if (condition.weight_date_from)
    query = query.gte('weight_date', formatDateTime(condition.weight_date_from, 'yyyy-MM-dd'))
  if (condition.weight_date_to)
    query = query.lte('weight_date', formatDateTime(condition.weight_date_to, 'yyyy-MM-dd'))
  query = query.order('weight_date')
  query = query.limit(1000)
  const { data: result, error } = await query
  if (error) {
    console.error('Error fetchWeights:', error)
    return []
  }
  return result
}

export const mergeWeight = async (newData: WeightView): Promise<WeightView> => {
  if (newData.weight_id) {
    const result = await updateWeight(newData)
    return fetchWeight(result.weight_id || '')
  } else {
    const result = await insertWeight(newData)
    return fetchWeight(result.weight_id || '')
  }
}

const insertWeight = async (newData: WeightView): Promise<WeightRow> => {
  const insertData = copyViewToRecord(newData, 'i')
  console.log('insertData:', insertData)
  const { data: result, error } = await supabase
      .from('ht01_weights')
      .insert(insertData)
      .select()
      .single()
  if (error || !result) {
    console.error('Error insertWeight:', error)
    throw(error)
  }
  console.log('insertWeight Complete Result:', result)
  return result
}

const updateWeight = async (newData: WeightView): Promise<WeightRow> => {
  const updateData = copyViewToRecord(newData, 'u')
  console.log('updateData:', updateData)
  const { data: result, error } = await supabase
      .from('ht01_weights')
      .update(updateData)
      .eq('weight_id', newData.weight_id)
      .select()
      .single()
  if (error || !result) {
    console.error('Error updateWeight:', error)
    throw(error)
  }
  console.log("updateWeight Complete Result:", result)
  return result
}

const copyViewToRecord = (view: WeightView, processType: string): Partial<WeightRow> => {
  const nowDate = new Date()
  const {
    ...row
  } = view
  switch (processType) {
    case "i": {
      const { weight_id, ...insertData } = {
        ...row,
        created_at: nowDate,
        updated_at: nowDate,
      }
      return insertData
    }
    case "u": {
      return {
        ...row,
        updated_at: nowDate,
        updated_count: Number(row.updated_count ?? 0) + 1
      }
    }
  }
  return row
}