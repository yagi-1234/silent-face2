'use client'

import { Suspense, useEffect, useState } from 'react'
import { Check, ChevronsLeft, ChevronsRight, ArrowLeft, Plus } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

import { fetchArtist } from '@/actions/music/artist-action'
import { fetchAlbum, fetchArtistAlbums } from '@/actions/music/album-action'
import { fetchTrack, fetchTrackByTrackNo, mergeTrack, isTrackEdited, validateTrack } from '@/actions/music/track-action'
import { Breadcrumb } from '@/components/Breadcrumb'
import ConfirmModal from '@/components/ConfirmModal'
import { removeErrorKey } from '@/components/form-error'
import HiddenPanel from '@/components/HiddenPanel'
import MessageBanner from '@/components/MessageBanner'
import PartialDateInput from '@/components/PartialDateInput'
import { useConfirmModal } from '@/contexts/ConfirmModalContext'
import { useMessage } from '@/contexts/MessageContext'
import { checkUser } from '@/contexts/RooterContext'
import { ArtistAlbum } from '@/types/music/album-types'
import { Track, initialTrack } from '@/types/music/track-types'
import { formatDateTime } from '@/utils/dateFormat'
import { useCustomBack } from '@/utils/navigationUtils'
import { removeArticle, convertToRome } from '@/utils/stringUtils'

const Page = () => {
  return (
    <Suspense fallback={<div>Loading track from...</div>}>
      <TrackForm />
    </Suspense>
  )
}
export default Page

