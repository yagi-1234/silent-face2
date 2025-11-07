export type Artist = {
  artist_id: string | null
  artist_name_0: string
  artist_name_1: string
  artist_name_2: string | null
  artist_type: string | null
  origin_code: string | null
  years_active: string | null
  grade: string | null
  artist_comment: string | null
  updated_count: number | null
  updated_at: Date | null
  country_name_1: string | null
  origin_full_name_1: string | null
  album_count: number
  owned_count: number
  track_count: number
  last_listened_at: Date | null
}

export const initialArtist: Artist = {
  artist_id: null,
  artist_name_0: '',
  artist_name_1: '',
  artist_name_2: null,
  artist_type: '',
  origin_code: null,
  years_active: '',
  grade: '',
  artist_comment: '',
  country_name_1: null,
  origin_full_name_1: '',
  album_count: 0,
  owned_count: 0,
  track_count: 0,
  updated_count: 0,
  updated_at: null,
  last_listened_at: null,
}

export type ArtistCondition = {
  artist_id: string | ''
  artist_name: string | ''
  artist_name_exact_match: boolean
  grade_from: string
  grade_to: string
  random_count: number | null
}
export const initialArtistCondition: ArtistCondition = {
  artist_id: '',
  artist_name: '',
  artist_name_exact_match: false,
  grade_from: '',
  grade_to: '',
  random_count: null,
}
