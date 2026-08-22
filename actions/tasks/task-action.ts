import { supabase } from "@/lib/supabase"

import { updateItemByUpdatingTask } from '@/actions/library/library-action'
import { updateAlbumByUpdatingTask } from '@/actions/music/album-action'
import type { ValidationErrors } from '@/types/common/common-types'
import type { TaskRow, TaskView, TaskListView, Task, TaskCondition, MusicTask, MusicTaskCondition, TaskGroupView,
    TaskNewView, TaskContentView, TaskHistoryView } from '@/types/tasks/task-types'

export const fetchTask = async (taskId: string): Promise<TaskView> => {
    console.log('taskId:', taskId)
    const { data, error } = await supabase
            .from('tt01_tasks')
            .select('*')
            .eq('task_id', taskId)
            .single()
    if (error) {
        console.error('Error fetchTask:', error)
        throw error
    }
    console.log("data:", data)
    return data
}

export const mergeTask = async (newData: TaskView, updateTaskKey: string): Promise<TaskView> => {
  if (newData.task_id) {
    const result = await updateTask(newData)
    if (updateTaskKey) await updateItemByUpdatingTask(updateTaskKey, newData.action_count, newData.last_acted_at)
    return await fetchTask(result.task_id ?? '')
  } else {
    const result = await insertTask(newData)
    return await fetchTask(result.task_id ?? '')
  }
}

const insertTask = async (newData: TaskView): Promise<TaskRow> => {
  const insertData = copyViewToRecord(newData, 'i')
  console.log('insertData:', insertData)
  const { data: result, error } = await supabase
      .from('tt01_tasks')
      .insert(insertData)
      .select()
      .single()
  if (error || !result) {
      console.log('error')
      alert ('Error: insertTask Failed')
      throw(error)
  }
  console.log("insertTask Complete Result:", result)
  return result
}

const updateTask = async (newData: TaskView): Promise<TaskRow> => {
  const updateData = copyViewToRecord(newData, 'u')
  console.log('updateData:', updateData)
  const { data: result, error } = await supabase    
      .from('tt01_tasks')
      .update(updateData)
      .eq('task_id', updateData.task_id)
      .select()
      .single()
  if (error) {
      alert ('Error: updateTask Failed')
      throw(error)
  }
  console.log('updateTask Complete Result:', result)
  return result
}

// export const updateLastActedAt = async (taskId: string): Promise<Task> => {
//     const oldData = await fetchTask(taskId)
//     if (!oldData)
//         throw "error"
//     const newLastActedAt = new Date()
//     if (oldData.schedule_type === '1') { // Spot
//         return oldData
//     } else if (oldData.schedule_type === '2') { // Regularly
//         const newNextDate = new Date(newLastActedAt)
//         newNextDate.setHours(9, 0, 0, 0)
//         newNextDate.setDate(newNextDate.getDate() + Number(oldData.task_cycle))
//         const newLimitDate = new Date(newNextDate)
//         newLimitDate.setDate(newLimitDate.getDate() + Number(oldData.buffer_period))
//         const newData = { ...oldData,
//             last_acted_at: newLastActedAt,
//             next_date: newNextDate,
//             limit_date: newLimitDate,
//             action_count: Number(oldData.action_count) + 1,
//         }
//         return await updateTask(newData)
//     } else {
//         throw 'error'
//     }
// }

export const updateTaskStatus = async (taskId: string, taskStatus: string): Promise<TaskView> => {
    const oldData = await fetchTask(taskId)
    console.log('oldData:', oldData)
    if (!oldData)
      throw 'error'

    const newData = { ...oldData,
      task_status: taskStatus,
      next_date: (taskStatus === '8' || taskStatus === '9') ? null : oldData.next_date,
      limit_date: (taskStatus === '8' || taskStatus === '9') ? null : oldData.limit_date,
    }
    await updateTask(newData)
    return await fetchTask(taskId)
}

export const validateTask = (task: TaskView): ValidationErrors => {
    const errors: ValidationErrors = {}

    if (task.task_name && !task.task_name.trim())
        errors.task_name = "Task name is required."
    return errors
}

