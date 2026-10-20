import { supabase } from '@/lib/supabase'

import { PlaylistRow, PlaylistView, PlaylistFunc, PlaylistTrackRow, PlaylistTrackView, PlaylistCondition, PlaylistTrackDetailRow } from '@/types/music/playlist-types'
import { makeKeywordForSql } from '@/utils/stringUtils'

export const fetchPlaylist = async (playlistId: string): Promise<PlaylistView> => {
  console.log(playlistId)
  let query = supabase
      .from('mv41_playlists')
      .select('*')
      .eq('playlist_id', playlistId)
      .single()
  const { data: result, error } = await query
  if (error) {
    console.error('Error fetchPlaylist:', error)
    throw error
  }
  return result
}

export const fetchPlaylistsCount = async (): Promise<number> => {
  let query = supabase
      .from('mv41_playlists')
      .select('*', { count: 'exact', head: true })
  const { count, error } = await query
  if (error) {
    console.error('Error fetchPlaylistsCount:', error)
    return 0
  }
  return count ?? 0
}

export const fetchPlaylists = async (pageNo: number): Promise<PlaylistView[]> => {
  const fetchCount = 20
  let query = supabase
      .from('mv41_playlists')
      .select('*')
      .order('disp_order')
      .range(fetchCount * (pageNo - 1), fetchCount * pageNo - 1)
  const { data: result, error } = await query
  if (error) {
    console.error('Error fetchPlaylists:', error)
    return []
  }
  return result
}

export const mergePlaylist = async (newData: PlaylistView) => {
  if (newData.playlist_id) {
    const result = await updatePlaylist(newData)
  } else {
    const result = await insertPlaylist(newData)
  }
}

export const copyPlaylist = async (newData: PlaylistView, newPlaylistTracks: PlaylistTrackView[]): Promise<string> => {
  const result = await insertPlaylist(newData)
  const newPlaylistTracks2 = newPlaylistTracks.map(t => ({
    ...t,
    playlist_id: result.playlist_id,
    edit_mode: 'c'
  }))
  for (const row of newPlaylistTracks2)
    await insertPlaylistTrack(row)
  return result.playlist_id
}

const insertPlaylist = async (newData: PlaylistView) => {
  const insertData = await copyToPlaylistRecord(newData, 'i')
  console.log('insertData:', insertData)
  const { data: result, error } = await supabase
      .from('mt41_playlists')
      .insert(insertData)
      .select()
      .single()
  if (error || !result) {
    console.error('Error insertPlaylist:', error)
    throw(error)
  }
  console.log('insertPlaylist Complete Result:', result)
  return result
}

export const updatePlaylist = async (newData: PlaylistView): Promise<PlaylistRow> => {
  const updateData = await copyToPlaylistRecord(newData, 'u')
  console.log('updateData:', updateData)
  const { data: result, error } = await supabase
      .from('mt41_playlists')
      .update(updateData)
      .eq('playlist_id', newData.playlist_id)
      .select()
      .single()
  if (error || !result) {
    console.error('Error updatePlaylist:', error)
    throw(error)
  }
  console.log("updatePlaylist Complete Result:", result)
  return result
}

const copyToPlaylistRecord = async (playlistView: PlaylistView, processType: string) => {
  const {
    max_disp_order,
    ...playlistRow
  } = playlistView
  if (processType === 'i') {
    let dispOrder = null
    if (playlistView.parent_playlist_id) {
      const playlistFunc = await fetchPlaylistFunc(playlistView.parent_playlist_id)
      dispOrder = playlistFunc.next_disp_order
    }
    const { playlist_id, ...playlistRow2 } = playlistRow
    const playlistRow3 = {
      ...playlistRow2,
      disp_order: dispOrder,
      created_at: new Date(),
      updated_at: new Date(),
      updated_count: 0
    }
    return playlistRow3
  } else if (processType === 'u') {
    const playlistRow2: PlaylistRow = {
      ...playlistRow,
      updated_at: new Date(),
      updated_count: Number(playlistRow.updated_count ?? 0) + 1
    }
    return playlistRow2
  } else {
    return playlistRow
  }
}

