export type BatchLogsRow = {
  job_id: string | null
  job_sub_id: string | null
  job_executed_at: Date | null
  job_status: number | null
  job_message: string | null
  created_at: Date | null
  updated_at: Date | null
  updated_count: number | null
}

export type BatchLogsView = BatchLogsRow & {
}

// export const initialWeight: ReleaseView = {
//   release_id: null,
//   user_id: null,
//   version: null,
//   release_type: null,
//   release_date: null,
//   release_comment: null,
//   created_at: null,
//   updated_at: null,
//   updated_count: 0,
// }
