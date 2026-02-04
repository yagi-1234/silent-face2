import { supabase } from '@/lib/supabase'
import type { CalendarEvent, EventItem } from '@/types/tasks/event-types'

export const fetchEvent = async (eventId: string): Promise<EventItem> => {
  let query = supabase
      .from('tt03_events')
      .select('*')
      .eq('event_id', eventId)
      .single()
  const { data: result, error } = await query
  if (error) {
      console.error('Error fetchEvent:', error)
      throw error
  }
  return result
}

export const fetchEvents = async (): Promise<EventItem[]> => {
  let query = supabase
      .from('tt03_events')
      .select('*')
      .order('start_at')
  const { data: result, error } = await query
  if (error) {
      console.error('Error fetchEvents:', error)
      return []
  }
  return result
}

export const mergeEvent = async (newData: EventItem): Promise<EventItem> => {
    if (newData.event_id) {
        return await updateEvent(newData)
    } else {
        return await insertEvent(newData)
    }
}

const insertEvent = async (newData: EventItem): Promise<EventItem> => {
    const { event_id, ...newData2 } = newData
    const insertData = {
      ...newData2,
      updated_at: new Date(),
    }
    console.log('insertData:', insertData)
    const { data: result, error } = await supabase
        .from('tt03_events')
        .insert(insertData)
        .select()
        .single()
    if (error || !result) {
        console.log('error')
        alert ('Error: insertEvent Failed')
        throw(error)
    }
    console.log("insertEvent Complete Result:", result)
    return result
}

const updateEvent = async (newData: EventItem): Promise<EventItem> => {
    const updateData = { ...newData,
        updated_at: new Date(),
        updated_count: Number(newData.updated_count ?? 0) + 1
    }
    console.log('updateData:', updateData)
    const { data: result, error } = await supabase    
        .from('tt03_events')
        .update(updateData)
        .eq('event_id', updateData.event_id)
        .select()
        .single()
    if (error) {
        alert ('Error: updateEvent Failed')
        throw(error)
    }
    console.log('updateEvent Complete Result:', result)
    return result
}