export const fetchPlaylistTracks = async (playlistId: string): Promise<PlaylistTrackView[]> => {
  console.log('playlistId:', playlistId)
  let query = supabase
      .from('mv42_playlist_tracks')
      .select('*')
      .eq('playlist_id', playlistId)
      .order('play_order')
  const { data: result, error } = await query
  if (error) {
    console.error('Error fetchPlaylists:', error)
    return []
  }
  return result
}

export const mergePlaylistTracks = async (newData: PlaylistTrackView[], deleteData: PlaylistTrackView[]) => {
  console.log(newData)
  for (const row of newData) {
    if (row.edit_mode === 'i') {
      const result = await insertPlaylistTrack(row)
      await insertPlaylistTrackDetail(result.playlist_track_id ?? '', row)
    }
    if (row.edit_mode === 'u') {
      await updatePlaylistTrack(row)
      await updatePlaylistTrackDetail(row)
    }
  }
  for (const row of deleteData) {
    await deletePlaylistTrack(row)
  }
}

const insertPlaylistTrack = async (newData: PlaylistTrackView): Promise<PlaylistTrackView> => {
  const insertData = copyToPlaylistTrackRecord(newData, newData.edit_mode ?? '')
  console.log('insertData:', insertData)
  const { data: result, error } = await supabase
      .from('mt42_playlist_tracks')
      .insert(insertData)
      .select()
      .single()
  if (error) {
    console.error('Error insertPlaylistTrack:', error)
    throw(error)
  }
  return result
}

const updatePlaylistTrack = async (newData: PlaylistTrackView) => {
  const updateData = copyToPlaylistTrackRecord(newData, 'u')
  console.log('updateData:', updateData)
  const { data: result, error } = await supabase
      .from('mt42_playlist_tracks')
      .update(updateData)
      .eq('playlist_id', newData.playlist_id)
      .eq('playlist_track_id', newData.playlist_track_id)
  if (error) {
    console.error('Error updatePlaylistTrack:', error)
    throw(error)
  }
  console.log('updatePlaylistTrack Complete Result:')
}

const deletePlaylistTrack = async (deleteData: PlaylistTrackView) => {
  console.log('deleteData:', deleteData)
  const { data: result, error } = await supabase
      .from('mt42_playlist_tracks')
      .delete()
      .eq('playlist_id', deleteData.playlist_id)
      .eq('playlist_track_id', deleteData.playlist_track_id)
  if (error) {
    console.error('Error deletePlaylistTrack:', error)
    throw(error)
  }
  console.log('deletePlaylistTrack Complete Result:')
}

const insertPlaylistTrackDetail = async (playlistTrackId: string, newData: PlaylistTrackView) => {
  const insertData = copyToPlaylistTrackDetailRecord(playlistTrackId, newData)
  console.log('insertData:', insertData)
  const { data: result, error } = await supabase
      .from('mt43_playlist_tracks_detail')
      .insert(insertData)
  if (error) {
    console.error('Error insertPlaylistTrackDetail:', error)
    throw(error)
  }
}

const updatePlaylistTrackDetail = async (newData: PlaylistTrackView) => {
  const updateData = copyToPlaylistTrackDetailRecord(newData.playlist_track_id ?? '', newData)
  console.log('updateData:', updateData)
  const { data: result, error } = await supabase
      .from('mt43_playlist_tracks_detail')
      .update(updateData)
      .eq('playlist_track_id', newData.playlist_track_id)
  if (error) {
    console.error('Error updatePlaylistTrackDetail:', error)
    throw(error)
  }
  console.log('updatePlaylistTrackDetail Complete Result:')
}

