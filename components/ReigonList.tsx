'use client'

import { ArrowLeft, Check, FileText, Menu, ListPlus, Plus, Search } from 'lucide-react'
import { useEffect, useState } from 'react'

import { fetchRegion, fetchRegionForInsert, fetchRegions, insertRegion, updateRegion } from '@/actions/common/region-action'
import clsx from 'clsx';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Region, RegionCondition, initialRegion, initialRegionCondition } from '@/types/common/common-types'

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
    else {
      const temp = { ...initialRegion,
        disp_order: regions.filter(row => row.region_level === 1).at(-1)?.next_disp_no ?? 0
      }
      setRegion(temp)
    }
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

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (active.id !== over?.id) {
      const oldIndex = regions.findIndex(row => row.region_code === active.id)
      const newIndex = regions.findIndex(row => row.region_code === over?.id)
      if (regions[oldIndex].parent_region_code === regions[newIndex].parent_region_code) {
        const newRegions = arrayMove(regions, oldIndex, newIndex)

        const oldDispOrder = regions[oldIndex].disp_order
        const newDispOrder = regions[newIndex].disp_order
        const minDispOrder = oldDispOrder < newDispOrder ? oldDispOrder : newDispOrder
        const maxDispOrder = oldDispOrder < newDispOrder ? newDispOrder : oldDispOrder
        const addValue = Math.pow(10, (5 - regions[oldIndex].region_level) * 2)
        let index = 0
        const reordered = newRegions.map(newRegion => ({
          ...newRegion,
         disp_order: (newRegion.disp_order >= minDispOrder && newRegion.disp_order <= maxDispOrder) ? minDispOrder + (addValue * index++) : newRegion.disp_order,
        }))
        setRegions(reordered)
        await Promise.all(
          reordered.filter(row => row.disp_order >= minDispOrder && row.disp_order <= maxDispOrder).
              map(row => updateRegion(row))
        )
      }
    }
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
          <div className="div-input-row">
            <label htmlFor="region_code" className="input-label">Region Code</label>
            <input type="text"
                id="region_code"
                name="region_code"
                className="w-30"
                value={condition.region_code} 
                onChange={handleSearchChange} />
          </div>
          <div className="div-input-row">
            <label htmlFor="region_code" className="input-label">Region Name</label>
            <input type="text"
                id="region_name"
                name="region_name"
                className="w-full sm:w-120"
                value={condition.region_name} 
                onChange={handleSearchChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSearch()
                }} />
          </div>
          <div className="div-input-row">
            <div className="div-row-left">
              <div className="flex-1">
                <label htmlFor="region_level" className="input-label">Region Level</label>
                <select
                    id="region_level"
                    name="region_level"
                    className="w-24"
                    value={condition.region_level ?? ''}
                    onChange={handleSearchChange} >
                  <option key="" value=""></option>
                  <option key="1" value="1">1</option>
                  <option key="2" value="2">2</option>
                  <option key="3" value="3">3</option>
                  <option key="4" value="4">4</option>
                  <option key="5" value="5">5</option>
                </select>
              </div>
              <div className="flex-1">
                <label htmlFor="region_level" className="input-label">Priority</label>
                <input type="checkbox"
                    id="priority"
                    name="priority"
                    className="w-5"
                    checked={condition.priority}
                    onChange={handleSearchChange} />
              </div>
            </div>
          </div>
          <div className="div-row-right">
            <button className="button-search h-6 w-16"
                onClick={handleSearch}>
              <Search size={16} />
            </button>
          </div>
          <div className="hidden sm:block">
            <div className="rounded overflow-y-auto max-h-[calc(80vh-220px)]">
              <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext
                    items={regions.map(region => region.region_code ?? "")}
                    strategy={verticalListSortingStrategy}>
                  <table>
                    <thead>
                      <tr>
                        <th>Region Name</th>
                        <th></th>
                        <th>Disp Order</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {regions.map(region => (
                        <SortableRow
                            key={region.region_code} 
                            region={region} 
                            onSelect={onSelect}
                            onEdit={handleShowEdit}
                            onPlus={handleShowPlus} />
                      ))}
                      <div>　</div>
                    </tbody>
                  </table>
                </SortableContext>
              </DndContext>
            </div>
          </div>
          <div className="block sm:hidden">
            <div className="div-card-area overflow-y-auto max-h-[calc(80vh-220px)]">
              {regions.map(region => (
                <div key={region.region_code} className="div-card">
                  <button
                      className="button-link card-title"
                      onClick={() => onSelect(region.region_code ?? '', region.region_full_name_1)}>
                    {region.region_full_name_1}
                  </button>
                </div>
              ))}
            </div>
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
{/**
          <div className="input-form">
            <label htmlFor="disp_order">Disp Order</label>
            <input type="number"
                id="disp_order"
                name="disp_order"
                className="numeric-field w-40"
                value={region.disp_order}
                onChange={handleChange} />
          </div>
 */}
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

type Props2 = {
  region: Region,
  onSelect: (regionCode: string, regionFullName: string) => void
  onEdit: (id: string) => void
  onPlus: (id: string) => void
}
const SortableRow = ({ region, onSelect, onEdit, onPlus }: Props2) => {

  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: region.region_code ?? '',
  })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <tr key={region.region_code} className={clsx("h-7")} ref={setNodeRef} style={style}>
      <td
          onDoubleClick={() => onSelect(region.region_code ?? '', region.region_full_name_1)}>
        {region.region_full_name_1}
      </td>
      <td>{region.region_name_2}</td>
      <td>{region.disp_order}</td>
      <td className="flex items-center">
        <div>
          <button
              className="button-page"
              onClick={() => onEdit(region.region_code ?? '')} >
            <FileText className="w-4 h-4" />
          </button>
        </div>
        <div>
          <button
              className="button-page"
              onClick={() => onPlus(region.region_code ?? '')} >
            <ListPlus className="w-4 h-4" />
          </button>
        </div>
      </td>
      <td style={{ cursor: "grab" }}>
        <span {...attributes} {...listeners}>
          <Menu  className="w-4 h-4" />
        </span>
      </td>
    </tr>
  )
}

export default RegionList