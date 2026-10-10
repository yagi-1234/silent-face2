'use client'

import { Suspense, useEffect, useState } from 'react'
import { ArrowLeft, CircleCheck, Download, MapPin, Plus, RotateCw  } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

import { mergeTracks } from '@/actions/music/track-action'
import { Breadcrumb } from '@/components/Breadcrumb'
import ConfirmModal from '@/components/ConfirmModal'
import MessageBanner from '@/components/MessageBanner'
import { useConfirmModal } from '@/contexts/ConfirmModalContext'
import { useMessage } from '@/contexts/MessageContext'
import { useCustomBack } from '@/utils/navigationUtils'
import { MbAlbumData, TrackView, TrackSearchCondition } from '@/types/music/track-types'
import { formatDateTime } from '@/utils/dateFormat'
import { removeArticle, convertToRome, toLowerCase } from '@/utils/stringUtils'

const Page = () => {
  return (
    <Suspense fallback={<div>Loading artist list...</div>}>
      <TrackSearch />
    </Suspense>
  )
}
export default Page

const TrackSearch = () => {

  const { setIsModalOpen, setModalMessage, setConfirmHandler } = useConfirmModal()
  const { handleBack } = useCustomBack()
  const { message, setMessage, messageType, setMessageType, errors } = useMessage()
  const searchParams = useSearchParams()

  const [condition, setCondition] = useState<TrackSearchCondition>({artist_id: '', artist_name: '', album_id: '', album_name: ''})
  const [mbid, setMbid] = useState('')
  const [mbAlbumData, setMbAlbumData] = useState<MbAlbumData[]>([])
  const [tracks, setTracks] = useState<TrackView[]>([])

  const handleChangeCondition = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setCondition(prev => ({
      ...prev, [name]: value
    }))
  }

  const handleGetMbid = async () => {
    if (!condition.artist_name && !condition.album_name) return
    const response = await fetch(
      `/api/musicbrainz/album?artist=${encodeURIComponent(condition.artist_name)}&album=${encodeURIComponent(condition.album_name)}`
    )
    const data = await response.json()
    const albums: MbAlbumData[] = []
    data.forEach((album: MbAlbumData) => {
      albums.push({
        mbid: album.mbid,
        artist: album.artist,
        firstReleaseDate: album.firstReleaseDate,
        primaryType: album.primaryType,
        title: album.title,
      })
    })
    setMbAlbumData(albums)
  }

  const handleSelectAlbum = (album: MbAlbumData) => {
    setMbid(album.mbid)
  }

  const handleTrackImport = async () => {
    if (!mbid) return
    const response = await fetch(
      `/api/musicbrainz/tracks?mbid=${encodeURIComponent(mbid)}`
    )
    const data = await response.json()
    // console.log(data)
    const tracks: TrackView[] = []
    for (const row of data.tracks) {
      // console.log(`Track: ${row.title}, Recording MBID: ${row.recordingMbid}`)
      tracks.push({
        track_id: null,
        artist_id: condition.artist_id,
        album_id: condition.album_id,
        disc_no: null,
        track_no: row.trackNumber,
        track_name_0: removeArticle(toLowerCase(await convertToRome(row.title))),
        track_name_1: row.title,
        track_name_2: null,
        track_artist_name: null,
        is_bonus_track: null,
        track_year: null,
        track_length: row.length ? `${Math.floor(row.length / 60000)}:${String(Math.floor((row.length % 60000) / 1000)).padStart(2, '0')}` : '',
        is_single: null,
        single_no: null,
        track_point: null,
        is_point_except: '0',
        listening_count: null,
        last_listened_at: null,
        track_comment: null,
        created_at: null,
        updated_count: 0,
        updated_at: null,
        artist_name_0: '',
        artist_name_1: '',
        artist_name_2: '',
        album_name_0: '',
        album_name_1: '',
        album_name_2: '',
        album_no: null,
        album_year: 0,
        total_track_count: null,
        disc_no_for_sort: 0,
        track_artist_name_1: null,
        track_count: null,
        album_track_length: null,
        recording_mbid: row.recordingMbid,
        checked: '1',
      })
    }
    setTracks(tracks)

    const response2 = await fetch(
      `/api/lastfm/album?artist=${encodeURIComponent(condition.artist_name)}&album=${encodeURIComponent(condition.album_name)}`
    )
    const data2 = await response2.json()
    console.log(data2)
  }

  const getPopularTracks = async (mbid: string) => {
    const response = await fetch(
      `/api/lastfm/album?mbid=${encodeURIComponent(mbid)}`
    )
    const data = await response.json()
    console.log(data)
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>, rowIndex: number) => {
    const { name, type, checked } = event.target
    const value = type === 'checkbox' ? checked ? '1' : '0' : event.target.value
    setTracks(prev =>
      prev.map((row, index) =>
        index === rowIndex ? {
          ...row, [name]: value ? (event.target.type === 'number' ? Number(value) : value) : null
        } : row
      )
    )
  }

  const handleSave = async () => {
    setModalMessage('Do you want to continue with this registration?')
    setConfirmHandler(async () => {
      const tracks2: TrackView[] = []
      for (const track of tracks)
        if (track.checked === '1') tracks2.push(track)
      const mergeCount = await mergeTracks(tracks2)
      setMessage('Saved Successfully! ' + mergeCount + '/' + tracks.length)
      setMessageType('info')
    })
    setIsModalOpen(true)
  }

  useEffect(() => {
    setCondition({
      artist_id: searchParams.get('artist_id') ?? '',
      artist_name: searchParams.get('artist_name') ?? '',
      album_id: searchParams.get('album_id') ?? '',
      album_name: searchParams.get('album_name') ?? ''
    })
  }, [])

  return (
    <div className="root-panel">
      <MessageBanner
          message={message}
          type={messageType}
          errors={errors}
          onClose={() => setMessage('')} />
      <Breadcrumb />
      <h2 className="header-title">Track Search</h2>
      <div>
        <div className="div-input-row">
          <label htmlFor="artist_name" className="input-label">Artist Name</label>
          <div className="div-row-left">
            <input type="text"
                id="artist_name"
                name="artist_name"
                className="w-124 mr-2"
                value={condition.artist_name}
                onChange={handleChangeCondition} />
            {condition.artist_id && (
              <button className="text-bold text-green-600">
                <CircleCheck className="h-5 w-5" />
              </button>
            )}
          </div>
          <div>
            <div className="flex justify-between items-center">
              <div>
                <label htmlFor="album_name" className="input-label">Album Name</label>
                <div className="div-row-left mr-2">
                  <input type="text"
                      id="album_name"
                      name="album_name"
                      className="w-124 mr-2"
                      value={condition.album_name}
                      onChange={handleChangeCondition} />
                  {condition.album_id && (
                    <button className="text-bold text-green-600">
                      <CircleCheck className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>
              <div>
                <div className="div-row-right">
                  <button className="button-search w-10 mt-6 mr-2"
                      onClick={() => handleGetMbid()}>
                    <RotateCw size={16} />
                  </button>
                  <button className="button-search mt-6"
                      disabled={!!!mbid}
                      onClick={() => handleTrackImport()}>
                    <Download size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t divide-y">
          {mbAlbumData.map((album, index) => (
            <div key={album.mbid} className="flex items-center justify-between h-8 p-1">
              <div className="flex items-center space-x-2">
                <button
                    className={"button-page " + (mbid === album.mbid ? "text-orange-600" : "")}
                    onClick={() => handleSelectAlbum(album)}>
                  <MapPin className="h-5 w-5" />
                </button>
                <span className="w-40">{album.artist}</span>
                <span className="w-96">{album.title}</span>
                <span className="w-24">{formatDateTime(album.firstReleaseDate, "yyyy/MM/dd")}</span>
                <span className="w-16">{album.primaryType}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="div-row-flexible div-row-header">
          <span className="w-24 border">#</span>
          <span className="w-80 border">Track Name</span>
          <span className="w-24 border">Single</span>
          <span className="w-16 border">Bonus</span>
          <span className="w-20 border">Year</span>
          <span className="w-20 border">Length</span>
        </div>
        <div className="border-t divide-y">
          {tracks.map((track, index) => (
            <div key={track.recording_mbid} className="flex items-center justify-between h-8 p-1">
              <div className="flex items-center space-x-2">
                <div className="flex items-center">
                  <input type="checkbox"
                      name="checked"
                      className="w-4 h-4"
                      checked={track.checked === '1'}
                      value={track.checked ?? ""}
                      onChange={e => handleChange(e, index)} />
                </div>
                <div className="flex items-center">
                  <input type="number"
                      name="track_no"
                      className="numeric-field h-6 w-16 border-t"
                      value={track.track_no ?? ""}
                      onChange={e => handleChange(e, index)} />
                </div>
                <div className="flex items-center">
                  <input type="text"
                      name="track_name_1"
                      className="h-6 w-80"
                      value={track.track_name_1 ?? ""}
                      onChange={e => handleChange(e, index)} />
                </div>
                <div className="flex items-center justify-center">
                  <input type="checkbox"
                      id="is_single"
                      name="is_single"
                      className="appearance-none rounded-lg border border-gray-300 bg-white checked:bg-blue-400 checked:border-blue-400 cursor-pointer w-5 h-5"
                      checked={track.is_single === '1'}
                      value={track.is_single ?? ""}
                      onChange={e => handleChange(e, index)} />
                </div>
                <div className="flex items-center justify-center w-17">
                  <input type="number"
                      name="single_no"
                      className="h-6 w-full"
                      value={track.single_no ?? ""}
                      onChange={e => handleChange(e, index)} />
                </div>
                <div className="flex items-center justify-center w-16">
                  <input type="checkbox"
                      id="is_bonus_track"
                      name="is_bonus_track"
                      className="appearance-none rounded-lg border border-gray-300 bg-white checked:bg-blue-400 checked:border-blue-400 cursor-pointer w-5 h-5"
                      checked={track.is_bonus_track === '1'}
                      value={track.is_bonus_track ?? ""}
                      onChange={e => handleChange(e, index)} />
                </div>
                <div className="flex items-center justify-center w-20">
                  <input type="number"
                      name="track_year"
                      className="numeric-field h-6 w-full"
                      value={track.track_year ?? ''}
                      onChange={e => handleChange(e, index)} />
                </div>
                <div className="flex items-center justify-center w-20">
                  <input type="text"
                      name="track_length"
                      className="numeric-field h-6 w-full"
                      value={track.track_length ?? ''}
                      onChange={e => handleChange(e, index)} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="footer-area">
        <div className="footer-area-sub">
          <div className="footer-left">
            <button className="button-back"
                onClick={() => handleBack(false)}>
              <ArrowLeft size={16} />
            </button>
          </div>
          <div className="footer-right">
            <button className="button-save"
                disabled={tracks.length === 0}
                onClick={() => handleSave()}>
              <Plus size={16} />
            </button>
          </div>
        </div>
      </div>
      <ConfirmModal />
    </div>
  )
}

// Example response from the MusicBrainz API for a release group with tracks
// {
//   "artist": "Radiohead",
//   "album": "OK Computer",
//   "mbid": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
//   "listeners": "1234567",
//   "playcount": "45678901",
//   "tracks": [
//     {
//       "trackNumber": 1,
//       "title": "Airbag",
//       "duration": "280",
//       "mbid": "",
//       "url": "..."
//     },
//     {
//       "trackNumber": 2,
//       "title": "Paranoid Android",
//       "duration": "383",
//       "mbid": "",
//       "url": "..."
//     }
//   ]
// }