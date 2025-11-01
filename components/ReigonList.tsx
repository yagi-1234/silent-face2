'use client'

import { ArrowLeft, Check, FileText, ListPlus, Plus, Search } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Region, RegionCondition, initialRegion, initialRegionCondition } from '@/types/common/common-types'
import { fetchRegion, fetchRegionForInsert, fetchRegions, insertRegion, updateRegion } from '@/actions/common/region-action'

interface Props {
  onSelect: (regionCode: string, regionName: string) => void
}

export function RegionList({ onSelect }: Props) {

  const [regions, setRegions] = useState<Region[]>([])
  const [condition, setCondition] = useState<RegionCondition>(initialRegionCondition)
  const [showEditPanel, setShowEditPanel] = useState(false)
  const [region, setRegion] = useState<Region>(initialRegion)

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

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target
    setRegion(prev => ({
      ...prev, [name]: value
    }))
  }
  const handleCheckBoxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target
    setRegion(prev => ({
      ...prev, [name]: checked ? '1' : '0'
    }))
  }

  const handleShowEdit = async (regionCode: string) => {
    if (regionCode) loadRegion(regionCode)
    setShowEditPanel(true)
  }
  const handleShowPlus = async (regionCode: string) => {
    const fetchData = await fetchRegionForInsert(regionCode)
    setRegion(fetchData)
    setShowEditPanel(true)
  }
  const handleCloseEdit = async () => {
    const fetchData = await fetchRegions(condition)
    setRegions(fetchData)
    setShowEditPanel(false)
  }
  const handleSave = async () => {
    if (region.region_code) {
      const result = await updateRegion(region)
      setRegion(result)
    } else {
      const result = await insertRegion(region)
      setRegion(result)
    }
  }

  const loadRegion = async (regionCode: string) => {
    const fetchData = await fetchRegion(regionCode)
    setRegion(fetchData)
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
      {!showEditPanel && (
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
                  onChange={handleSearchChange}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSearch()
                  }} />
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
                  <th>Region Name</th>
                  <th></th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {regions.map(region => (
                  <tr key={region.region_code}>
                    <td
                        onDoubleClick={() => onSelect(region.region_code ?? '', region.region_full_name_1)}>
                      {region.region_full_name_1}
                    </td>
                    <td>{region.region_name_2}</td>
                    <td className='flex'>
                      <div>
                        <button
                            className="button-page"
                            onClick={() => handleShowEdit(region.region_code ?? '')} >
                          <FileText className="w-5 h-5" />
                        </button>
                      </div>
                      <div>
                        <button
                            className="button-page"
                            onClick={() => handleShowPlus(region.region_code ?? '')} >
                          <ListPlus className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-end mt-2">
            <button className="button-save h-6 w-16"
                onClick={() => handleShowEdit("")}>
              <Plus size={16} />
            </button>
          </div>
        </>
      )}
      {showEditPanel && (
        <>
          <div className="input-form mb-2">
            <label htmlFor="region_name_1">Region Name</label>
            <input type="text"
                id="region_name_1"
                name="region_name_1"
                value={region.region_name_1 ?? ''}
                onChange={handleChange} />
          </div>
          <div className="input-form mb-2">
            <label htmlFor="region_name_2">　</label>
            <input type="text"
                id="region_name_2"
                name="region_name_2"
                value={region.region_name_2 ?? ''}
                onChange={handleChange} />
          </div>
          <div className="input-form">
            <label htmlFor="region_level">Level</label>
            <input type="number"
                id="region_level"
                name="region_level"
                className="numeric-field text-sm"
                value={region.region_level ?? ''}
                onChange={handleChange} />
            <input type="text"
                id="region_level_name"
                name="region_level_name"
                value={region.region_level_name ?? ''}
                onChange={handleChange} />
          </div>
          <div className="input-form">
            <label htmlFor="iso_code">ISO Code</label>
            <input type="text"
                id="iso_code"
                name="iso_code"
                value={region.iso_code ?? ''}
                onChange={handleChange} />
          </div>
          <div className="input-form">
            <label htmlFor="priority">Priority</label>
            <input type="checkbox"
                id="priority"
                name="priority"
                className="w-5"
                checked={region.priority === '1'}
                value={region.priority}
                onChange={handleCheckBoxChange} />
          </div>
          <div className="input-form">
            <label htmlFor="disp_order">Disp Order</label>
            <input type="number"
                id="disp_order"
                name="disp_order"
                className="numeric-field w-40"
                value={region.disp_order}
                onChange={handleChange} />
          </div>
          <div className="flex justify-between items-center">
            <button className="button-back h-6 w-16"
                onClick={() => handleCloseEdit()}>
              <ArrowLeft size={16} />
            </button>
            <button className="button-save h-6 w-16"
                onClick={handleSave}>
              <Check size={16} />
            </button>
          </div>
        </>
      )}
    </>
  )
}

export default RegionList