export const isTaskEdited = (original?: TaskView, current?: TaskView): boolean => {
  if (!original || !current) return true;
  return (
    original.task_type !== current.task_type ||
    original.task_name !== current.task_name ||
    original.priority !== current.priority ||
    original.task_status !== current.task_status ||
    original.schedule_type !== current.schedule_type ||
    (!original.last_acted_at && !current.last_acted_at
      ? false
      : new Date(original.last_acted_at || "").getTime() !==
        new Date(current.last_acted_at || "").getTime()) ||
    original.task_group_id !== current.task_group_id ||
    (!original.next_date && !current.next_date
      ? false
      : new Date(original.next_date || "").getTime() !==
        new Date(current.next_date || "").getTime()) ||
    original.buffer_period !== current.buffer_period ||
    (!original.limit_date && !current.limit_date
      ? false
      : new Date(original.limit_date || "").getTime() !==
        new Date(current.limit_date || "").getTime()) ||
    original.action_count !== current.action_count ||
    original.task_comment !== current.task_comment
  )
}

export const fetchMusicTask = async (task_sub_id: string): Promise<MusicTask> => {
  const { data: result, error } = await supabase
      .from('ct02_music_tasks')
      .select('*')
      .eq('task_sub_id', task_sub_id)
      .single()
  if (error) {
    console.error('Error fetchMusicTask:', error)
    throw error
  }
  return result
}

export const fetchMusicTasks = async (condition: MusicTaskCondition): Promise<MusicTask[]> => {
  const { data: result, error } = await supabase
      .from('cv02_music_tasks')
      .select('*')
      .in('task_status', condition.taskStatusList)
      .order('task_status', { ascending: false })
      .order('row_num', { ascending: true })
  if (error) {
    console.error('Error fetchMusicTasks:', error)
    return []
  }
  return result
}

export const mergeMusicTask = async (newData: MusicTask, updateAlbumKey: string): Promise<MusicTask> => {
  console.log('newData:', newData)
  if (newData.task_sub_id) {
    const result = await updateMusicTask(newData)
    if (updateAlbumKey) await updateAlbumByUpdatingTask(updateAlbumKey, newData.last_acted_at)
    return result
  }
  else return await insertMusicTask(newData)
}

const insertMusicTask = async (newData: MusicTask): Promise<MusicTask> => {
  const maxTaskStatus = await fetchMaxTaskStatus(newData.task_status ?? '', newData.task_sub_type ?? '')
  const { task_sub_id, created_at, row_num, new_task_priority, priority_difference, ...newData2 } = newData
  const newData3 = { ...newData2,
    task_priority: Number(maxTaskStatus) + 1,
    updated_at: new Date(),
  }
  const { data: result, error } = await supabase
      .from('ct02_music_tasks')
      .insert(newData3)
      .select()
      .single()
    if (error || !result) {
      console.error('Error insertMusicTask:', error)
      throw(error)
    }
    console.log("insertMusicTask Complete Result:", result)
    return result
}

const updateMusicTask = async (newData: MusicTask): Promise<MusicTask> => {
  const { row_num, new_task_priority, priority_difference, ...newData2 } = newData
  const updateData = { ...newData2,
    updated_at: new Date(),
    updated_count: Number(newData2.updated_count ?? 0) + 1
  }
  console.log('updateData:', updateData)
  const { data: result, error } = await supabase
      .from('ct02_music_tasks')
      .update(updateData)
      .eq('task_sub_id', newData.task_sub_id)
      .select()
      .single()
    if (error || !result) {
      console.error('Error updateMusicTask:', error)
      throw(error)
    }
    console.log("updateMusicTask Complete Result:", result)
    return result
}

export const updateMusicTaskStatus = async (taskSubId: string, taskStatus: string) => {
  const oldData = await fetchMusicTask(taskSubId)
  console.log('oldData:', oldData)
  if (!oldData)
    throw 'error'

  const maxTaskStatus = await fetchMaxTaskStatus(taskStatus, oldData.task_sub_type ?? '')
  console.log('maxTaskStatus:', maxTaskStatus)

  const newData = { ...oldData,
    task_status: taskStatus,
    task_priority: Number(maxTaskStatus) + 1
  }
  const result = await updateMusicTask(newData)

  await updateMusicTasksPriority(oldData.task_status ?? '', oldData.task_sub_type ?? '', oldData.task_priority ?? 0)

  return result
}

