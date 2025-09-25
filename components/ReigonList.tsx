'use client'

import { Search } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Region, RegionCondition, initialRegionCondition } from '@/types/common/common-types'
import { fetchRegions } from '@/actions/common/region-action'

interface Props {
  onSelect: (regionCode: string, regionName: string) => void
}

export function RegionList({ onSelect }: Props) {

  const [regions, setRegions] = useState<Region[]>([])
  const [condition, setCondition] = useState<RegionCondition>(initialRegionCondition)

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = event.target
    setCondition(prev => ({
      ...prev, 
      [name]: type === 'checkbox' ? (event.target as HTMLInputElement).checked : value
    }))
  }

  const handleSearch = async () => {
    const fetchData = await fetchRegions(condition)
    setRegions(fetchData)
  }

  useEffect(() => {
    const loadRegions = async () => {

      const fetchData = await fetchRegions(condition)
      setRegions(fetchData)
    }
    loadRegions()
  }, [])

  return (
    <>
      <div className="searchPanel">
        <div className="input-form">
          <label htmlFor="region_code">Region Code/Name</label>
          <input type="text"
              id="region_code"
              name="region_code"
              className="w-30"
              value={condition.region_code} 
              onChange={handleSearchChange} />
          <input type="text"
              id="region_name"
              name="region_name"
              className="w-60"
              value={condition.region_name} 
              onChange={handleSearchChange} />
          <button className="button-search w-20"
              onClick={handleSearch}>
            <Search size={16} />
          </button>
        </div>
        <div className="input-form">
          <label htmlFor="region_level">Region Level</label>
          <select
              id="region_level"
              name="region_level"
              className="w-30"
              value={condition.region_level ?? ''}
              onChange={handleSearchChange} >
            <option key="" value=""></option>
            <option key="1" value="1">1</option>
            <option key="2" value="2">2</option>
            <option key="3" value="3">3</option>
            <option key="4" value="4">4</option>
            <option key="5" value="5">5</option>
          </select>
          <label className="input-check-label ml-2">
            <label htmlFor="priority">Priority</label>
            <input type="checkbox"
                id="priority"
                name="priority"
                checked={condition.priority}
                onChange={handleSearchChange} />
          </label>
        </div>
      </div>
      <div className="overflow-y-auto max-h-[300px] border rounded">
        <table>
          <thead>
            <tr>
              <th>Region Code</th>
              <th>Region Name</th>
            </tr>
          </thead>
          <tbody>
            {regions.map(region => (
              <tr key={region.region_code}>
                <td>{region.region_code}</td>
                <td
                    onDoubleClick={() => onSelect(region.region_code, region.region_full_name_1)}>
                  {region.region_full_name_1}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

export default RegionList