export type Album = {
  artist_id: string
  artist_name_0: string
  artist_name_1: string
  artist_name_2: string
  album_id: string
  album_name_0: string
  album_name_1: string
  album_name_2: string
  album_type: string
  album_no: number | null
  released: string | null
  owned_flag: string
  added_at: Date | null
  listening_count: number | null
  last_listened_at: Date | null
  album_comment: string
  updated_at: Date | null
  updated_count: number | null
  track_count: number | null
  track_length: string
  album_point: number | null
}

export const initialAlbum: Album = {
  artist_id: '',
  artist_name_0: '',
  artist_name_1: '',
  artist_name_2: '',
  album_id: '',
  album_name_0: '',
  album_name_1: '',
  album_name_2: '',
  album_type: '',
  album_no: null,
  released: null,
  owned_flag: '0',
  added_at: null,
  listening_count: null,
  last_listened_at: null,
  album_comment: '',
  updated_at: null,
  updated_count: 0,
  track_count: 0,
  track_length: '',
  album_point: null,
}

export type AlbumCondition = {
  artist_id: string | ''
  artist_name: string | ''
  artist_name_exact_match: boolean
  album_id: string | ''
  album_name: string | ''
  album_name_exact_match: boolean
  album_type: boolean
  owned_flag: boolean
  random_count: number | null
}
export const initialAlbumCondition: AlbumCondition = {
  artist_id: '',
  artist_name: '',
  artist_name_exact_match: false,
  album_id: '',
  album_name: '',
  album_name_exact_match: false,
  album_type: false,
  owned_flag: false,
  random_count: null,
}

export type ArtistAlbum = {
  album_id: string | ''
  album_name_1: string | ''
  released: string | null
} 