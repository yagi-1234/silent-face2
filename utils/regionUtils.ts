import { Region } from '@/types/common/common-types'

export interface RegionNode extends Region {
  children?: RegionNode[]
}

export const buildRegionTree = (regions: Region[]): RegionNode[] => {
  const regionMap: { [region_code: string]: RegionNode } = {}
  const roots: RegionNode[] = []

  for (const region of regions) {
    regionMap[region.region_code] = { ...region, children: [] }
  }

  for (const region of regions) {
    const parentCode = getParentCode(region.region_code)
    if (parentCode && regionMap[parentCode])
      regionMap[parentCode].children!.push(regionMap[region.region_code])
    else
      roots.push(regionMap[region.region_code])
  }

  const sortRecursive = (nodes: RegionNode[]) => {
    nodes.sort((a, b) => a.order_no - b.order_no)
    nodes.forEach(node => {
      if (node.children && node.children.length > 0)
        sortRecursive(node.children)
    })
  }

  sortRecursive(roots)
  return roots
}

function getParentCode(code: string): string | null {
  if (code.endsWith('0000')) return null
  if (code.endsWith('00')) return code.slice(0, 2) + '0000'
  return code.slice(0, 4) + '00'
}