export const updateMusicTasksPriority = async (taskStatus: string, taskSubType: string, taskPriority: number) => {
  const oldData = await fetchMusicTasksByTaskStatus(taskStatus, taskSubType, taskPriority)
  if (!oldData || oldData.length === 0)
    return
  const newData = oldData.map((row) => ({
    ...row,
    task_priority: row.task_priority ? row.task_priority - 1 : null
  }))
  for (const row of newData) {
    await updateMusicTask(row)
  }
}
const fetchMusicTasksByTaskStatus = async (taskStatus: string, taskSubType: string, taskPriority: number): Promise<MusicTask[]> => {
  let query = supabase.from('ct02_music_tasks')
      .select('*')
  if (taskStatus === '0') query = query.eq('task_sub_type', taskSubType)
  query = query.eq('task_status', taskStatus)
  query = query.gt('task_priority', taskPriority)
  const { data: oldData, error } = await query
  if (error) throw error
  return oldData
}
const fetchMaxTaskStatus = async (taskStatus: string, taskSubType: string): Promise<number> => {
  console.log(taskStatus, taskSubType)
  let query = supabase
      .from('cv02_max_priority_music_tasks')
      .select('max_task_priority')
  query = query.eq('task_status', taskStatus)
  if (taskStatus === '0') query = query.eq('task_sub_type', taskSubType)
  else query = query.eq('task_sub_type', '99')
  const { data: result, error } = await query
  if (error) {
    console.error('Error fetchMaxTaskStatus:', error)
    throw error
  }
  if (!result[0]) return 0
  return result[0].max_task_priority
}

export const refreshMusicTask = async (condition: MusicTaskCondition): Promise<MusicTask[]> => {
  const oldData = await fetchMusicTasksForRefresh()
  if (!oldData || oldData.length === 0)
    return []
  const newData = oldData.map((row) => ({
    ...row,
    task_priority: row.new_task_priority
  }))
  for (const row of newData)
    await updateMusicTask(row)
  return await fetchMusicTasks(condition)
}
const fetchMusicTasksForRefresh = async (): Promise<MusicTask[]> => {
  const taskStatusList = ['0','1']
  const { data: result, error } = await supabase
      .from('cv02_music_tasks')
      .select('*')
      .in('task_status', taskStatusList)
      .eq('priority_difference', '1')
  if (error) {
    console.error('Error fetchMusicTasksForRefresh:', error)
    throw error
  }
  return result
}

export const isMusicTaskEdited = (original?: MusicTask, current?: MusicTask): boolean => {
  if (!original || !current) return true;
  return (
    original.task_sub_type !== current.task_sub_type ||
    original.task_status !== current.task_status ||
    original.task_priority !== current.task_priority ||
    original.artist_id !== current.artist_id ||
    original.artist_name !== current.artist_name ||
    original.album_id !== current.album_id ||
    original.album_name !== current.album_name ||
    original.action_count !== current.action_count ||
    (!original.last_acted_at && !current.last_acted_at
      ? false
      : new Date(original.last_acted_at || "").getTime() !==
        new Date(current.last_acted_at || "").getTime()) ||
    original.task_comment !== current.task_comment
  )
}

export const fetchTasks = async (condition: TaskCondition): Promise<TaskListView[]> => {
  console.log('condition:', condition)
  let query = supabase.from('tv01_tasks').select('*')
  if (condition.task_type) query = query.eq('task_type', condition.task_type)
  if (condition.task_status_list.length > 0) query = query.in('task_status', condition.task_status_list)
  query = query.order('task_type')
  query = query.order('task_group_order')
  query = query.order('next_date')
  query = query.order('task_status', { ascending: false })
  query = query.order('last_acted_at', { ascending: false })
  const { data: result, error } = await query
  if (error) {
      console.error('Error fetchTasks:', error)
      return []
  }
  return result
}

export const fetchTaskGroups = async (taskType: string): Promise<TaskGroupView[]> => {
    console.log('taskType:', taskType)
    const { data: result, error } = await supabase
        .from('tt02_task_groups')
        .select('*')
        .eq('task_type', taskType)
    if (error) {
        console.error('Error fetchTaskGroups:', error)
        throw error
    }
    return result
}

const copyViewToRecord = (view: TaskView, processType: string): Partial<TaskRow> => {
  const nowDate = new Date()
  const {
    ...row
  } = view
  switch (processType) {
    case 'i': {
      const { task_id, ...insertData } = {
        ...row,
        created_at: nowDate,
        updated_at: nowDate,
      }
      return insertData
    }
    case 'u': {
      return {
        ...row,
        updated_at: nowDate,
        updated_count: Number(row.updated_count ?? 0) + 1
      }
    }
  }
  return row
}

