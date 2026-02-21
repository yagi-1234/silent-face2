export type NoteRow = {
  note_id: string | null
  user_id: string | null
  category: string | null
  title: string | null
  content: string | null
  created_at: Date | null
  updated_at: Date | null
  updated_count: number | null
}

export type NoteView = NoteRow & {
}

export const initialNote: NoteView = {
  note_id: null,
  user_id: null,
  category: null,
  title: null,
  content: null,
  created_at: null,
  updated_at: null,
  updated_count: 0,
}