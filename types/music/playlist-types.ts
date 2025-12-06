export type PlaylistRow = {
  playlist_id: string | null,
  playlist_name: string | null,
  parent_playlist_id: string | null,
  disp_order: number | null,
  created_at: Date | null
  updated_at: Date | null
  updated_count: number | null
}

export type PlaylistView = PlaylistRow & {
  max_disp_order: number | null,
}

export const initialPlaylist: PlaylistView = {
  playlist_id: null,
  playlist_name: null,
  parent_playlist_id: null,
  disp_order: null,
  created_at: null,
  updated_at: null,
  updated_count: null,
  max_disp_order: 0,
}

export type PlaylistTrackRow = {
  playlist_track_id: string | null,
  playlist_id: string | null,
  aritst_id: string | null,
  artist_name_1: string | null,
  album_id: string | null,
  album_name_1: string | null,
  track_id: string | null,
  track_name_1: string | null,
  play_order: number | null,
  rank_no: number | null,
  created_at: Date | null
  updated_at: Date | null
  updated_count: number | null,
}

export type PlaylistTrackView = PlaylistTrackRow & {
  entry_count: number | null
  max_rank_no: number | null
  max_rank_count: number | null
  prev_rank_no: number | null
  edit_mode: string | null
}

export const initialPlaylistTrack: PlaylistTrackView = {
  playlist_track_id: null,
  playlist_id: null,
  aritst_id: null,
  artist_name_1: null,
  album_id: null,
  album_name_1: null,
  track_id: null,
  track_name_1: null,
  play_order: null,
  rank_no: null,
  created_at: null,
  updated_at: null,
  updated_count: null,
  entry_count: null,
  max_rank_no: null,
  max_rank_count: null,
  prev_rank_no: null,
  edit_mode: null,
}
