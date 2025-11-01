export type ValidationErrors = {
    [key: string]: string
}

export interface Region {
  region_code: string | null
  region_name_1: string
  region_name_2: string
  region_level: number
  region_level_name: string
  region_full_name_1: string
  iso_code: string
  priority: string
  disp_order: number
  parent_region_code: string
  updated_count: number | null
}
export const initialRegion: Region = {
  region_code: '',
  region_name_1: '',
  region_name_2: '',
  region_level: 0,
  region_level_name: '',
  region_full_name_1: '',
  iso_code: '',
  priority: '0',
  disp_order: 0,
  parent_region_code: '',
  updated_count: 0,
}

export type RegionCondition = {
    region_code: string
    region_name: string
    region_level: number | null
    priority: boolean
}
export const initialRegionCondition: RegionCondition = {
    region_code: '',
    region_name: '',
    region_level: null,
    priority: true,
}
