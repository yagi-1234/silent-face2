import { supabase } from '@/lib/supabase'

import type { LibraryItem, LibraryItemMst } from '@/types/library/library-types'
import { Task, initialTask } from '@/types/tasks/task-types'


export const fetchItem = async (itemId: string): Promise<LibraryItem> => {
  console.log('itemId:', itemId)
  const { data: result, error } = await supabase
      .from('lt11_libray_items')
      .select('*')
      .eq('item_id', itemId)
      .single()
  if (error) {
      console.error('Error fetchItem:', error)
      throw error
  }
  console.log('result:', result)
  return result
}

export const fetchItemForTask = async (itemId: string): Promise<Task> => {
  const fetchData = await fetchItem(itemId)
  const task = { ...initialTask,
    task_key: fetchData.item_id,
    task_type: fetchData.library_type,
    task_name: fetchData.item_name_1 + (fetchData.author_name_1 ? '/' + fetchData.author_name_1 : ''),
  }
  return task
}

export const fetchItems = async (libraryType: string): Promise<LibraryItem[]> => {
  //console.log('condition:', condition)
  let query = supabase
      .from('lv11_library_items')
      .select('*')
      .eq('library_type', libraryType)
      .order('released', { ascending: false })
  const { data: result, error } = await query
  if (error) {
    console.error('Error fetchItems:', error)
    return []
  }
  return result
}

export const mergeItem = async (newData: LibraryItem): Promise<LibraryItem> => {
  if (newData.item_id) return await updateItem(newData)
  else return await insertItem(newData)
}

const insertItem = async (newData: LibraryItem): Promise<LibraryItem> => {
  const { item_id, task_id, task_status, ...insertData } = newData
  console.log('insertData:', insertData)
  const { data: result, error } = await supabase
      .from('lt11_libray_items')
      .insert(insertData)
      .select()
      .single()
  if (error || !result) {
    console.error('Error insertItem:', error)
    throw(error)
  }
  console.log("insertItem Complete Result:", result)
  return result
}

const updateItem = async (newData: LibraryItem): Promise<LibraryItem> => {
  const { task_id, task_status, ...newData2 } = newData
  const updateData = { ...newData2,
    updated_at: new Date(),
    updated_count: Number(newData2.updated_count ?? 0) + 1,
  }
  console.log('updateData:', updateData)
  const { data: result, error } = await supabase    
      .from('lt11_libray_items')
      .update(updateData)
      .eq('item_id', updateData.item_id)
      .select()
      .single()
  if (error) {
    console.error('Error updateItem:', error)
    throw(error)
  }
  console.log('updateItem Complete Result:', result)
  return result
}

export const fetchItemMst = async (libraryType: string): Promise<LibraryItemMst> => {
  const { data: result, error } = await supabase
      .from('lm11_library_item_mst')
      .select('*')
      .eq('library_type', libraryType)
      .single()
  if (error) {
      console.error('Error fetchItemMst:', error)
      throw error
  }
  return result
}
