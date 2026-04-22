import { supabase } from '@/lib/supabase'

import type { LibraryItem, LibraryItemMst, LibraryCondition } from '@/types/library/library-types'
import { TaskView, initialTask } from '@/types/tasks/task-types'
import { makeKeywordForSql } from '@/utils/stringUtils'

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

export const fetchItemForTask = async (itemId: string): Promise<TaskView> => {
  const fetchData = await fetchItem(itemId)
  const task = { ...initialTask,
    task_key: fetchData.item_id,
    task_type: fetchData.library_type,
    task_name: fetchData.item_name_1 + (fetchData.author_name_1 ? '/' + fetchData.author_name_1 : ''),
  }
  return task
}

export const fetchItems = async (condition: LibraryCondition, pageNo: number): Promise<LibraryItem[]> => {
  console.log('condition:', condition)
  const fetchCount = 20
  let query = supabase
      .from('lv11_library_items')
      .select('*')
      .eq('library_type', condition.library_type)
  if (condition.item_type) query = query.eq('item_type', condition.item_type)
  if (condition.item_name) {
    const itemName = makeKeywordForSql(condition.item_name, true)
    query = query.or(`item_name_1.ilike.${itemName},item_name_2.ilike.${itemName}`)
  }
  if (condition.task_status) query = query.eq('task_status', condition.task_status)
  if (condition.actioned === '1') query = query.not('last_actioned_at', 'is', null)
  if (condition.not_actioned === '1') query = query.is('last_actioned_at', null)
  if (condition.order_condition === '1') {
    query = query.not('last_actioned_at', 'is', null)
    query = query.order('last_actioned_at', {ascending: false})
  } else {
    query = query.order('released', { ascending: false })
  }
  query = query.range(fetchCount * pageNo, fetchCount * (pageNo + 1) - 1)
  const { data: result, error } = await query
  if (error) {
    console.error('Error fetchItems:', error)
    return []
  }
  return result
}

export const fetchItemsCount = async (condition: LibraryCondition): Promise<number> => {
  let query = supabase
      .from('lv11_library_items')
      .select('*', { count: 'exact', head: true })
      .eq('library_type', condition.library_type)
  if (condition.item_type) query = query.eq('item_type', condition.item_type)
  if (condition.item_name) {
    const itemName = makeKeywordForSql(condition.item_name, true)
    query = query.or(`item_name_1.ilike.${itemName},item_name_2.ilike.${itemName}`)
  }
  if (condition.task_status) query = query.eq('task_status', condition.task_status)
  if (condition.actioned === '1') query = query.not('last_actioned_at', 'is', null)
  if (condition.not_actioned === '1') query = query.is('last_actioned_at', null)
  if (condition.order_condition === '1') {
    query = query.not('last_actioned_at', 'is', null)
  }
  const { count, error } = await query
  if (error) {
    console.error('Error fetchItemsCount:', error)
    return 0
  }
  return count ?? 0
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
  console.log(result)
  return result
}

export const updateItemByUpdatingTask = async (itemId: string, actionCount: number | null, lastActedAt: Date | null) => {
  const oldData = await fetchItem(itemId)
  const updateData = { ...oldData,
    action_count: actionCount,
    last_actioned_at: lastActedAt,
    updated_at: new Date(),
    updated_count: Number(oldData.updated_count ?? 0) + 1,
  }
  await updateItem(updateData)
}
