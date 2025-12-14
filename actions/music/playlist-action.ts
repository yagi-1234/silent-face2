import { supabase } from '@/lib/supabase'
import { PlaylistRow, PlaylistView, PlaylistTrackRow, PlaylistTrackView } from '@/types/music/playlist-types'

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

export const fetchPlaylists = async (): Promise<PlaylistView[]> => {
  let query = supabase
      .from('mv41_playlists')
      .select('*')
      .order('disp_order')
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
  const insertData = copyToPlaylistRecord(newData, 'i')
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

const updatePlaylist = async (newData: PlaylistView): Promise<PlaylistRow> => {
  const updateData = copyToPlaylistRecord(newData, 'u')
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

const copyToPlaylistRecord = (playlistView: PlaylistView, processType: string) => {
  const {
    max_disp_order,
    ...playlistRow
  } = playlistView
  if (processType === 'i') {
    const { playlist_id, ...playlistRow2 } = playlistRow
    const playlistRow3 = {
      ...playlistRow2,
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
    if (row.edit_mode === 'i') await insertPlaylistTrack(row)
    if (row.edit_mode === 'u') await updatePlaylistTrack(row)
  }
  for (const row of deleteData) {
    await deletePlaylistTrack(row)
  }
}

const insertPlaylistTrack = async (newData: PlaylistTrackView) => {
  const insertData = copyToPlaylistTrackRecord(newData, newData.edit_mode ?? '')
  console.log('insertData:', insertData)
  const { data: result, error } = await supabase
      .from('mt42_playlist_tracks')
      .insert(insertData)
  if (error) {
    console.error('Error insertPlaylistTrack:', error)
    throw(error)
  }
  console.log('insertPlaylistTrack Complete Result:')
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

export const isPlaylistTrackEdited = (original?: PlaylistTrackView, current?: PlaylistTrackView): boolean => {
  if (!original || !current) return true
  if (original.aritst_id !== current.aritst_id) return true
  if (original.artist_name_1 !== current.artist_name_1) return true
  if (original.album_id !== current.album_id) return true
  if (original.album_name_1 !== current.album_name_1) return true
  if (original.track_id !== current.track_id) return true
  if (original.play_order !== current.play_order) return true
  if (original.album_name_1 !== current.album_name_1) return true
  if (original.rank_no !== current.rank_no) return true
  return false
}
