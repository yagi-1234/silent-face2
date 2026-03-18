export type TaskRow = {
  task_id: string | null
  user_id: string | null
  task_type: string | null
  task_group_id: string | null
  task_key: string | null
  task_name: string | null
  priority: string | null
  task_status: string | null
  schedule_type: string | null
  action_count: number | null
  first_acted_at: Date | null
  last_acted_at: Date | null
  next_period: number | null
  next_date: Date | null
  buffer_period: number | null
  limit_date: Date | null
  task_comment: string | null
  created_at: Date | null
  updated_at: Date | null
  updated_count: number | null
}

export type TaskView = TaskRow & {
}

export type TaskListView = TaskRow & {
  task_group_name: string | null
}

export const initialTask: TaskView = {
  task_id: null,
  user_id: null,
  task_type: null,
  task_group_id: null,
  task_key: null,
  task_name: null,
  priority: null,
  schedule_type: null,
  task_status: '0',
  action_count: 0,
  first_acted_at: null,
  last_acted_at: null,
  next_period: null,
  next_date: null,
  buffer_period: null,
  limit_date: null,
  task_comment: null,
  created_at: null,
  updated_at: null,
  updated_count: 0,
}

export type TaskGroupRow = {
  task_group_id: string | null
  user_id: string | null
  task_type: string | null
  task_group_name: string | null
  task_group_status: string | null
  task_group_order: number | null
  created_at: Date | null
  updated_at: Date | null
  updated_count: number | null
}
export type TaskGroupView = TaskGroupRow & {

}
export const initialTaskGroup: TaskGroupView = {
  task_group_id: null,
  user_id: null,
  task_type: null,
  task_group_name: null,
  task_group_status: '0',
  task_group_order: null,
  created_at: null,
  updated_at: null,
  updated_count: 0,
}





















export type Task = {
  task_id: string | null
  task_type: string
  task_cycle: string
  task_key: string | null
  task_name: string
  priority: string
  task_status: string
  schedule_type: string
  task_progress: number | null
  action_count: number | null
  first_acted_at: Date | null
  last_acted_at: Date | null
  next_period: number | null
  next_date: Date | null
  buffer_period: number | null
  limit_date: Date | null
  task_comment: string | null
  updated_at: Date | null
  updated_count: number | null
  task_group_name: string | null
}

export type TaskUIState = Task & {
    isEditing_task_name: boolean
    isEditing_task_cycle: boolean
}

// export const initialTask: Task = {
//   task_id: null,
//   task_type: '',
//   task_cycle: '',
//   task_key: null,
//   task_name: '',
//   priority: '2',
//   task_status: '0',
//   schedule_type: '',
//   task_progress: null,
//   action_count: 0,
//   first_acted_at: null,
//   last_acted_at: null,
//   next_period: null,
//   next_date: null,
//   buffer_period: null,
//   limit_date: null,
//   task_comment: null,
//   updated_at: null,
//   updated_count: 0,
//   task_group_name: null,
// }

export type TaskCondition = {
  task_type: string
  task_status_list: string[]
}

export const initialTaskCondition: TaskCondition = {
  task_type: '',
  task_status_list: ['0','1']
}

export type MusicTask = {
  task_sub_id: string | null
  task_id: string | null
  task_sub_type: string | null
  task_status: string | null
  task_priority: number | null
  artist_id: string | null
  artist_name: string | null
  album_id: string | null
  album_name: string | null
  action_count: number
  last_acted_at: Date | null
  task_comment: string | null
  created_at: Date | null
  updated_at: Date | null
  updated_count: number
  row_num: number | null
  new_task_priority: number | null
  priority_difference: string | null 
}

export const initialMusicTask: MusicTask = {
  task_sub_id: null,
  task_id: null,
  task_sub_type: null,
  task_status: '0',
  task_priority: null,
  artist_id: null,
  artist_name: null,
  album_id: null, 
  album_name: null, 
  action_count: 0, 
  last_acted_at: null, 
  task_comment: null, 
  created_at: null, 
  updated_at: null,
  updated_count: 0,
  row_num: 0,
  new_task_priority: 0,
  priority_difference: '0',
}

export type MusicTaskCondition = {
  taskStatusList: string[]
}

export const initialMusicTaskCondition: MusicTaskCondition = {
  taskStatusList: ['0','1','2']
}
