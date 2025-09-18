import { supabase } from '@/lib/supabase'
import type { ValidationErrors } from '@/types/common/common-types'
import type { ArtistCondition, Artist } from '@/types/music/artist-types'
import { makeKeywordForSql} from '@/utils/stringUtils'

export const fetchArtist = async (artistId: string): Promise<Artist> => {
  const { data: result, error } = await supabase
      .from('mv11_artists')
      .select('artist_id, artist_name_0, artist_name_1, artist_name_2, artist_type, origin_code, years_active, grade, artist_comment, updated_count, updated_at, origin_name, origin_country, album_count, owned_count, track_count, last_listened_at')
      .eq('artist_id', artistId)
      .single()
  if (error) {
      console.error('Error fetchArtist:', error)
      throw error
  }
  console.log('artista:', result)
  result.updated_at
  return result
}

export const fetchArtists = async (condition: ArtistCondition): Promise<Artist[]> => {
  console.log('condition:', condition)

  let query = supabase
      .from('mv11_artists')
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
  if (condition.grade_from)
      query = query.lte('grade', condition.grade_from)
  if (condition.grade_to)
      query = query.gte('grade', condition.grade_to)
  if (condition.random_count && 0 < condition.random_count) {
      query = query.limit(condition.random_count)
      query = query.order('random_no')
  } else {
    query = query.limit(50)
    query = query.order('artist_name_0')
  }
  const { data: result, error } = await query
  if (error) {
    console.error('Error fetchArtists:', error)
    return []
  }
  return result
}

export const mergeArtist = async (newData: Artist): Promise<Artist> => {
  const updateData = { ...newData,
//      last_acted_at: toZonedTime(newData.last_acted_at || '', 'Asia/Tokyo')
  }

  if (newData.artist_id) {
    return await updateArtist(updateData)
  } else {
    return await insertArtist(updateData)
  }
}

const insertArtist = async (newData: Artist): Promise<Artist> => {
    const { artist_id, album_count, owned_count, track_count, last_listened_at, origin_name, origin_country, ...insertData } = newData
    console.log("insertData:", insertData)
    const { data: result, error } = await supabase
        .from('mt11_artists')
        .insert(insertData)
        .select()
        .single()
    if (error || !result) {
      console.error('Error insertArtist:', error)
      throw(error)
    }
    console.log("insertArtist Complete Result:", result)
    return result
}

const updateArtist = async (newData: Artist): Promise<Artist> => {
  const { album_count, owned_count, track_count, last_listened_at, origin_name, origin_country, ...newData2 } = newData
  const updateData = { ...newData2,
    updated_at: new Date(),
    updated_count: Number(newData2.updated_count ?? 0) + 1
  }

  console.log("updateData:", updateData)
  const { data: result, error } = await supabase    
      .from('mt11_artists')
      .update(updateData)
      .eq('artist_id', updateData.artist_id)
      .select()
      .single()
  if (error) {
    console.error('Error updateArtist:', error)
    throw(error)
  }
  console.log("updateArtist Complete Result:", result)
  return result
}

export const isArtistEdited = (original?: Artist, current?: Artist): boolean => {
  if (!original || !current) return true
  if (original.artist_name_0 !== current.artist_name_0) return true
  if (original.artist_name_1 !== current.artist_name_1) return true
  if (original.artist_name_2 !== current.artist_name_2) return true
  if (original.artist_type !== current.artist_type) return true
  if (original.origin_code !== current.origin_code) return true
  if (original.years_active !== current.years_active) return true
  if (original.grade !== current.grade) return true
  if (original.artist_comment !== current.artist_comment) return true
  return false
}

export const validateArtist = (artist: Artist): ValidationErrors => {
  const errors: ValidationErrors = {}
  if (!artist.artist_name_0.trim()) errors.artist_name_0 = "Artist Name 0 is required."
  if (!artist.artist_name_1.trim()) errors.artist_name_1 = "Artist Name 1 is required."
  return errors
}