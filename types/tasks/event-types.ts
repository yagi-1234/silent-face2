export type CalendarEvent = {
  id: string
  title: string
  start: string
  backgroundColor: string
}

export type EventItem = {
  event_id: string | ''
  event_type: string | ''
  task_id: string | null
  event_name: string | ''
  event_name_2: string | ''
  location: string | null
  start_at: Date
  start_time: string | null
  organized: string | null
  event_url: string | null
  priority: string | ''
  event_comment: string | ''
  updated_at: Date | null
  updated_count: Number | null
}
export const initialEventItem: EventItem = {
  event_id: '',
  event_type: '',
  task_id: null,
  event_name: '',
  event_name_2: '',
  location: null,
  start_at: new Date(),
  start_time: null,
  organized: null,
  event_url: null,
  priority: '',
  event_comment: '',
  updated_at: null,
  updated_count: 0
}