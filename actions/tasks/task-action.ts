import { supabase } from "@/lib/supabase"

import { updateItemByUpdatingTask } from '@/actions/library/library-action'
import type { ValidationErrors } from '@/types/common/common-types'
import type { Task, TaskCondition, MusicTask, MusicTaskCondition } from '@/types/tasks/task-types'

import { formatDateToYYYYMMDD } from '@/utils/dateFormat'

export const fetchTask = async (taskId: string): Promise<Task> => {
    console.log('taskId:', taskId)
    const { data, error } = await supabase
            .from('ct01_tasks')
            .select('*')
            .eq('task_id', taskId)
            .single()
    if (error) {
        console.error('Error fetching tasks:', error)
        throw error
    }
    console.log("data:", data)
    return data
}

export const fetchTasks = async (condition: TaskCondition): Promise<Task[]> => {
  console.log('condition:', condition)
  let query = supabase.from('ct01_tasks').select('*')
  if (condition.task_type) query = query.eq('task_type', condition.task_type)
  if (condition.task_status_list.length > 0) query = query.in('task_status', condition.task_status_list)
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

export const mergeTask = async (newData: Task, updateTaskKey: string): Promise<Task> => {
    if (newData.task_id) {
      const result = await updateTask(newData)
      if (updateTaskKey) await updateItemByUpdatingTask(updateTaskKey, newData.action_count, newData.last_acted_at)
      return result
    }
    else return await insertTask(newData)
}

const insertTask = async (newData: Task): Promise<Task> => {
    const { task_id, ...insertData } = newData
    console.log("insertData:", insertData)
    const { data: result, error } = await supabase
        .from('ct01_tasks')
        .insert(insertData)
        .select()
        .single()
    if (error || !result) {
        console.log('error')
        alert ('Error: Insert Task Failed')
        throw(error)
    }
    console.log("Insert Task Complete Result:", result)
    return result
}

const updateTask = async (newData: Task): Promise<Task> => {

    const updateData = { ...newData,
        next_date: newData.next_date ? formatDateToYYYYMMDD(new Date(newData.next_date)) : null,
        limit_date: newData.limit_date ? formatDateToYYYYMMDD(new Date(newData.limit_date)) : null,
        updated_at: new Date(),
        updated_count: Number(newData.updated_count ?? 0) + 1
    }
    console.log("updateData:", updateData)
    const { data: result, error } = await supabase    
        .from('ct01_tasks')
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

export const updateLastActedAt = async (taskId: string): Promise<Task> => {
    const oldData = await fetchTask(taskId)
    if (!oldData)
        throw "error"
    const newLastActedAt = new Date()
    if (oldData.schedule_type === '1') { // Spot
        return oldData
    } else if (oldData.schedule_type === '2') { // Regularly
        const newNextDate = new Date(newLastActedAt)
        newNextDate.setHours(9, 0, 0, 0)
        newNextDate.setDate(newNextDate.getDate() + Number(oldData.task_cycle))
        const newLimitDate = new Date(newNextDate)
        newLimitDate.setDate(newLimitDate.getDate() + Number(oldData.buffer_period))
        const newData = { ...oldData,
            last_acted_at: newLastActedAt,
            next_date: newNextDate,
            limit_date: newLimitDate,
            action_count: Number(oldData.action_count) + 1,
        }
        return await updateTask(newData)
    } else {
        throw 'error'
    }
}

export const updateTaskStatus = async (taskId: string, taskStatus: string) => {
    const oldData = await fetchTask(taskId)
    console.log('oldData:', oldData)
    if (!oldData)
      throw 'error'

    const newData = { ...oldData,
      task_status: taskStatus,
      next_date: taskStatus === '9' ? null : oldData.next_date,
      limit_date: taskStatus === '9' ? null : oldData.limit_date,
    }
    return await updateTask(newData)
}

export const validateTask = (task: Task): ValidationErrors => {
    const errors: ValidationErrors = {}

    if (!task.task_name.trim())
        errors.task_name = "Task name is required."
    return errors
}

export const isTaskEdited = (original?: Task, current?: Task): boolean => {
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
    original.task_cycle !== current.task_cycle ||
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

export const mergeMusicTask = async (newData: MusicTask): Promise<MusicTask> => {
  console.log('newData:', newData)
  if (newData.task_sub_id) return await updateMusicTask(newData)
  else return await insertMusicTask(newData)
}

const insertMusicTask = async (newData: MusicTask): Promise<MusicTask> => {
  const maxTaskStatus = await fetchMaxTaskStatus(newData.task_status ?? '', newData.task_sub_type ?? '')
  const { task_sub_id, created_at, row_num, new_task_priority, priority_difference, ...newData2 } = newData
  const newData3 = { ...newData2,
    task_priority: Number(maxTaskStatus) + 1
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

  updateMusicTasksPriority(oldData.task_status ?? '', oldData.task_priority ?? 0)

  return result
}

export const updateMusicTasksPriority = async (taskStatus: string, task_priority: number) => {
  const oldData = await fetchMusicTasksByTaskStatus(taskStatus, task_priority)
  if (!oldData || oldData.length === 0)
    return
  const newData = oldData.map((row) => ({
    ...row,
    task_priority: row.task_priority ? row.task_priority - 1 : null
  }))
  for (const row of newData) {
    updateMusicTask(row)
  }
}
const fetchMusicTasksByTaskStatus = async (taskStatus: string, task_priority: number): Promise<MusicTask[]> => {
  const { data: oldData, error } = await supabase
      .from('ct02_music_tasks')
      .select('*')
      .eq('task_status', taskStatus)
      .gt('task_priority', task_priority)
  if (error) throw error
  return oldData
}
const fetchMaxTaskStatus = async (taskStatus: string, taskSubType: string): Promise<number> => {
  console.log(taskStatus, taskSubType)
  let query = supabase
      .from('cv02_max_priority_music_tasks')
      .select('max_task_priority')
  query = query.eq('task_status', taskStatus)
  if (taskStatus === '0')
    query = query.eq('task_sub_type', taskSubType)
  else
    query = query.eq('task_sub_type', '99')
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
    updateMusicTask(row)
  return fetchMusicTasks(condition)
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
