export type ValidationErrors = {
    [key: string]: string
}

export interface Region {
    region_code: string
    region_name_1: string
    region_name_2: string
    region_level: number
    order_no: number
    region_full_name_1: string
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