const fetchPlaylistFunc = async (parentPlaylistId: string): Promise<PlaylistFunc> => {
  console.log(parentPlaylistId)
  let query = supabase
      .from('mv41_playlist_func')
      .select('parent_playlist_id, max_disp_order, next_disp_order')
      .eq('parent_playlist_id', parentPlaylistId)
      .single()
  const { data: result, error } = await query
  if (error) {
    console.error('Error fetchPlaylistFunc:', error)
    throw error
  }
  return result
}

const copyToPlaylistTrackRecord = (PlaylistTrackView: PlaylistTrackView, processType: string) => {
  const {
    disp_order,
    entry_count,
    max_rank_no,
    max_rank_count,
    prev_rank_no,
    edit_mode,
    ...playlistTrackRow
  } = PlaylistTrackView
  if (processType === 'i') {
    const { playlist_track_id, ...playlistTrackRow2 } = playlistTrackRow
    const playlistTrackRow3 = {
      ...playlistTrackRow2,
      created_at: new Date(),
      updated_at: new Date(),
      updated_count: 0
    }
    return playlistTrackRow3
  } else if (processType === 'c') {
    const playlistTrackRow2 = {
      ...playlistTrackRow,
      created_at: new Date(),
      updated_at: new Date(),
      updated_count: 0
    }
    return playlistTrackRow2
  } else if (processType === 'u') {
    const playlistTrackRow2: PlaylistTrackRow = {
      ...playlistTrackRow,
      updated_at: new Date(),
      updated_count: Number(playlistTrackRow.updated_count ?? 0) + 1
    }
    return playlistTrackRow2
  } else {
    return playlistTrackRow
  }
}

const copyToPlaylistTrackDetailRecord = (playlistTrackId: string, playlistTrackView: PlaylistTrackView): PlaylistTrackDetailRow => {
  const row: PlaylistTrackDetailRow = {
    playlist_track_id: playlistTrackId,
    artist_id: playlistTrackView.artist_id,
    artist_name_1: playlistTrackView.artist_name_1,
    album_id: playlistTrackView.album_id,
    album_name_1: playlistTrackView.album_name_1,
    track_id: playlistTrackView.track_id,
    track_name_1: playlistTrackView.track_name_1,
    created_at: playlistTrackView.edit_mode === 'i' ? new Date() : playlistTrackView.created_at,
    updated_at: new Date(),
    updated_count: playlistTrackView.edit_mode === 'i' ? 0 : Number(playlistTrackView.updated_count ?? 0) + 1
  }
  return row
}

export const isPlaylistTrackEdited = (original?: PlaylistTrackView, current?: PlaylistTrackView): boolean => {
  if (!original || !current) return true
  if (original.artist_id !== current.artist_id) return true
  if (original.artist_name_1 !== current.artist_name_1) return true
  if (original.album_id !== current.album_id) return true
  if (original.album_name_1 !== current.album_name_1) return true
  if (original.track_id !== current.track_id) return true
  if (original.play_order !== current.play_order) return true
  if (original.album_name_1 !== current.album_name_1) return true
  if (original.rank_no !== current.rank_no) return true
  return false
}

export const fetchPlaylistsByTrack = async (condition: PlaylistCondition, pageNo: number): Promise<PlaylistView[]> => {
  console.log('fetchPlaylistsByTrack condition:', condition, 'pageNo:', pageNo)
  if (!condition.artist_name || !condition.track_name) return []
  const fetchCount = 20
  
  let query = supabase
      .from('mv43_playlists_with_tracks')
      .select('*')
  if (condition.artist_name) {
    query = query.eq('artist_name_1', condition.artist_name)
  }
  if (condition.track_name) {
    query = query.eq('track_name_1', condition.track_name)
  }
  query = query.order('disp_order')
  query = query.range(fetchCount * (pageNo - 1), fetchCount * pageNo - 1)
  const { data: result, error } = await query
  if (error) {
    console.error('Error fetchPlaylistsByTrack:', error)
    return []
  }
  console.log('fetchPlaylistsByTrack result:', result)
  return result
}
