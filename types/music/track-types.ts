export type TrackRow = {
  track_id: string | null
  artist_id: string | null
  album_id: string | null
  disc_no: number | null
  track_no: number | null
  track_name_0: string
  track_name_1: string
  track_name_2: string | null
  track_artist_name: string | null
  is_bonus_track: string
  track_year: number | null
  track_length: string | null
  is_single: string
  single_no: number | null
  track_point: number | null
  is_point_except: string
  listening_count: number | null
  last_listened_at: Date | null
  track_comment: string | null
  created_at: Date | null
  updated_at: Date | null
  updated_count: number | null
}

export type TrackView = TrackRow & {
  artist_name_0: string | null
  artist_name_1: string | null
  artist_name_2: string | null
  album_name_0: string | null
  album_name_1: string | null
  album_name_2: string | null
  album_year: number | null
  disc_no_for_sort: number
  track_artist_name_1: string | null
  track_count: number | null
  album_track_length: string | null
}

export const initialTrack: TrackView = {
  artist_id: '',
  artist_name_0: '',
  artist_name_1: '',
  artist_name_2: '',
  album_id: null,
  album_name_0: null,
  album_name_1: null,
  album_name_2: null,
  album_year: null,
  disc_no: null,
  disc_no_for_sort: 0,
  track_id: '',
  track_no: null,
  track_name_0: '',
  track_name_1: '',
  track_name_2: null,
  track_artist_name: null,
  track_artist_name_1: null,
  is_bonus_track: '0',
  track_year: null,
  track_length: '',
  is_single: '0',
  single_no: null,
  track_point: null,
  is_point_except: '0',
  listening_count: null,
  last_listened_at: null,
  track_comment: '',
  created_at: null,
  updated_count: 0,
  updated_at: null,
  track_count: null,
  album_track_length: null,
}

export type TrackCondition = {
  artist_id: string | ''
  artist_name: string | ''
  artist_name_exact_match: boolean
  album_id: string | ''
  album_name: string | ''
  album_name_exact_match: boolean
  track_id: string | ''
  track_name: string | ''
  track_name_exact_match: boolean
}
export const initialTrackCondition: TrackCondition = {
  artist_id: '',
  artist_name: '',
  artist_name_exact_match: false,
  album_id: '',
  album_name: '',
  album_name_exact_match: false,
  track_id: '',
  track_name: '',
  track_name_exact_match: false,
}

export type ArtistTrackKey = {
  artist_id: string,
  album_id: string | null,
  track_id: string | null,
  track_point: number | null,
}