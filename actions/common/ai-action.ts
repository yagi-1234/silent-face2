import { supabase } from '@/lib/supabase'

import type { AiPrompt } from '@/types/common/common-types'

export const fetchAiPrompt = async (promptId: string): Promise<AiPrompt> => {
  let query = supabase
      .from('ct21_ai_prompts')
      .select('*')
      .eq('prompt_id', promptId)
      .single()
  const { data: result, error } = await query
  if (error) {
    console.error('Error fetchAiPrompt:', error)
    throw error
  }
  return result
}

export const mergeAiPrompt = async (newData: AiPrompt): Promise<AiPrompt> => {
  if (newData.prompt_id) {
    const result = await updateAiPrompt(newData)
    return fetchAiPrompt(result.prompt_id || '')
  } else {
    const result = await insertAiPrompt(newData)
    return fetchAiPrompt(result.prompt_id || '')
  }
}
const insertAiPrompt = async (newData: AiPrompt): Promise<AiPrompt> => {
  const insertData = copyViewToRecord(newData, 'i')
  console.log('insertData:', insertData)
  const { data: result, error } = await supabase
      .from('ct21_ai_prompts')
      .insert(insertData)
      .select()
      .single()
  if (error || !result) {
    console.error('Error insertAiPrompt:', error)
    throw(error)
  }
  console.log('insertAiPrompt Complete Result:', result)
  return result
}
const updateAiPrompt = async (newData: AiPrompt): Promise<AiPrompt> => {
  const updateData = copyViewToRecord(newData, 'u')
  console.log('updateData:', updateData)
  const { data: result, error } = await supabase
      .from('ct21_ai_prompts')
      .update(updateData)
      .eq('prompt_id', newData.prompt_id)
      .select()
      .single()
  if (error || !result) {
    console.error('Error updateAiPrompt:', error)
    throw(error)
  }
  console.log("updateAiPrompt Complete Result:", result)
  return result
}

const copyViewToRecord = (view: AiPrompt, processType: string): Partial<AiPrompt> => {
  const nowDate = new Date()
  const {
    ...row
  } = view
  switch (processType) {
    case 'i': {
      const { prompt_id, ...insertData } = {
        ...row,
        created_at: nowDate,
        updated_at: nowDate,
      }
      return insertData
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