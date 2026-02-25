import { supabase } from '@/lib/supabase'

import type { ReleaseRow, ReleaseView } from '@/types/information/information-types'

export const fetchReleases = async (): Promise<ReleaseView[]> => {
  let query = supabase
      .from('it01_releases')
      .select('*')
  query = query.order('version', { ascending: false })
  query = query.limit(1000)
  const { data: result, error } = await query
  if (error) {
    console.error('Error fetchReleases:', error)
    return []
  }
  return result
}
