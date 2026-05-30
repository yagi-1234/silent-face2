import { supabase } from '@/lib/supabase'

import type { CodeView, TaskTypeRow, TaskTypeView } from '@/types/master/master-types'

export const fetchCodeNames = async (): Promise<string[]> => {
  let query = supabase
      .from('cv01_code_names')
      .select('code_name')
  const { data: result, error } = await query
  if (error) {
    console.error('Error fetchCodeNames:', error)
    return []
  }
  return result.map(row => row.code_name)
}

export const fetchCodes = async (codeName: string): Promise<CodeView[]> => {
  let query = supabase
      .from('ct01_code')
      .select('*')
      .eq('code_name', codeName)
  const { data: result, error } = await query
  if (error) {
    console.error('Error fetchCodes:', error)
    return []
  }
  return result
}
export const insertCode = async (newData: CodeView) => {
  const insertData = copyViewToRecordCode(newData, 'i')
  console.log('insertData:', insertData)
  const { data: result, error } = await supabase
      .from('ct01_code')
      .insert(insertData)
      .select()
      .single()
  if (error || !result) {
    console.error('Error insertCode:', error)
    throw(error)
  }
  console.log('insertCode Complete Result:', result)
  return result
}
export const updateCode = async (newData: CodeView) => {
  const updateData = copyViewToRecordCode(newData, 'u')
  console.log('updateData:', updateData)
  const { data: result, error } = await supabase
      .from('ct01_code')
      .update(updateData)
      .eq('code_name', newData.code_name)
      .eq('code_key', newData.code_key)
      .select()
      .single()
  if (error || !result) {
    console.error('Error updateCode:', error)
    throw(error)
  }
  console.log("updateCode Complete Result:", result)
  return result
}
const copyViewToRecordCode = (view: CodeView, processType: string): Partial<CodeView> => {
  const nowDate = new Date()
  const {
    ...row
  } = view
  switch (processType) {
    case 'i': {
      const { edited, ...insertData } = {
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
