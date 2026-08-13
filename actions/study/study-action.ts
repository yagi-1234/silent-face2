import { supabase } from '@/lib/supabase'

import type { ItDicsView, ItDicCondition } from '@/types/study/study-types'

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
export const fetchItDics = async (condition: ItDicCondition, pageNo: number): Promise<ItDicsView[]> => {
  console.log('fetchItDics condition:', condition, 'pageNo:', pageNo)
  const fetchCount = 20
  let query = supabase
      .from('st01_it_dics')
      .select('*')
  query = CreatefetchItDicsQuery(query, condition)
  query = query.order('word')
  query = query.range(fetchCount * pageNo, fetchCount * (pageNo + 1) - 1)
  console.log('fetchItDics query:', query.toString())
  const { data: result, error } = await query
  if (error) {
    console.error('Error fetchItDics:', error)
    return []
  }
  return result
}
export const fetchItDicsCount = async (condition: ItDicCondition): Promise<number> => {
  let query = supabase
      .from('st01_it_dics')
      .select('*', { count: 'exact', head: true })
  query = CreatefetchItDicsQuery(query, condition)
  const { count, error } = await query
  if (error) {
    console.error('Error fetchItDicsCount:', error)
    return 0
  }
  return count ?? 0
}
const CreatefetchItDicsQuery = (query: any, condition: ItDicCondition) => {
  console.log('CreatefetchItDicsQuery condition:', condition)
  if (condition.word) {
    query = query.ilike('word', `%${condition.word}%`)
  }
  if (condition.word_category) {
    query = query.or(`word_category_1.ilike.${condition.word_category}, word_category_2.ilike.${condition.word_category}, word_category_3.ilike.${condition.word_category}`)
  }
  return query
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