const TrackForm = () => {

  const searchParams = useSearchParams()
  const inArtistId = searchParams.get('artist_id') ?? ''
  const inAlbumId = searchParams.get('album_id') ?? ''
  const inTrackId = searchParams.get('track_id') ?? ''

  const { setIsModalOpen, setModalMessage, setConfirmHandler } = useConfirmModal()
  const { message, setMessage, messageType, setMessageType, errors, setErrors } = useMessage()
  const [hiddenPanelOpen, setHiddenPanelOpen] = useState(false)
  const { handleBack } = useCustomBack()

  const [track, setTrack] = useState<Track>(initialTrack)
  const [originalTrack, setOriginalTrack] = useState<Track>(initialTrack)
  const [artistAlbums, setArtistAlbums] = useState<ArtistAlbum[]>([])

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, type, value } = event.target
    let newValue = value
    if (name === 'album_id' && value) {
      // setTrack(prev => ({
      //   ...prev,
      //   album_year: artistAlbums[]
      // }))
    }
    if (name === 'track_year') {
      if (value && Number(track.album_year) === Number(value))
        newValue = ''
    }
    setErrors(removeErrorKey(errors, name))
    setTrack(prev => {
      let updatedValue: unknown;
      if (type === 'checkbox') updatedValue = (event.target as HTMLInputElement).checked ? '1' : '0'
      else if (type === 'number') updatedValue = value === '' ? null : value
      else updatedValue = value
      return {
        ...prev, [name]: updatedValue
      }
    })
  }
  const handleNameOneToZero = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target
    const trackName0 = removeArticle(await convertToRome(value))
    setErrors(removeErrorKey(errors, 'track_name_0'))
    setTrack(prev => ({
      ...prev,
      track_name_0: trackName0
    }))
  }
  const handleChangeDate = (value: string) => {
    const newLastListenedAt = value + " " + formatDateTime(track.last_listened_at, 'HH:mm:ss')
    setTrack(prev => ({
      ...prev, last_listened_at: isNaN(new Date(newLastListenedAt).getTime()) ? prev.last_listened_at : new Date(newLastListenedAt)
    }))
  }

  const handlePlus = () => {
    setTrack(prev => ({
      ...prev,
      listening_count: prev.listening_count == null ? 1 : prev.listening_count  + 1,
      last_listened_at: new Date(),
    }))
  }

  const handleMoveTrack = async (event: React.MouseEvent<HTMLButtonElement>) => {
    if (isTrackEdited(originalTrack, track)) {
      setModalMessage('You have unsaved changes. Are you sure you want to leave this page?')
      const eventName = event.currentTarget.name
      setConfirmHandler(() => {
        moveTrack(eventName)
      })
      setIsModalOpen(true)
    } else moveTrack(event.currentTarget.name)
  }
  const moveTrack = async (eventName: string) => {
    if (!track.album_id || !track.track_no) return
    let newTrackNo = track.track_no
    if (eventName === 'prev_button') newTrackNo = newTrackNo - 1
    if (eventName === 'next_button') newTrackNo = newTrackNo + 1
    const fetchData = await fetchTrackByTrackNo(track.album_id, track.disc_no_for_sort, newTrackNo)
    if (fetchData) {
      setTrack(fetchData)
      setOriginalTrack(fetchData)
    } else {
      setTrack(prev => setInitialTrack(prev, newTrackNo))
      setOriginalTrack(prev => setInitialTrack(prev, newTrackNo))
    }
    setIsModalOpen(false)
    setMessage('')
  }
  const setInitialTrack = (prev: Track, newTrackNo: number): Track => ({
    ...initialTrack,
    artist_id: prev.artist_id,
    artist_name_0: prev.artist_name_0,
    artist_name_1: prev.artist_name_1,
    artist_name_2: prev.artist_name_2,
    album_id: prev.album_id,
    album_name_0: prev.album_name_0,
    album_name_1: prev.album_name_1,
    album_name_2: prev.album_name_2,
    disc_no: prev.disc_no,
    track_no: newTrackNo,
    album_year: prev.album_year,
  })

  const handleSave = () => {
    setModalMessage('Do you want to continue with this registration?')
    setConfirmHandler(async () => {
      const validationErrors = validateTrack(track)
      if (0 < Object.keys(validationErrors).length) {
        setMessage('Validation Error!')
        setMessageType('error')
        setErrors(validationErrors)
        return
      }
      const result = await mergeTrack(track)
      setTrack(result)
      setOriginalTrack(result)
      setMessage('Saved Successfully!')
      setMessageType('info')
    })
    setIsModalOpen(true)
  }

  const checkLogin = async () => {
    await checkUser()
  }

  useEffect(() => {
    checkLogin()
    const loadTrack = async () => {
      let aritstId = ''
      if (inArtistId) {
        const fetchData = await fetchArtist(inArtistId)
        const fetchData2 = {
          ...track,
          artist_id: fetchData.artist_id,
          artist_name_0: fetchData.artist_name_0,
          artist_name_1: fetchData.artist_name_1,
          artist_name_2: fetchData.artist_name_2,
        }
        aritstId = fetchData.artist_id
        setTrack(fetchData2)
        setOriginalTrack(fetchData2)
      } else if (inAlbumId) {
        const fetchData = await fetchAlbum(inAlbumId)
        const fetchData2 = {
          ...track,
          artist_id: fetchData.artist_id,
          artist_name_0: fetchData.artist_name_0,
          artist_name_1: fetchData.artist_name_1,
          artist_name_2: fetchData.artist_name_2,
          album_id: fetchData.album_id,
          album_name_0: fetchData.album_name_0,
          album_name_1: fetchData.album_name_1,
          album_name_2: fetchData.album_name_2,
          album_year: Number(fetchData.released?.substring(0, 4)),
        }
        aritstId = fetchData2.artist_id
        setTrack(fetchData2)
        setOriginalTrack(fetchData2)
      } else if (inTrackId) {
        const fetchData = await fetchTrack(inTrackId)
        aritstId = fetchData.artist_id
        setTrack(fetchData)
        setOriginalTrack(fetchData)
      } else return

      const artistAlbums = await fetchArtistAlbums(aritstId)
      setArtistAlbums(artistAlbums)
    }
    loadTrack()

    const handler = (e: WindowEventMap["keydown"]) => {
      if (e.ctrlKey && e.altKey && e.key === 'd')
        setHiddenPanelOpen(prev => !prev)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <div className="root-panel">
      <MessageBanner
          message={message}
          type={messageType}
          errors={errors}
          onClose={() => setMessage('')} />
      <Breadcrumb />
      <h2 className="header-title">Track Form</h2>
      <p className="timestamp">{track.track_id ? "last updated at: " + formatDateTime(track.updated_at, 'yyyy/MM/dd HH:mm') + " (" + track.updated_count + ")" : '(Not registered)'}</p>
      <div>
        <div className="input-form mb-2">
          <label htmlFor="artist_name_1"
              className="label-fixed">
            Artist Name
          </label>
          <input type="text"
              id="artist_name_1"
              name="artist_name_1"
              className="input-fixed"
              value={track.artist_name_1}
              onChange={handleChange} />
        </div>
        <div className="input-form">
          <label htmlFor="track_artist_name">　Track Artist</label>
          <input type="text"
              id="track_artist_name"
              name="track_artist_name"
              value={track.track_artist_name}
              onChange={handleChange} />
        </div>
        <div className="input-form">
          <label htmlFor="album_name_1"
              className={track.album_id ? "label-fixed" : ""}>
            Album Name
          </label>
          <select
              id="album_id"
              name="album_id"
              className="w-80"
              value={track.album_id ?? ""}
              onChange={handleChange}>
            <option key="" value=""></option>
            {artistAlbums.map(artistAlbum => (
              <option key={artistAlbum.album_id} value={artistAlbum.album_id}>
                {artistAlbum.album_name_1 + ' (' + artistAlbum.released?.substring(0,4) + ')'}
              </option>
            ))}
          </select>
        </div>
        <div className="input-form">
          <label htmlFor="track_no">Track No</label>
          <input type="number"
              id="track_no"
              name="track_no"
              className={errors.track_no ? "numeric-field text-sm isError" : "numeric-field text-sm"}
              value={track.track_no ?? ''}
              onChange={handleChange} />
          <span>　/　</span>
          <input type="number"
              id="disc_no"
              name="disc_no"
              placeholder='Disc No'
              className={errors.disc_no ? "numeric-field text-sm isError" : "numeric-field text-sm"}
              value={track.disc_no ?? ''}
              onChange={handleChange} />
        </div>
        <div className="input-form mb-2">
          <label htmlFor="track_name_0">Track Name</label>
          <input type="text"
              id="track_name_0"
              name="track_name_0"
              className={errors.track_name_0 ? "isError" : ""}
              value={track.track_name_0}
              onChange={handleChange} />
        </div>
        <div className="input-form mb-2">
          <label htmlFor="track_name_1"></label>
          <input type="text"
              id="track_name_1"
              name="track_name_1"
              className={errors.track_name_1 ? "isError" : ""}
              value={track.track_name_1}
              onChange={handleChange}
              onBlur={handleNameOneToZero} />
        </div>
        <div className="input-form">
          <label htmlFor="track_name_2"></label>
          <input type="text"
              id="track_name_2"
              name="track_name_2"
              className={errors.track_name_2 ? "isError" : ""}
              value={track.track_name_2 ?? ""}
              onChange={handleChange} />
        </div>
        <div className="input-form">
          <label htmlFor="track_length">Length</label>
          <input type="text"
              id="track_length"
              name="track_length"
              className="w-30"
              value={track.track_length}
              onChange={handleChange} />
          <label htmlFor="track_year"
              className={!track.track_year && !!track.album_year ? "label-fixed w-10 ml-6" : "w-10 ml-6"}>
            Year
          </label>
          <input type="number"
              id="track_year"
              name="track_year"
              className={!track.track_year && !!track.album_year ? "w-30 bg-blue-100" : "w-30 "}
              value={!!track.track_year ? track.track_year : track.album_year ? track.album_year : ""}
              onChange={handleChange} />
        </div>
        <div className="input-form">
          <label htmlFor="is_single">Single</label>
          <input type="checkbox"
              id="is_single"
              name="is_single"
              className="w-5"
              checked={track.is_single === '1'}
              value={track.is_single}
              onChange={handleChange} />
          <input type="number"
              id="single_no"
              name="single_no"
              className="numeric-field text-sm"
              value={track.single_no ?? ''}
              onChange={handleChange} />
          <label className="w-24 ml-6" htmlFor="is_single">Bonus Track</label>
          <label className="input-check-label">
            <input type="checkbox"
                id="is_bonus_track"
                name="is_bonus_track"
                checked={track.is_bonus_track === '1'}
                value={track.is_bonus_track}
                onChange={handleChange} />
          </label>
        </div>
        <div className="input-form">
          <label htmlFor="track_point">Point</label>
          <input type="checkbox"
              id="is_point_except"
              name="is_point_except"
              className="w-5"
              checked={track.is_point_except === '1'}
              value={track.is_point_except}
              onChange={handleChange} />
          <input type="number"
              id="track_point"
              name="track_point"
              className="numeric-field w-24"
              value={track.track_point ?? ''}
              onChange={handleChange} />
        </div>
        <div className="input-form">
          <label htmlFor="listening_count">Listened</label>
          <button
              className="button-plus"
              onClick={handlePlus} >
            <Plus />
          </button>
          <input type="number"
              id="listening_count"
              name="listening_count"
              className="numeric-field text-sm"
              value={track.listening_count ?? ''}
              onChange={handleChange} />
          <PartialDateInput
              name="last_listened_at"
              value={formatDateTime(track.last_listened_at, "yyyy/MM/dd")}
              onChange={handleChangeDate}
              mode="flexible" />
          <span>{formatDateTime(track.last_listened_at, "HH:mm")}</span>
        </div>
        <div className="input-form-full">
          <label htmlFor="track_comment">Comment</label>
          <textarea id="track_comment"
              name="track_comment"
              rows={3}
              value={track.track_comment ?? ''}
              onChange={handleChange} >
          </textarea>
        </div>
      </div>
      <div className="footer-area">
        <div className="footer-area-sub">
          <div className="footer-left">
            <button className="button-back"
                onClick={() => handleBack(isTrackEdited(originalTrack, track))}>
              <ArrowLeft size={16} />
            </button>
          </div>
          <div className="flex space-x-2">
            <button
                name="prev_button"
                className="button-normal"
                disabled={track.track_no === 1}
                onClick={handleMoveTrack}>
              <ChevronsLeft size={18} />
            </button>
            <button
                name="next_button"
                className="button-normal"
                onClick={handleMoveTrack}>
              <ChevronsRight size={18} />
            </button>
            <button className="button-save"
                disabled={!isTrackEdited(originalTrack, track)}
                onClick={handleSave}>
              <Check size={16} />
            </button>
          </div>
        </div>
      </div>
      <ConfirmModal />
      <HiddenPanel
          isOpen={hiddenPanelOpen}
          content={
              <>
                is_single:{track.is_single} <br />
                originalTrack:<br /> {JSON.stringify(originalTrack)}<br />
                track:<br /> {JSON.stringify(track)}
              </>
          } />
    </div>
  )
}
