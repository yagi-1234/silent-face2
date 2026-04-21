'use client'

import { Suspense, useCallback, useEffect, useState } from 'react'
import { ArrowLeft, Calendar, Clock, FileText, History, Plus, Search, OctagonX, Star } from 'lucide-react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'

import { fetchTracks } from '@/actions/music/track-action'
import { Breadcrumb } from '@/components/Breadcrumb'
import ConfirmModal from '@/components/ConfirmModal'
import { EllipsisAndTooltip } from '@/components/EllipsisAndTooltip'
import HiddenPanel from '@/components/HiddenPanel'
import SelectButton from '@/components/SelectButton'
import { useHistory } from '@/contexts/HistoryContext'
import MessageBanner from '@/components/MessageBanner'
import { ToggleButton } from '@/components/ToggleButton'
import { useMessage } from '@/contexts/MessageContext'
import { checkUser } from '@/contexts/RooterContext'
import { TrackView, TrackCondition, initialTrackCondition } from '@/types/music/track-types'
import { TrackListOrder } from '@/utils/codeUtils'
import { formatDateTime } from '@/utils/dateFormat'
import { useCustomBack } from '@/utils/navigationUtils'

const Page = () => {
  return (
    <Suspense fallback={<div>Loading artist list...</div>}>
      <TrackList />
    </Suspense>
  )
}
export default Page

