export type LibraryItem = {
  item_id: string
  library_type: string
  item_name_0: string
  item_name_1: string
  item_name_2: string
  author_name_0: string
  author_name_1: string
  author_name_2: string
  owner_name: string
  source_name: string
  actors_1: string
  actors_2: string
  music: string
  released: string
  volumes: number | null
  completed_flag: string
  genre: string
  owned_flag: string
  added_at: Date | null
  action_count: number | null
  progress: number | null
  last_actioned_at: Date | null
  grade: string | null
  item_comment: string
  created_at: Date | null
  updated_at: Date | null
  updated_count: number | null
  task_id: string | null
  task_status: string | null
}

export const initialLibraryItem: LibraryItem = {
  item_id: '',
  library_type: '',
  item_name_0: '',
  item_name_1: '',
  item_name_2: '',
  author_name_0: '',
  author_name_1: '',
  author_name_2: '',
  owner_name: '',
  source_name: '',
  actors_1: '',
  actors_2: '',
  music: '',
  released: '',
  volumes: null,
  completed_flag: '',
  genre: '',
  owned_flag: '0',
  added_at: null,
  action_count: 0,
  progress: null,
  last_actioned_at: null,
  grade: '',
  item_comment: '',
  created_at: null,
  updated_at: null,
  updated_count: 0,
  task_id: '',
  task_status: '',
}

export type LibraryItemMst = {
  library_type: string
  item_type: string | null
  item_name: string | null
  item_name_2: string | null
  author_name: string | null
  author_name_2: string | null
  owner_name: string | null
  source_name: string | null
  actors_1: string | null
  actors_2: string | null
  music: string | null
  released: string | null
  volumes: string | null
  completed_flag: string | null
  genre: string | null
  owned_flag: string | null
  action_count: string | null
  last_actioned_at: string | null
  created_at: Date | null
  updated_at: Date | null
  updated_count: number | null
}