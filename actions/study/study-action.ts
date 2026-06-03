import { supabase } from '@/lib/supabase'

import type { ItDicsRow, ItDicsView } from '@/types/study/study-types'

export const fetchItDic = async (dicsId: string): Promise<ItDicsView> => {
  let query = supabase
      .from('st01_it_dics')
      .select('*')
      .eq('dics_id', dicsId)
      .single()
  const { data: result, error } = await query
  if (error) {
    console.error('Error fetchItDic:', error)
    throw error
  }
  return result
}
export const fetchItDics = async (): Promise<ItDicsView[]> => {
  let query = supabase
      .from('st01_it_dics')
      .select('*')
      .order('word')
  const { data: result, error } = await query
  if (error) {
    console.error('Error fetchItDics:', error)
    return []
  }
  return result
}

export const mergeItDic = async (newData: ItDicsView): Promise<string> => {
  if (newData.dics_id) {
    const result = await updateItDics(newData)
    return result.dics_id || ''
  } else {
    const result = await insertItDics(newData)
    return result.dics_id || ''
  }
}
export const insertItDics = async (newData: ItDicsView) => {
  const insertData = copyViewToRecord(newData, 'i')
  console.log('insertData:', insertData)
  const { data: result, error } = await supabase
      .from('st01_it_dics')
      .insert(insertData)
      .select()
      .single()
  if (error || !result) {
    console.error('Error insertItDics:', error)
    throw(error)
  }
  console.log('insertItDics Complete Result:', result)
  return result
}
export const updateItDics = async (newData: ItDicsView) => {
  const updateData = copyViewToRecord(newData, 'u')
  console.log('updateData:', updateData)
  const { data: result, error } = await supabase
      .from('st01_it_dics')
      .update(updateData)
      .eq('dics_id', newData.dics_id)
      .select()
      .single()
  if (error || !result) {
    console.error('Error updateItDics:', error)
    throw(error)
  }
  console.log("updateItDics Complete Result:", result)
  return result
}
const copyViewToRecord = (view: ItDicsView, processType: string): Partial<ItDicsView> => {
  const nowDate = new Date()
  const {
    ...row
  } = view
  switch (processType) {
    case 'i': {
      const { dics_id, edited, ...insertData } = {
        ...row,
        created_at: nowDate,
        updated_at: nowDate,
      }
      return insertData
    }
    case 'u': {
      const { edited, ...updatetData } = {
        ...row,
        updated_at: nowDate,
        updated_count: Number(row.updated_count ?? 0) + 1
      }
      return updatetData
    }
  }
  return row
}
