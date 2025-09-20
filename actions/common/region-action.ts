import { supabase } from '@/lib/supabase'

import type { Region, RegionCondition } from '@/types/common/common-types'

export const fetchRegions = async (condition: RegionCondition): Promise<Region[]> => {
  console.log('condition:', condition)
  let query = supabase
      .from('vm11_region')
      .select('*')
  if (condition.region_name)
    query = query.or(`region_name_1.ilike.%${condition.region_name}%,region_name_2.ilike.%${condition.region_name}%`)
  if (condition.region_level)
    query = query.eq('region_level', Number(condition.region_level))
  if (condition.priority)
    query = query.eq('priority', '1')
  query = query.order('region_code')
  const { data: result, error } = await query
  if (error) {
    console.error('Error fetchRegions:', error)
    return []
  }
  return result
}
