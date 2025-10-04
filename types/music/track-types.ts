export type Track = {
  artist_id: string
  artist_name_0: string
  artist_name_1: string
  artist_name_2: string
  album_id: string | null
  album_name_0: string
  album_name_1: string
  album_name_2: string
  album_year: number | null
  disc_no: number | null
  disc_no_for_sort: number
  track_id: string
  track_no: number | null
  track_name_0: string
  track_name_1: string
  track_name_2: string
  track_artist_name: string
  is_bonus_track: string
  track_year: number | null
  track_length: string
  is_single: string
  single_no: number | null
  track_point: number | null
  is_point_except: string
  listening_count: number | null
  last_listened_at: Date | null
  track_comment: string
  updated_count: number | null
  updated_at: Date | null
}

export const initialTrack: Track = {
  artist_id: '',
  artist_name_0: '',
  artist_name_1: '',
  artist_name_2: '',
  album_id: '',
  album_name_0: '',
  album_name_1: '',
  album_name_2: '',
  album_year: null,
  disc_no: null,
  disc_no_for_sort: 0,
  track_id: '',
  track_no: null,
  track_name_0: '',
  track_name_1: '',
  track_name_2: '',
  track_artist_name: '',
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
  updated_count: 0,
  updated_at: null,
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
}