import { supabase } from '@/lib/supabase'

import type { TaskTypeRow, TaskTypeView } from '@/types/master/master-types'

export const fetchMaster = async (taskType: string): Promise<TaskTypeView> => {
  let query = supabase
      .from('cm01_task_types')
      .select('*')
      .eq('task_type', taskType)
      .single()
  const { data: result, error } = await query
  if (error) {
    console.error('Error fetchMaster:', error)
    throw error
  }
  return result
}

export const fetchMasters = async <T>(tableName: string): Promise<T[]> => {
  let query = supabase
      .from('cm01_task_types')
      .select('*')
  const { data: result, error } = await query
  if (error) {
    console.error('Error fetchMasters:', error)
    return []
  }
  return result as T[]
}

export const mergeMaster = async (newData: TaskTypeView): Promise<TaskTypeView> => {
  if (newData.task_type) {
    const result = await updateMaster(newData)
    return fetchMaster(result.task_type || '')
  } else {
    const result = await insertMaster(newData)
    return fetchMaster(result.task_type || '')
  }
}

const insertMaster = async (newData: TaskTypeView): Promise<TaskTypeRow> => {
  const insertData = copyViewToRecord(newData, 'i')
  console.log('insertData:', insertData)
  const { data: result, error } = await supabase
      .from('cm01_task_types')
      .insert(insertData)
      .select()
      .single()
  if (error || !result) {
    console.error('Error insertMaster:', error)
    throw(error)
  }
  console.log('insertMaster Complete Result:', result)
  return result
}

const updateMaster = async (newData: TaskTypeView): Promise<TaskTypeRow> => {
  const updateData = copyViewToRecord(newData, 'u')
  console.log('updateData:', updateData)
  const { data: result, error } = await supabase
      .from('cm01_task_types')
      .update(updateData)
      .eq('task_type', newData.task_type)
      .select()
      .single()
  if (error || !result) {
    console.error('Error updateMaster:', error)
    throw(error)
  }
  console.log("updateMaster Complete Result:", result)
  return result
}

const copyViewToRecord = (view: TaskTypeView, processType: string): Partial<TaskTypeRow> => {
  const nowDate = new Date()
  const {
    ...row
  } = view
  switch (processType) {
    case 'i': {
      return {
        ...row,
        created_at: nowDate,
        updated_at: nowDate,
      }
    }
    case 'u': {
      return {
        ...row,
        updated_at: nowDate,
        updated_count: Number(row.updated_count ?? 0) + 1
      }
    }
  }
  return row
}
