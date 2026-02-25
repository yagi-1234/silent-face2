export type ReleaseRow = {
  release_id: string | null
  user_id: string | null
  version: number | null
  release_type: string | null
  release_date: Date | null
  release_comment: string | null
  created_at: Date | null
  updated_at: Date | null
  updated_count: number | null
}

export type ReleaseView = ReleaseRow & {
}

export const initialWeight: ReleaseView = {
  release_id: null,
  user_id: null,
  version: null,
  release_type: null,
  release_date: null,
  release_comment: null,
  created_at: null,
  updated_at: null,
  updated_count: 0,
}