const TrackList = () => {

  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const { message, setMessage, messageType, errors } = useMessage()
  const [hiddenPanelOpen, setHiddenPanelOpen] = useState(false)
  const { addToHistory } = useHistory()
  const { handleBack } = useCustomBack()

  const [tracks, setTracks] = useState<TrackView[]>([])
  const [condition, setCondition] = useState<TrackCondition>(initialTrackCondition)

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked, type } = event.target
    setCondition(prev => ({
      ...prev, 
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleOrderChange = useCallback((value: string) => {
    setCondition(prev => ({
      ...prev, 
      order_condition: value
    }))
  }, [])

  const handleSearch = async () => {
    const query = new URLSearchParams()
    if (condition.artist_id) query.append('artist_id', condition.artist_id)
    if (condition.artist_name) query.append('artist_name', condition.artist_name)
    if (condition.artist_name_exact_match) query.append('artist_name_exact_match', 'true')
    if (condition.album_id) query.append('album_id', condition.album_id)
    if (condition.album_name) query.append('album_name', condition.album_name)
    if (condition.album_name_exact_match) query.append('album_name_exact_match', 'true')
    if (condition.track_id) query.append('track_id', condition.track_id)
    if (condition.track_name) query.append('track_name', condition.track_name)
    if (condition.track_name_exact_match) query.append('track_name_exact_match', 'true')
    if (condition.order_condition) query.append('order_condition', condition.order_condition)
    router.push(`/music/tracks/trackList?${query.toString()}`)
    const fetchData = await fetchTracks(condition)
    console.log("fetchData", fetchData[0])
    setTracks(fetchData)
  }

  const handleClear = () => {
    setCondition(initialTrackCondition)
    setTracks([])
  }

  const handleShowForm = (trackId: string) => {
    addToHistory({ title: 'trackList', path: `${pathname}?${searchParams.toString()}`})
    if (trackId)
      router.push(`/music/tracks/trackForm?track_id=${trackId}`)
    else if (condition.album_id)
      router.push(`/music/tracks/trackForm?album_id=${condition.album_id}`)
    else if (condition.artist_id)
      router.push(`/music/tracks/trackForm?artist_id=${condition.artist_id}`)
    else if (tracks[0].album_id)
      router.push(`/music/tracks/trackForm?album_id=${tracks[0].album_id}`)
    else if (tracks[0].artist_id)
      router.push(`/music/tracks/trackForm?artist_id=${tracks[0].artist_id}`)
    else
      router.push("/music/tracks/trackForm")
  }

  const checkLogin = async () => {
    await checkUser()
  }

  useEffect(() => {
    checkLogin()
    const loadData = async () => {
      console.log(searchParams.get('album_name'))
      const condition1 = {
        ...condition,
        artist_id: searchParams.get('artist_id') ?? '',
        artist_name: searchParams.get('artist_name') ?? '',
        artist_name_exact_match: searchParams.get('artist_id') ? true : false,
        album_id: searchParams.get('album_id') ?? '',
        album_name: searchParams.get('album_name') ?? '',
        album_name_exact_match: searchParams.get('album_id') ? true : false,
        track_id: searchParams.get('track_id') ?? '',
        track_name: searchParams.get('track_name') ?? '',
        track_name_exact_match: searchParams.get('track_id') ? true : false,
        order_condition: searchParams.get('order_condition') ?? '',
      }
      setCondition(condition1)
      const fetchData = await fetchTracks(condition1)
      setTracks(fetchData)
    }
    loadData()

    const handler = (e: WindowEventMap["keydown"]) => {
      if (e.ctrlKey && e.altKey && e.key === 'd')
        setHiddenPanelOpen(prev => !prev)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])
  
  return (
    <div className="root-panel">
      <Breadcrumb />
      <h2 className="header-title">Track List</h2>
      <MessageBanner
          message={message}
          type={messageType}
          errors={errors}
          onClose={() => setMessage('')} />
      <div>
        <div className="hidden sm:block">
          <div className="div-input-row">
            <label htmlFor="artist_name"
                className={condition.artist_id ? "text-blue-600 input-label" : "input-label"}>
              Artist Name
            </label>
            <div className="div-row-between">
              <input type="text"
                  id="artist_name"
                  name="artist_name"
                  value={condition.artist_name}
                  className={condition.artist_id ? "input-fixed w-full sm:w-160" : "w-full sm:w-160"}
                  readOnly={!!condition.artist_id}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSearch()
                  }}
                  onChange={handleSearchChange} />
              <div className="flex-2">
                <ToggleButton
                    name="artist_name_exact_match"
                    title="Exact Match"
                    checked={condition.artist_name_exact_match}
                    onChange={handleSearchChange} />
              </div>
            </div>
          </div>
          <div className="div-input-row">
            <label htmlFor="album_name"
                className={condition.artist_id ? "text-blue-600 input-label" : "input-label"}>
              Album Name
            </label>
            <div className="div-row-between">
              <input type="text"
                  id="album_name"
                  name="album_name"
                  value={condition.album_name}
                  className={condition.album_id ? "input-fixed w-full sm:w-160" : "w-full sm:w-160"}
                  readOnly={!!condition.album_id}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSearch()
                  }}
                  onChange={handleSearchChange} />
              <div className="flex-2">
                <ToggleButton
                    name="album_name_exact_match"
                    title="Exact Match"
                    checked={condition.album_name_exact_match}
                    onChange={handleSearchChange} />
              </div>
            </div>
          </div>
          <div className="div-input-row">
            <label htmlFor="track_name" className="input-label">Track Name</label>
            <div className="div-row-between">
              <input type="text"
                  id="track_name"
                  name="track_name"
                  value={condition.track_name}
                  className={condition.track_id ? "input-fixed w-full sm:w-160" : "w-full sm:w-160"}
                  readOnly={!!condition.track_id}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSearch()
                  }}
                  onChange={handleSearchChange} />
              <div className="flex-2">
                <ToggleButton
                    name="track_name_exact_match"
                    title="Exact Match"
                    checked={condition.track_name_exact_match}
                    onChange={handleSearchChange} />
              </div>
            </div>
          </div>
          <div className="div-input-row">
            <label htmlFor="order" className="input-label">Order</label>
            <div className="mb-2">
              <SelectButton
                  options={TrackListOrder}
                  value={condition.order_condition}
                  onChange={handleOrderChange}/>
            </div>
          </div>
        </div>
        <div className="block sm:hidden">
          <div className="div-input-row">
            <label htmlFor="artist_name"
                className={condition.artist_id ? "text-blue-600 input-label" : "input-label"}>
              Artist Name
            </label>
            <input type="text"
                id="artist_name"
                name="artist_name"
                value={condition.artist_name}
                className={condition.artist_id ? "input-fixed w-full sm:w-160" : "w-full sm:w-160"}
                readOnly={!!condition.artist_id}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch()
                }}
                onChange={handleSearchChange} />
          </div>
          <div className="div-input-row">
            <div className="div-row-right">
              <ToggleButton
                  name="artist_name_exact_match"
                  title="Exact Match"
                  checked={condition.artist_name_exact_match}
                  onChange={handleSearchChange} />
            </div>
          </div>
          <div className="div-input-row">
            <label htmlFor="album_name"
                className="input-label">
              Album Name
            </label>
            <input type="text"
                id="album_name"
                name="album_name"
                value={condition.album_name}
                className={condition.album_id ? "input-fixed w-full sm:w-160" : "w-full sm:w-160"}
                readOnly={!!condition.album_id}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch()
                }}
                onChange={handleSearchChange} />
          </div>
          <div className="div-input-row">
            <div className="div-row-right">
              <ToggleButton
                  name="album_name_exact_match"
                  title="Exact Match"
                  checked={condition.album_name_exact_match}
                  onChange={handleSearchChange} />
            </div>
          </div>
          <div className="div-input-row">
            <label htmlFor="track_name"
                className="input-label">
              Track Name
            </label>
            <input type="text"
                id="track_name"
                name="track_name"
                value={condition.track_name}
                className={condition.track_id ? "input-fixed w-full sm:w-160" : "w-full sm:w-160"}
                readOnly={!!condition.track_id}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch()
                }}
                onChange={handleSearchChange} />
          </div>
          <div className="div-input-row">
            <div className="div-row-right">
              <ToggleButton
                  name="track_name_exact_match"
                  title="Exact Match"
                  checked={condition.track_name_exact_match}
                  onChange={handleSearchChange} />
            </div>
          </div>
        </div>
      </div>
      <div className="div-row-right">
        <button className="button-normal"
            onClick={handleClear}>
          <OctagonX size={16} />
        </button>
        <button className="button-search"
            onClick={handleSearch}>
          <Search size={16} />
        </button>
      </div>
      <div className="hidden sm:block">
        <table>
          <thead>
            <tr>
              <th>Artist Name</th>
              <th>Album Name</th>
              <th>Track No</th>
              <th>Track Name</th>
              <th>Point</th>
              <th>Single</th>
              <th>Year</th>
              <th>Length</th>
              <th>Last Listened</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {tracks.map(track => (
              <tr key={track.track_id} className="leading-none">
                <td>{EllipsisAndTooltip(track.track_artist_name_1 ?? '', 24)}</td>
                <td>{EllipsisAndTooltip(track.album_name_1 ?? '', 32)}</td>
                <td className="numeric-field">
                  {track.track_no}{track.disc_no ? ' / ' + track.disc_no : ''}
                </td>
                <td>{EllipsisAndTooltip(track.track_name_1 ?? '', 40)}</td>
                <td className="numeric-field">{track.is_point_except === "1" ? "-" : track.track_point}</td>
                <td className="numeric-field">{!!track.single_no ? track.single_no : track.is_single === "1" ? "◯" : ""}</td>
                <td className="numeric-field">{!!track.track_year ? track.track_year : track.album_year}</td>
                <td>{track.track_length}</td>
                <td>{formatDateTime(track.last_listened_at, "yyyy/MM/dd")}</td>
                <td>
                  <button
                      className="button-page"
                      onClick={() => handleShowForm(track.track_id ?? "")} >
                    <FileText className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="block sm:hidden">
        <div className="div-card-area">
          {tracks.map(track => (
            <div key={track.track_id} className="div-card">
              <div className="div-card-row">{track.artist_name_1}</div>
              <div className="div-card-row">{track.album_name_1}</div>
              <div className="div-card-row">
                {track.track_no}{track.disc_no ? ' / ' + track.disc_no : ''}
                <span>&ensp;</span>
                <button
                    className="button-link card-title"
                    onClick={() => handleShowForm(track.track_id ?? '')}>
                  {track.track_name_1}
                </button>
              </div>
              <div className="div-card-row">
                <Clock size={14} />
                {track.track_length}
                <Star size={14} />
                {track.is_point_except === "1" ? "-" : track.track_point}
                <span>&ensp;</span>
                {!!track.single_no ? track.single_no : track.is_single === "1" ? "◯" : ""}
                <span>&ensp;</span>
                <Calendar size={14} />
                {!!track.track_year ? track.track_year : track.album_year}
              </div>
              <div className="div-card-row">
                <History size={14} />
                {formatDateTime(track.last_listened_at, "yyyy/MM/dd")}
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
          <div>
            <button className="button-save"
                onClick={() => handleShowForm("")}>
              <Plus size={16} />
            </button>
          </div>
        </div>
      </div>
      <ConfirmModal />
      <HiddenPanel
          isOpen={hiddenPanelOpen}
          content={
              <>
                condition:<br /> {JSON.stringify(condition)}<br />
              </>
          } />
    </div>
  )
}
