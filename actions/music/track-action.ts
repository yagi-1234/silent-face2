import { supabase } from '@/lib/supabase'
import type { ValidationErrors } from '@/types/common/common-types'
import type { TrackCondition, Track, ArtistTrackKey } from '@/types/music/track-types'
import { compareDate } from '@/utils/dateFormat'
import { makeKeywordForSql } from '@/utils/stringUtils'

export const fetchTrack = async (trackId: string): Promise<Track> => {
  const { data: result, error } = await supabase
      .from('mv31_tracks')
      .select('*')
      .eq('track_id', trackId)
      .single()
  if (error) {
      console.error('Error fetchTrack:', error)
      throw error
  }
  return result
}

export const fetchTrackByTrackNo = async (albumId: string, disc_no: number | null, trackNo: number): Promise<Track | null> => {
  let query = supabase
      .from('mv31_tracks')
      .select('*')
  query = query.eq('album_id', albumId)
  query = query.eq('disc_no_for_sort', disc_no)
  query = query.eq('track_no', trackNo)
  const { data: result, error } = await query
  if (error) {
      console.error('Error fetchTrack:', error)
      throw error
  }
  if (result.length === 0) return null
  return result[0]
}

export const fetchTracks = async (condition: TrackCondition): Promise<Track[]> => {
  console.log('condition:', condition)
  let query = supabase
      .from('mv31_tracks')
      .select('*')
  if (condition.artist_name) {
    if (condition.artist_name_exact_match) {
      const keyword = makeKeywordForSql(condition.artist_name, false)
      query = query.or(`artist_name_0.eq.${keyword},artist_name_1.eq.${keyword},artist_name_2.eq.${keyword}`)
    } else {
      const keyword = makeKeywordForSql(condition.artist_name, true)
      query = query.or(`artist_name_0.ilike.${keyword},artist_name_1.ilike.${keyword},artist_name_2.ilike.${keyword}`)
    }
  }
  if (condition.album_name) {
    if (condition.album_name_exact_match) {
      const keyword = makeKeywordForSql(condition.album_name, false)
      query = query.or(`album_name_0.eq.${keyword},album_name_1.eq.${keyword},album_name_2.eq.${keyword}`)
    } else {
      const keyword = makeKeywordForSql(condition.album_name, true)
      query = query.or(`album_name_0.ilike.${keyword},album_name_1.ilike.${keyword},album_name_2.ilike.${keyword}`)
    }
  }
  if (condition.track_name) {
    if (condition.track_name_exact_match) {
      const keyword = makeKeywordForSql(condition.track_name, false)
      query = query.or(`track_name_0.eq.${keyword},track_name_1.eq.${keyword},track_name_2.eq.${keyword}`)
    } else {
      const keyword = makeKeywordForSql(condition.track_name, true)
      query = query.or(`track_name_0.ilike.${keyword},track_name_1.ilike.${keyword},track_name_2.ilike.${keyword}`)
    }
  }
  query = query.limit(1000)
  query = query.order('artist_name_0')
      .order('album_year')
      .order('disc_no_for_sort')
      .order('track_no')
  const { data: result, error } = await query
  if (error) {
    console.error('Error fetchTracks:', error)
    return []
  }
  return result
}

export const fetchArtistTrack = async (artistName: string, albumName: string, trackName: string): Promise<ArtistTrackKey> => {
  console.log('condition', artistName, albumName, trackName)

  let query = supabase
      .from('mv32_artist_tracks')
      .select('*')
  query = query.eq('artist_name_1', artistName)
  query = query.eq('album_name_1', albumName)
  query = query.eq('track_name_1', trackName)
  const { data: result, error } = await query
  if (error || result.length > 1) {
    console.error('Error fetchArtistTrack:', error)
    throw error
  }
  if (result.length === 1) {
    console.log('result', result[0])
    return result[0]
  }

  let query2 = supabase
      .from('mv32_artist_tracks')
      .select('artist_id, album_id')
  query2 = query2.eq('artist_name_1', artistName)
  query2 = query2.eq('album_name_1', albumName)
  const { data: result2, error: error2 } = await query2 as unknown as {
        data: ArtistTrackKey[] | null
        error: any
  }
  if (error2 || !result2) {
    console.error('Error fetchArtistTrack:', error2)
    throw error2
  }
  console.log('result', result2[0])
  return result2[0]
}

