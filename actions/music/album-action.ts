import { supabase } from '@/lib/supabase'
import type { ValidationErrors } from '@/types/common/common-types'
import type { AlbumCondition, Album, ArtistAlbum } from '@/types/music/album-types'
import { CodeAlbumType } from "@/utils/codeUtils"
import { compareDate } from '@/utils/dateFormat'
import { makeKeywordForSql} from '@/utils/stringUtils'

export const fetchAlbum = async (albumId: string): Promise<Album> => {
  const { data: result, error } = await supabase
      .from('mv21_albums')
      .select('artist_id,artist_name_0,artist_name_1,artist_name_2,album_id,artist_id,album_name_0,album_name_1,album_name_2,album_type,album_no,released,owned_flag,added_at,listening_count,last_listened_at,album_comment,updated_at,updated_count,track_count,track_length,album_point')
      .eq('album_id', albumId)
      .single()
  if (error) {
      console.error('Error fetchAlbum:', error)
      throw error
  }
  console.log('album:', result)
  return result
}

export const fetchAlbums = async (condition: AlbumCondition): Promise<Album[]> => {
  console.log('condition:', condition)
  let query = supabase
      .from('mv21_albums')
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
  if (condition.album_type) {
    query = query.eq('album_type', '01')
  }
  if (condition.owned_flag) {
    query = query.eq('owned_flag', '1')
  }

  if (condition.random_count && 0 < condition.random_count) {
      query = query.limit(condition.random_count)
      query = query.order('random_no')
  } else {
    query.limit(100)
    query = query.order('artist_name_0', { ascending: true })
        .order('released', { ascending: true })
  }
  const { data: result, error } = await query
  if (error) {
    console.error('Error fetchAlbums:', error)
    return []
  }
  return result
}

export const fetchArtistAlbums = async (artistId: string): Promise<ArtistAlbum[]> => {
  console.log('artist_id:', artistId)
  const { data: result, error } = await supabase
      .from('mv21_albums')
      .select('album_id, album_name_1, released')
      .eq('artist_id', artistId)
      .order('released', { ascending: true })
  if (error) {
    console.error('Error fetchArtistAlbums:', error)
    throw error
  }
  return result
}

export const mergeAlbum = async (newData: Album): Promise<Album> => {
  const updateData = { ...newData,
//      last_acted_at: toZonedTime(newData.last_acted_at || '', 'Asia/Tokyo')
  }

  if (newData.album_id) {
    const result = await updateAlbum(updateData)
    return await fetchAlbum(result.album_id)
  } else {
    const result = await insertAlbum(updateData)
    return await fetchAlbum(result.album_id)
  }
}
const insertAlbum = async (newData: Album): Promise<Album> => {
  const { album_id, artist_name_0, artist_name_1, artist_name_2, album_point, track_count, track_length, ...insertData } = newData
  console.log("insertData:", insertData)
  const { data: result, error } = await supabase
      .from('mt21_albums')
      .insert(insertData)
      .select()
      .single()
  if (error || !result) {
    console.error('Error insertAlbum:', error)
    throw(error)
  }
  console.log("insertAlbum Complete Result:", result)
  return result
}

const updateAlbum = async (newData: Album): Promise<Album> => {
  const { artist_name_0, artist_name_1, artist_name_2, album_point, track_count, track_length, ...newData2 } = newData
  const updateData = { ...newData2,
    updated_at: new Date(),
    updated_count: Number(newData2.updated_count ?? 0) + 1,
  }
  console.log('updateData:', updateData)
  const { data: result, error } = await supabase    
      .from('mt21_albums')
      .update(updateData)
      .eq('album_id', updateData.album_id)
      .select()
      .single()
  if (error) {
    console.error('Error updateAlbum:', error)
    throw(error)
  }
  console.log('updateAlbum Complete Result:', result)
  return result
}

export const isAlbumEdited = (original?: Album, current?: Album): boolean => {
  if (!original || !current) return true
  if (original.album_name_0 !== current.album_name_0) return true
  if (original.album_name_1 !== current.album_name_1) return true
  if (original.album_name_2 !== current.album_name_2) return true
  if (original.album_type !== current.album_type) return true
  if (original.album_no !== current.album_no) return true
  if (original.released !== current.released) return true
  if (original.owned_flag !== current.owned_flag) return true
  if (!compareDate(original.added_at, current.added_at)) return true
  if (!compareDate(original.last_listened_at, current.last_listened_at)) return true
  if (original.album_comment !== current.album_comment) return true
  return false
}

export const validateAlbum = (album: Album): ValidationErrors => {
  const errors: ValidationErrors = {}
  if (!album.album_name_0.trim()) errors.album_name_0 = "Album Name 0 is required."
  if (!album.album_name_1.trim()) errors.album_name_1 = "Album Name 1 is required."
  return errors
}

export const formatAlbumTypeOrNo = (albumType: string, albumNo: number | null) => {
  if (albumType !== '01' || !albumNo)
    return CodeAlbumType[albumType]
  if (albumNo % 10 === 1 && albumNo !== 11)
    return albumNo + 'st'
  if (albumNo % 10 === 2 && albumNo !== 12)
    return albumNo + 'nd'
  if (albumNo % 10 === 3 && albumNo !== 13)
    return albumNo + 'rd'
  return albumNo + 'th'
}