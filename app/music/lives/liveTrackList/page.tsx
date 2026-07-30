'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import { ArrowLeft, CirclePlus, Check, FileText, Link, Link2Off, MapPin, Pencil } from 'lucide-react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'

import { fetchLives, mergeLive, fetchLiveTracks, insertLiveTrack, updateLiveTrack } from '@/actions/music/live-action'
import { fetchArtists } from '@/actions/music/artist-action'
import { fetchTracks } from '@/actions/music/track-action'
import { Breadcrumb } from '@/components/Breadcrumb'
import ConfirmModal from '@/components/ConfirmModal'
import HiddenPanel from '@/components/HiddenPanel'
import { useHistory } from '@/contexts/HistoryContext'
import MessageBanner from '@/components/MessageBanner'
import { useConfirmModal } from '@/contexts/ConfirmModalContext'
import { useMessage } from '@/contexts/MessageContext'
import { checkUser } from '@/contexts/RooterContext'
import { LiveView, initialLive, LiveTrackView, initialLiveTrack } from '@/types/music/liveTrack-types'
import { initialArtistCondition } from '@/types/music/artist-types'
import { initialTrackCondition } from '@/types/music/track-types'
import { useCustomBack } from '@/utils/navigationUtils'

const Page = () => {
  return (
    <Suspense fallback={<div>Loading live_track_list...</div>}>
      <LiveTrackList />
    </Suspense>
  )
}
export default Page

