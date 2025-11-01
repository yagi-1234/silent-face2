import { supabase } from '@/lib/supabase'

import type { Region, RegionCondition } from '@/types/common/common-types'

export const fetchRegion = async (regionCode: string): Promise<Region> => {
  console.log('regionCode:', regionCode)
  let query = supabase
      .from('cm11_region_new')
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
    disp_order: 0,
    region_full_name_1: '',
    iso_code: '',
    parent_region_code: regionCode,
    updated_count: 0,
  }
  return result2
}

export const fetchRegions = async (condition: RegionCondition): Promise<Region[]> => {
  console.log('condition:', condition)
  let query = supabase
      .from('vm11_region_new')
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

const fetchNextRegionCode = async (parentRegionCode: string): Promise<string> => {
  let query = supabase
      .from('vm11_max_region')
      .select('next_region_code')
      .eq('parent_region_code', parentRegionCode)
      .single()
  const { data: result, error } = await query
  if (error) {
    console.error('Error fetchNextRegionCode:', error)
    throw error
  }
  return result.next_region_code
}

export const insertRegion = async (newData: Region): Promise<Region> => {
  const { region_code, region_full_name_1, ...newData2 } = newData
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
  const { region_full_name_1, ...newData2 } = newData
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