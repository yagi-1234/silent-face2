export type TaskTypeRow = {
  task_type: string | null
  task_sub_type: string | null
  user_id: string | null
  task_type_name: string | null
  created_at: Date | null
  updated_at: Date | null
  updated_count: number | null
}

export type TaskTypeView = TaskTypeRow & {
  is_edit: boolean | null
}

export const initialTaskType: TaskTypeView = {
  task_type: null,
  task_sub_type: null,
  user_id: null,
  task_type_name: null,
  created_at: null,
  updated_at: null,
  updated_count: 0,
  is_edit: false
}
  