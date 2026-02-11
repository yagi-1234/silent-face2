import { supabase } from '@/lib/supabase'
import type { ValidationErrors } from '@/types/common/common-types'
import type { LiveTrackRow, LiveTrackView } from '@/types/music/liveTrack-types'

export const fetchLiveTracks = async (eventId: string): Promise<LiveTrackView[]> => {

  let query = supabase
      .from('mt51_live_tracks')
      .select('*')
  query = query.eq('event_id', eventId)
  query = query.order('play_order')
  const { data: result, error } = await query
  if (error) {
    console.error('Error fetchLiveTracks:', error)
    throw error
  }

  return result
}

export const insertLiveTrack = async (newData: LiveTrackView) => {
  const insertData = copyViewToRecord(newData, 'i')
  console.log('insertData:', insertData)
  const { data: result, error } = await supabase
      .from('mt51_live_tracks')
      .insert(insertData)
      .select()
      .single()
  if (error || !result) {
    console.error('Error insertLiveTrack:', error)
    throw(error)
  }
  console.log('insertLiveTrack Complete Result:', result)
  return result
}

export const updateLiveTrack = async (newData: LiveTrackView) => {
  const updateData = copyViewToRecord(newData, 'u')
  console.log('updateData:', updateData)
  const { data: result, error } = await supabase
      .from('mt51_live_tracks')
      .update(updateData)
      .eq('live_track_id', updateData.live_track_id)
      .select()
      .single()
  if (error || !result) {
    console.error('Error updateTrack:', error)
    throw(error)
  }
  console.log("updateTrack Complete Result:", result)
  return result
}

const copyViewToRecord = (view: LiveTrackView, processType: string): Partial<LiveTrackRow> => {
  const nowDate = new Date()
  const {
    ...row
  } = view
  switch (processType) {
    case "i": {
      const { live_track_id, ...insertData } = {
        ...row,
        created_at: nowDate,
        updated_at: nowDate,
      }
      return insertData
    }
    case "u": {
      return {
        ...row,
        updated_at: nowDate,
        updated_count: Number(row.updated_count ?? 0) + 1
      }
    }
  }
  return row
}
