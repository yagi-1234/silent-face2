export type CodeRow = {
  code_name: string | null
  code_key: string | null
  code_value: string | null
  code_value_short: string | null
  code_order: number | null
  deleted: string | null
  created_at: Date | null
  updated_at: Date | null
  updated_count: number | null
}
export type CodeView = CodeRow & {
  edited: string | null
}
export const initialCode: CodeView = {
  code_name: null,
  code_key: null,
  code_value: null,
  code_value_short: null,
  code_order: null,
  deleted: null,
  created_at: null,
  updated_at: null,
  updated_count: 0,
  edited: 'i'
}

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
  