const LiveTrackList = () => {

  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const { setIsModalOpen, setModalMessage, setConfirmHandler } = useConfirmModal()
  const { message, setMessage, messageType, setMessageType, errors } = useMessage()
  const [hiddenPanelOpen, setHiddenPanelOpen] = useState(false)
  const { addToHistory } = useHistory()
  const { handleBack } = useCustomBack()

  const [lives, setLives] = useState<LiveView[]>([])
  const [newLive, setNewLive] = useState<LiveView>(initialLive)

  const [liveTracks, setLiveTracks] = useState<LiveTrackView[]>([])
  const [liveTrackForEdit, setLiveTrackForEdit] = useState<LiveTrackView>(initialLiveTrack)
  const [isEdit, setIsEdit] = useState<boolean>(false)

  const inEventId = searchParams.get('event_id')

  const handleLiveSelect = async (selected: LiveView) => {
    setLives(prev =>
      prev.map(row =>
        row.live_id === selected.live_id ? { ...row, is_select: true} : { ...row, is_select: false }
      )
    )
    await loadData(selected.live_id ?? '')
  }
  const handleLiveEdit = (newLive: LiveView) => {
    setNewLive(newLive)
    setLives(prev =>
      prev.map(row =>
        row.live_id === newLive.live_id ? { ...row, is_edit: true} : { ...row, is_edit: false }
      )
    )
  }
  const handleLiveChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setNewLive(prev => ({
      ...prev,
      [name]: value ? value : null
    }))
  }

  const handleLiveSave = async () => {
    setModalMessage('Do you want to continue with this registration?')
    setConfirmHandler(async () => {
      const newLive2 = { ...newLive, event_id: inEventId }
      await mergeLive(newLive2)
      const fetchData = await fetchLives(inEventId ?? '')
      setLives(fetchData)
      setNewLive(initialLive)
      setMessage('Saved Successfully!')
      setMessageType('info')
    })
    setIsModalOpen(true)
  }
  const handleEdit = (liveTrack: LiveTrackView) => {
    setLiveTrackForEdit(liveTrack)
    setIsEdit(true)
  }
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setLiveTrackForEdit(prev => ({
      ...prev,
      [name]: value ? value : null
    }))
  }
  const handleSave = async () => {
    const selectedLiveId = lives.filter(filtered => filtered.is_select).at(0)?.live_id ?? ''
    const newData = { ...liveTrackForEdit, live_id: selectedLiveId }
    if (isEdit) await updateLiveTrack(newData)
    else await insertLiveTrack(newData)
    await loadData(newData.live_id ?? '')
    setLiveTrackForEdit(initialLiveTrack)
    setIsEdit(false)
  }

  const handleShowEvent = () => {
    addToHistory({ title: 'liveTrackList', path: `${pathname}?${searchParams.toString()}`})
    router.push(`/tasks/events/eventForm?event_id=${inEventId}`)
  }

  const checkLogin = async () => {
    await checkUser()
  }
  const loadLive = async () => {
    const fetchData = await fetchLives(inEventId ?? '')
    const fetchData2 = fetchData.map((row, index) => index === 0 ? { ...row, is_select: true } : row)
    setLives(fetchData2)
    if (fetchData2.length === 1) loadData(fetchData2[0].live_id ?? '')
  }
  const loadData = async (liveId: string) => {
    const fetchData = await fetchLiveTracks(liveId ?? '')
    setLiveTracks(fetchData)
  }

  const searchId = useRef(0)
  useEffect(() => {
    checkLogin()
    loadLive()
  }, [])
  useEffect(() => {
    if (!newLive.artist_name || newLive.artist_name.length < 2) return
    const timer = setTimeout(async () => {
      const id = ++searchId.current
      const condition1 = {
        ...initialArtistCondition,
        artist_name: newLive.artist_name ?? '',
        artist_name_exact_match: true
      }
      const result = await fetchArtists(condition1)
      if (id === searchId.current) {
        if (result.length === 1) {
          setNewLive(prev => ({
            ...prev,
            artist_id: result[0].artist_id
          }))
        } else if (result.length === 0) {
          setNewLive(prev => ({
            ...prev,
            artist_id: null
          }))
        }
      }
    }, 400)
    return () => clearTimeout(timer)

    // const handler = (e: WindowEventMap["keydown"]) => {
    //   if (e.ctrlKey && e.altKey && e.key === 'd')
    //     setHiddenPanelOpen(prev => !prev)
    // }
    // window.addEventListener('keydown', handler)
    // return () => window.removeEventListener('keydown', handler)
  }, [newLive.artist_name])
  useEffect(() => {
    if (!liveTrackForEdit.track_name || liveTrackForEdit.track_name.length < 2) return
    const timer = setTimeout(async () => {
      const id = ++searchId.current
      const condition1 = {
        ...initialTrackCondition,
        artist_id: lives.filter(live => live.is_select).at(0)?.artist_id ?? '',
        track_name: liveTrackForEdit.track_name ?? '',
        track_name_exact_match: true
      }
      const result = await fetchTracks(condition1)
      if (id === searchId.current) {
        if (result.length === 1) {
          setLiveTrackForEdit(prev => ({
            ...prev,
            album_id: result[0].album_id,
            album_name: result[0].album_name_1,
            track_id: result[0].track_id
          }))
        } else if (result.length === 0) {
          setLiveTrackForEdit(prev => ({
            ...prev,
            album_id: null,
            album_name: null,
            track_id: null
          }))
        }
      }
    }, 400)
    return () => clearTimeout(timer)
  }, [liveTrackForEdit.track_name])

  return (
    <div className="root-panel">
      <Breadcrumb />
      <h2 className="header-title">Live Track List</h2>
      <MessageBanner
          message={message}
          type={messageType}
          errors={errors}
          onClose={() => setMessage('')} />
      <div className="border-y divide-y">
        {lives.map((live, index) => (
          <div key={live.live_id}
              className="flex flex-col gap-1 border-b py-1">
            <div className="flex items-center gap-4">
              <button
                  className={live.is_select ? "button-page text-orange-600" : "button-page"}
                  onClick={() => handleLiveSelect(live)} >
                <MapPin className="h-5 w-5" />
              </button>
              <span>{live.start_time}</span>
              {live.stage_name ? (
                <span>{live.stage_name}</span>
              ) : null}
              {!!!live.artist_id ? (
                <button
                    className="button-page" >
                  <Link2Off className="h-3 w-3" />
                </button>
              ) : ( null )}
              <span>
                {live.artist_name}
              </span>
              <button
                  className="button-page"
                  onClick={() => handleLiveEdit(live)} >
                <Pencil size={14} />
              </button>
            </div>
          </div>
        ))}
        <div className="flex flex-col gap-1 border-b py-1">
          <div className="flex items-center gap-4">
            <input type="text"
                id="start_time"
                name="start_time"
                className="w-20"
                placeholder="Start"
                value={newLive.start_time ?? ''}
                onChange={handleLiveChange} />
            <input type="text"
                id="stage_name"
                name="stage_name"
                className="w-48"
                placeholder="Stage"
                value={newLive.stage_name ?? ''}
                onChange={handleLiveChange} />
            {newLive.artist_id ? (
              <button
                  className="button-page text-orange-600" >
                <Link className="h-3 w-3" />
              </button>
            ) : (
              <button
                  className="button-page" >
                <Link2Off className="h-3 w-3" />
              </button>
            )}
            <input type="text"
                id="artist_name"
                name="artist_name"
                className="w-80"
                placeholder="Artist"
                value={newLive.artist_name ?? ''}
                onChange={handleLiveChange} />
            {newLive.live_id ? (
              <button
                  className="button-page"
                  onClick={() => handleLiveSave()} >
                <Check size={14} />
              </button>
            ) : (
              <button
                  className="button-page"
                  onClick={() => handleLiveSave()} >
                <CirclePlus size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
      <div>
        <div className="hidden sm:block">
          <table>
            <thead>
              <tr>
                <th></th>
                <th>#</th>
                <th />
                <th>Track Name</th>
                <th>Album Name</th>
                <th>Guest</th>
                <th>Comment</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {liveTracks.map(liveTrack => (
                <tr key={liveTrack.live_track_id} className="leading-none">
                  <td>{liveTrack.part_name}</td>
                  <td className="numeric-field">{liveTrack.play_order}</td>
                  <td>
                    {!!!liveTrack.track_id ? (
                      <button
                          className="button-page" >
                        <Link2Off className="h-3 w-3" />
                      </button>
                    ) : ( null )}
                  </td>
                  <td>{liveTrack.track_name}</td>
                  <td>{liveTrack.album_name}</td>
                  <td>{liveTrack.guest_artist_name}</td>
                  <td>{liveTrack.live_track_comment}</td>
                  <td>
                    <button
                        className="button-page"
                        onClick={() => handleEdit(liveTrack)} >
                      <Pencil size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              <tr>
                <td>
                  <input type="text"
                      name="part_name"
                      className="w-20"
                      value={liveTrackForEdit.part_name ?? ""}
                      onChange={handleChange} />
                </td>
                <td>
                  <input type="text"
                      name="play_order"
                      className="w-20 numeric-field"
                      value={liveTrackForEdit.play_order ?? ""}
                      onChange={handleChange} />
                </td>
                <td>
                  {liveTrackForEdit.track_id ? (
                    <button
                        className="button-page text-orange-600" >
                      <Link className="h-3 w-3" />
                    </button>
                  ) : (
                    <button
                        className="button-page" >
                      <Link2Off className="h-3 w-3" />
                    </button>
                  )}
                </td>
                <td>
                  <input type="text"
                      name="track_name"
                      className="w-48"
                      value={liveTrackForEdit.track_name ?? ""}
                      onChange={handleChange} />
                </td>
                <td>
                  <input type="text"
                      name="album_name"
                      className="w-36"
                      value={liveTrackForEdit.album_name ?? ""}
                      onChange={handleChange} />
                </td>
                <td>
                  <input type="text"
                      name="guest_artist_name"
                      className="w-36"
                      value={liveTrackForEdit.guest_artist_name ?? ""}
                      onChange={handleChange} />
                </td>
                <td>
                  <input type="text"
                      name="live_track_comment"
                      className="w-36"
                      value={liveTrackForEdit.live_track_comment ?? ""}
                      onChange={handleChange} />
                </td>
                <td>
                  <button
                      className="button-page"
                      onClick={() => handleSave()}>
                    {isEdit ? (
                      <Check className='w-5 h-5' />
                    ) : (
                      <CirclePlus className='w-5 h-5' />
                    )}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
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
            <button className="button-normal w-20"
                onClick={handleShowEvent}>
              <FileText size={16} />
            </button>
          </div>
        </div>
      </div>
      <ConfirmModal />
      <HiddenPanel
          isOpen={hiddenPanelOpen}
          content={
              <>
                {/* condition:<br /> {JSON.stringify(condition)}<br /> */}
              </>
          } />
    </div>
  )
}
