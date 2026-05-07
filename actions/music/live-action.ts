import { supabase } from '@/lib/supabase'
import type { ValidationErrors } from '@/types/common/common-types'
import type { LiveRow, LiveView, LiveTrackRow, LiveTrackView } from '@/types/music/liveTrack-types'

export const fetchLive = async (liveId: string): Promise<LiveView> => {
  console.log('liveId:', liveId)
  let query = supabase
      .from('mv51_lives')
      .select('*')
      .eq('live_id', liveId)
      .single()
  const { data: result, error } = await query
  if (error) {
    console.error('Error fetchLive:', error)
    throw error
  }
  return result
}
export const fetchLives = async (eventId: string): Promise<LiveView[]> => {
  console.log('eventId:', eventId)
  let query = supabase
      .from('mv51_lives')
      .select('*')
  query = query.eq('event_id', eventId)
  query = query.order('start_time')
  const { data: result, error } = await query
  if (error) {
    console.error('Error fetchLives:', error)
    throw error
  }
  return result
}
export const mergeLive = async (newData: LiveView): Promise<LiveView> => {
  if (newData.live_id) {
    return await updateLive(newData)
  } else {
    return await insertLive(newData)
  }
}
export const insertLive = async (newData: LiveView) => {
  const insertData = copyViewToRecordLive(newData, 'i')
  console.log('insertData:', insertData)
  const { data: result, error } = await supabase
      .from('mt51_lives')
      .insert(insertData)
      .select()
      .single()
  if (error || !result) {
    console.error('Error insertLive:', error)
    throw(error)
  }
  console.log('insertLive Complete Result:', result)
  return result
}
export const updateLive = async (newData: LiveView): Promise<LiveView> => {
  const updateData = copyViewToRecordLive(newData, 'u')
  console.log('updateData:', updateData)
  const { data: result, error } = await supabase
      .from('mt51_lives')
      .update(updateData)
      .eq('live_id', updateData.live_id)
      .select()
      .single()
  if (error || !result) {
    console.error('Error updateLive:', error)
    throw(error)
  }
  console.log('updateLive Complete Result:', result)
  return result
}
const copyViewToRecordLive = (view: LiveView, processType: string): Partial<LiveRow> => {
  const nowDate = new Date()
  const {
    ...row
  } = view
  switch (processType) {
    case 'i': {
      const { live_id, artist_name_1, is_edit, is_select, ...insertData } = {
        ...row,
        created_at: nowDate,
        updated_at: nowDate,
      }
      return insertData
    }
    case 'u': {
      const { artist_name_1, is_edit, is_select, ...updateData } = {
        ...row,
        updated_at: nowDate,
        updated_count: Number(row.updated_count ?? 0) + 1
      }
      return updateData
    }
  }
  return row
}

export const fetchLiveTracks = async (liveId: string): Promise<LiveTrackView[]> => {
  console.log('fetchLiveTracks::live_id:', liveId)
  let query = supabase
      .from('mt52_live_tracks')
      .select('*')
  query = query.eq('live_id', liveId)
  query = query.order('play_order')
  const { data: result, error } = await query
  if (error) {
    console.error('Error fetchLiveTracks:', error)
    throw error
  }
  console.log(result)
  return result
}

export const insertLiveTrack = async (newData: LiveTrackView) => {
  const insertData = copyViewToRecord(newData, 'i')
  console.log('insertData:', insertData)
  const { data: result, error } = await supabase
      .from('mt52_live_tracks')
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
      .from('mt52_live_tracks')
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