export const mergeTrack = async (newData: Track): Promise<Track> => {
  const updateData = { ...newData,
    album_id: !newData.album_id ? null : newData.album_id
  }
  console.log('updateData:', updateData)
  if (newData.track_id) {
    const result = await updateTrack(updateData)
    return fetchTrack(result.track_id)
  } else {
    const result = await insertTrack(updateData)
    return fetchTrack(result.track_id)
  }
}

export const mergeTracks = async (newData: Track[]): Promise<Number> => {
  const insertData: Track[] = []
  const updateData: Track[] = []

  newData.forEach((row) => {
    if (row.track_id)
      updateData.push(row)
    else
      insertData.push(row)
  })
  insertTracks(insertData)
  updateTracks(updateData)

  return insertData.length + updateData.length
}

const insertTrack = async (newData: Track): Promise<Track> => {
    const { track_id, artist_name_0, artist_name_1, artist_name_2, album_name_0, album_name_1, album_name_2, album_year, ...insertData } = newData
    const { data: result, error } = await supabase
        .from('mt31_tracks')
        .insert(insertData)
        .select()
        .single()
    if (error || !result) {
      console.error('Error insertTrack:', error)
      throw(error)
    }
    console.log("insertTrack Complete Result:", result)
    return result
}

const insertTracks = async (newData: Track[]) => {
    const newData2: Partial<Track>[] = []
    newData.forEach((row) => {
      const { track_id, artist_name_0, artist_name_1, artist_name_2, album_name_0, album_name_1, album_name_2, album_year, ...row2 } = row
      newData2.push(row2)
    })
    console.log("insertData:", newData2)
    const { data: result, error } = await supabase
        .from('mt31_tracks')
        .insert(newData2)
        .select()
    if (error || !result) {
      console.error('Error insertTracks:', error)
      throw(error)
    }
    console.log("insertTracks Complete Result:", result)
    return result
}

const updateTrack = async (newData: Track): Promise<Track> => {
  const { artist_name_0, artist_name_1, artist_name_2, album_name_0, album_name_1, album_name_2, album_year, disc_no_for_sort, ...newData2 } = newData
  const updateData = { ...newData2,
    updated_at: new Date(),
    updated_count: Number(newData2.updated_count ?? 0) + 1
  }
  const { data: result, error } = await supabase
      .from('mt31_tracks')
      .update(updateData)
      .eq('track_id', updateData.track_id)
      .select()
      .single()
    if (error || !result) {
    console.error('Error updateTrack:', error)
    throw(error)
  }
  console.log("updateTrack Complete Result:", result)
  return result
}

const updateTracks = async (newData: Track[]) => {
  newData.forEach((row) => {
    updateTrack(row)
  })
}

export const isTrackEdited = (original?: Track, current?: Track): boolean => {
  if (!original || !current) return true
  if (original.disc_no !== current.disc_no) return true
  if (original.track_no !== current.track_no) return true
  if (original.track_name_0 !== current.track_name_0) return true
  if (original.track_name_1 !== current.track_name_1) return true
  if (original.track_name_2 !== current.track_name_2) return true
  if (original.track_artist_name !== current.track_artist_name) return true
  if (original.is_bonus_track !== current.is_bonus_track) return true
  if (original.track_year !== current.track_year) return true
  if (original.track_length !== current.track_length) return true
  if (original.is_single !== current.is_single) return true
  if (original.single_no !== current.single_no) return true
  if (original.track_point !== current.track_point) return true
  if (original.is_point_except !== current.is_point_except) return true
  if (original.listening_count !== current.listening_count) return true
  if (!compareDate(original.last_listened_at, current.last_listened_at)) return true
  if (original.track_comment !== current.track_comment) return true
  return false
}

export const validateTrack = (track: Track): ValidationErrors => {
  const errors: ValidationErrors = {}
  if (!track.track_name_0.trim()) errors.track_name_0 = "Track Name 0 is required."
  if (!track.track_name_1.trim()) errors.track_name_1 = "Track Name 1 is required."
  return errors
}