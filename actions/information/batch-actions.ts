import { supabase } from '@/lib/supabase'

import type { BatchLogsView } from '@/types/information/batch-types'

export const fetchBatchLogs = async (): Promise<BatchLogsView[]> => {
  let query = supabase
      .from('ct02_batch_logs')
      .select('*')
  query = query.order('job_executed_at', { ascending: false })
  query = query.limit(200)
  const { data: result, error } = await query
  if (error) {
    console.error('Error fetchBatchLogs:', error)
    return []
  }
  return result
}