// ---------------------------


export const fetchTaskNew = async (taskId: string): Promise<TaskNewView> => {
  let query = supabase
      .from('tt01_tasks_new')
      .select('*')
      .eq('task_id', taskId)
      .single()
  const { data: result, error } = await query
  if (error) {
    console.error('Error fetchTaskNew:', error)
    throw error
  }
  return result
}
export const fetchTasksNew = async (taskType?: string): Promise<TaskNewView[]> => {
  // console.log('condition:', condition)
  let query = supabase
      .from('tv01_tasks_new')
      .select('*')
  if (taskType) query = query.eq('task_type', taskType)
  query = query
      .order('task_type')
      .order('task_name')
  const { data: result, error } = await query
  if (error) {
    console.error('Error fetchTasksNew:', error)
    return []
  }
  return result
}
// export const fetchTaskTypes = async (taskType: string): Promise<string[]> => {
//   let query = supabase
//       .from('tv01_tasks_new')
//       .select('task_key', 'task_name')
//       .eq('task_type', taskType)
//       .order('task_name')
//   const { data: result, error } = await query
//   if (error) {
//     console.error('Error fetchTaskTypes:', error)
//     return []
//   }
//   return result.map(item => item.task_key ?? '')
// }
export const mergeTaskNew = async (newData: TaskNewView): Promise<string> => {
  if (newData.task_id) {
    const result = await updateTaskNew(newData)
    return result.task_id || ''
  } else {
    const result = await insertTaskNew(newData)
    return result.task_id || ''
  }
}
export const insertTaskNew = async (newData: TaskNewView) => {
  const insertData = copyViewToRecordTaskNew(newData, 'i')
  console.log('insertData:', insertData)
  const { data: result, error } = await supabase
      .from('tt01_tasks_new')
      .insert(insertData)
      .select()
      .single()
  if (error || !result) {
    console.error('Error insertTaskNew:', error)
    throw(error)
  }
  console.log('insertTaskNew Complete Result:', result)
  return result
}
export const updateTaskNew = async (newData: TaskNewView) => {
  const updateData = copyViewToRecordTaskNew(newData, 'u')
  console.log('updateData:', updateData)
  const { data: result, error } = await supabase
      .from('tt01_tasks_new')
      .update(updateData)
      .eq('task_id', newData.task_id)
      .select()
      .single()
  if (error || !result) {
    console.error('Error updateTaskNew:', error)
    throw(error)
  }
  console.log("updateTaskNew Complete Result:", result)
  return result
}
const copyViewToRecordTaskNew = (view: TaskNewView, processType: string): Partial<TaskNewView> => {
  const nowDate = new Date()
  const {
    ...row
  } = view
  switch (processType) {
    case 'i': {
      const { task_id, ...insertData } = {
        ...row,
        created_at: nowDate,
        updated_at: nowDate,
      }
      return insertData
    }
    case 'u': {
      return {
        ...row,
        updated_at: nowDate,
        updated_count: Number(row.updated_count ?? 0) + 1
      }
    }
  }
  return row
}

