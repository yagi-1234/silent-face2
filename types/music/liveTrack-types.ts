export type LiveTrackRow = {
  live_track_id: string | null
  user_id: string | null
  event_id: string | null
  play_order: number | null
  part_name: string | null
  track_id: string | null
  track_name: string | null
  artist_name: string | null
  guest_artist_name: string | null
  album_id: string | null
  album_name: string | null
  live_track_comment: string | null
  created_at: Date | null
  updated_at: Date | null
  updated_count: number | null
}

export type LiveTrackView = LiveTrackRow & {
}

export const initialLiveTrack: LiveTrackView = {
  live_track_id: null,
  user_id: null,
  event_id: null,
  play_order: null,
  part_name: null,
  track_id: null,
  track_name: null,
  artist_name: null,
  guest_artist_name: null,
  album_id: null,
  album_name: null,
  live_track_comment: null,
  created_at: null,
  updated_at: null,
  updated_count: 0,
}
