import { supabase } from '@/lib/supabase'

import type { Region, RegionCondition } from '@/types/common/common-types'

export const fetchRegion = async (regionCode: string): Promise<Region> => {
  console.log('regionCode:', regionCode)
  let query = supabase
      .from('vm11_region')
      .select('*')
      .eq('region_code', regionCode)
      .single()
  const { data: result, error } = await query
  if (error) {
    console.error('Error fetchRegion:', error)
    throw error
  }
  return result
}

export const fetchRegionForInsert = async (regionCode: string): Promise<Region> => {
  const result = await fetchRegion(regionCode)
  const result2 = { ...result,
    region_code: null,
    region_name_1: '',
    region_name_2: '',
    region_level: result.region_level + 1,
    region_level_name: '',
    disp_order: result.child_next_disp_no,
    region_full_name_1: '',
    iso_code: '',
    priority: '0',
    parent_region_code: regionCode ?? null,
    updated_count: 0,
  }
  return result2
}

export const fetchRegions = async (condition: RegionCondition): Promise<Region[]> => {
  console.log('condition:', condition)
  let query = supabase
      .from('vm11_region')
      .select('*')
  if (condition.region_name)
    query = query.or(`region_full_name_1.ilike.%${condition.region_name}%,region_name_2.ilike.%${condition.region_name}%`)
  if (condition.region_level)
    query = query.eq('region_level', Number(condition.region_level))
  if (condition.priority)
    query = query.eq('priority', '1')
  query = query.order('disp_order')
  const { data: result, error } = await query
  if (error) {
    console.error('Error fetchRegions:', error)
    return []
  }
  return result
}

export const insertRegion = async (newData: Region): Promise<Region> => {
  const { region_code, region_full_name_1, country_name_1, next_disp_no, child_next_disp_no, origin_count, ...newData2 } = newData
  console.log('insertData:', newData2)
  const { data: result, error } = await supabase
      .from('cm11_region_new')
      .insert(newData2)
      .select()
      .single()
  if (error || !result) {
    console.error('Error insertRegion:', error)
    throw(error)
  }
  console.log("insertRegion Complete Result:", result)
  return result
}

export const updateRegion = async (newData: Region): Promise<Region> => {
  const { region_full_name_1, country_name_1, next_disp_no, child_next_disp_no, origin_count, ...newData2 } = newData
  const updateData = { ...newData2,
    updated_at: new Date(),
    updated_count: Number(newData2.updated_count ?? 0) + 1,
  }
  console.log('updateData:', updateData)
  const { data: result, error } = await supabase    
      .from('cm11_region_new')
      .update(updateData)
      .eq('region_code', updateData.region_code)
      .select()
      .single()
  if (error) {
    console.error('Error updateRegion:', error)
    throw(error)
  }
  console.log('updateRegion Complete Result:', result)
  return result
}