export const fetchTaskContent = async (taskContentId: string): Promise<TaskContentView> => {
  console.log('taskContentId:', taskContentId)
  let query = supabase
      .from('tv02_task_contents')
      .select('*')
      .eq('task_content_id', taskContentId)
      .single()
  const { data: result, error } = await query
  if (error) {
    console.error('Error fetchTaskContent:', error)
    throw error
  }
  return result
}
export const fetchTaskContents = async (taskId: string): Promise<TaskContentView[]> => {
  let query = supabase
      .from('tt02_task_contents')
      .select('*')
      .eq('task_id', taskId)
  const { data: result, error } = await query
  if (error) {
    console.error('Error fetchTaskContents:', error)
    return []
  }
  return result
}
export const mergeTaskContent = async (newData: TaskContentView): Promise<string> => {
  if (newData.task_content_id) {
    const result = await updateTaskContent(newData)
    return result.task_content_id || ''
  } else {
    const result = await insertTaskContent(newData)
    return result.task_content_id || ''
  }
}
export const insertTaskContent = async (newData: TaskContentView) => {
  const insertData = copyViewToRecordTaskContent(newData, 'i')
  console.log('insertData:', insertData)
  const { data: result, error } = await supabase
      .from('tt02_task_contents')
      .insert(insertData)
      .select()
      .single()
  if (error || !result) {
    console.error('Error insertTaskContent:', error)
    throw(error)
  }
  console.log('insertTaskContent Complete Result:', result)
  return result
}
export const updateTaskContent = async (newData: TaskContentView) => {
  const updateData = copyViewToRecordTaskContent(newData, 'u')
  console.log('updateData:', updateData)
  const { data: result, error } = await supabase
      .from('tt02_task_contents')
      .update(updateData)
      .eq('task_content_id', newData.task_content_id)
      .select()
      .single()
  if (error || !result) {
    console.error('Error updateTaskContent:', error)
    throw(error)
  }
  console.log("updateTaskContent Complete Result:", result)
  return result
}
const copyViewToRecordTaskContent = (view: TaskContentView, processType: string): Partial<TaskContentView> => {
  const nowDate = new Date()
  const {
    ...row
  } = view
  switch (processType) {
    case 'i': {
      const { task_content_id, task_name, task_type, act_count, last_acted_at, completed, ...insertData } = {
        ...row,
        created_at: nowDate,
        updated_at: nowDate,
      }
      return insertData
    }
    case 'u': {
      const { task_name, task_type, act_count, last_acted_at, completed, ...updateData } = {
        ...row,
        updated_at: nowDate,
        updated_count: Number(row.updated_count ?? 0) + 1
      }
      return updateData
    }
  }
  return row
}

export const fetchTaskHistory = async (taskHistoryId: string): Promise<TaskHistoryView> => {
  let query = supabase
      .from('tv03_task_histories')
      .select('*')
      .eq('task_history_id', taskHistoryId)
      .single()
  const { data: result, error } = await query
  if (error) {
    console.error('Error fetchTaskHistory:', error)
    throw error
  }
  return result
}
export const fetchTaskHistories = async (taskContentId: string): Promise<TaskHistoryView[]> => {
  let query = supabase
      .from('tt03_task_histories')
      .select('*')
      .eq('task_content_id', taskContentId)
  const { data: result, error } = await query
  if (error) {
    console.error('Error fetchTaskHistories:', error)
    return []
  }
  return result
}
export const mergeTaskHistory = async (newData: TaskHistoryView): Promise<string> => {
  if (newData.task_history_id) {
    const result = await updateTaskHistory(newData)
    return result.task_history_id || ''
  } else {
    const result = await insertTaskHistory(newData)
    return result.task_history_id || ''
  }
}
export const insertTaskHistory = async (newData: TaskHistoryView) => {
  const insertData = copyViewToRecordTaskHistory(newData, 'i')
  console.log('insertData:', insertData)
  const { data: result, error } = await supabase
      .from('tt03_task_histories')
      .insert(insertData)
      .select()
      .single()
  if (error || !result) {
    console.error('Error insertTaskHistory:', error)
    throw(error)
  }
  console.log('insertTaskHistory Complete Result:', result)
  return result
}
export const updateTaskHistory = async (newData: TaskHistoryView) => {
  const updateData = copyViewToRecordTaskHistory(newData, 'u')
  console.log('updateData:', updateData)
  const { data: result, error } = await supabase
      .from('tt03_task_histories')
      .update(updateData)
      .eq('task_history_id', newData.task_history_id)
      .select()
      .single()
  if (error || !result) {
    console.error('Error updateTaskHistory:', error)
    throw(error)
  }
  console.log("updateTaskHistory Complete Result:", result)
  return result
}
const copyViewToRecordTaskHistory = (view: TaskHistoryView, processType: string): Partial<TaskHistoryView> => {
  const nowDate = new Date()
  const {
    ...row
  } = view
  switch (processType) {
    case 'i': {
      const { task_history_id, task_id, task_name, task_type, task_content_name, ...insertData } = {
        ...row,
        created_at: nowDate,
        updated_at: nowDate,
      }
      return insertData
    }
    case 'u': {
      const { task_id, task_name, task_type, task_content_name, ...updateData } = {
        ...row,
        updated_at: nowDate,
        updated_count: Number(row.updated_count ?? 0) + 1
      }
      return updateData
    }
  }
  return row
}