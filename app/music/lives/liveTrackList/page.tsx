'use client'

import { Suspense, useEffect, useState } from 'react'
import { ArrowLeft, CirclePlus, Check, Pencil } from 'lucide-react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'

import { fetchLiveTracks, insertLiveTrack, updateLiveTrack } from '@/actions/music/live-action'
import { Breadcrumb } from '@/components/Breadcrumb'
import ConfirmModal from '@/components/ConfirmModal'
import HiddenPanel from '@/components/HiddenPanel'
import { useHistory } from '@/contexts/HistoryContext'
import MessageBanner from '@/components/MessageBanner'
import { useMessage } from '@/contexts/MessageContext'
import { checkUser } from '@/contexts/RooterContext'
import { LiveTrackView, initialLiveTrack } from '@/types/music/liveTrack-types'
import { formatDateTime } from '@/utils/dateFormat'
import { useCustomBack } from '@/utils/navigationUtils'
import { ellipsis, isEllipsed } from '@/utils/viewUtils'

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

  const { message, setMessage, messageType, errors } = useMessage()
  const [hiddenPanelOpen, setHiddenPanelOpen] = useState(false)
  const { addToHistory } = useHistory()
  const { handleBack } = useCustomBack()

  const [liveTracks, setLiveTracks] = useState<LiveTrackView[]>([])
  const [liveTrackForEdit, setLiveTrackForEdit] = useState<LiveTrackView>(initialLiveTrack)
  const [isEdit, setIsEdit] = useState<boolean>(false)
  //const [condition, setCondition] = useState<TrackCondition>(initialTrackCondition)

  const inEventId = searchParams.get('event_id')

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setLiveTrackForEdit(prev => ({
      ...prev,
      event_id: inEventId,
      [name]: value ? value : null
    }))
  }

  const handleEdit = (liveTrack: LiveTrackView) => {
    setLiveTrackForEdit(liveTrack)
    setIsEdit(true)
  }

  const handleSave = async () => {
    if (isEdit) await updateLiveTrack(liveTrackForEdit)
    else await insertLiveTrack(liveTrackForEdit)
    await loadData()
    setLiveTrackForEdit(initialLiveTrack)
    setIsEdit(false)
  }

  const handleSearch = async () => {
    // const query = new URLSearchParams()
    // if (condition.artist_id) query.append('artist_id', condition.artist_id)
    // if (condition.artist_name) query.append('artist_name', condition.artist_name)
    // if (condition.artist_name_exact_match) query.append('artist_name_exact_match', 'true')
    // if (condition.album_id) query.append('album_id', condition.album_id)
    // if (condition.album_name) query.append('album_name', condition.album_name)
    // if (condition.album_name_exact_match) query.append('album_name_exact_match', 'true')
    // if (condition.track_id) query.append('track_id', condition.track_id)
    // if (condition.track_name) query.append('track_name', condition.track_name)
    // if (condition.track_name_exact_match) query.append('track_name_exact_match', 'true')
    // router.push(`/music/tracks/trackList?${query.toString()}`)
    // const fetchData = await fetchTracks(condition)
    // console.log("fetchData", fetchData[0])
    // setTracks(fetchData)
  }

  const handleClear = () => {
    // setCondition(initialTrackCondition)
    // setTracks([])
  }

  const handleShowForm = (trackId: string) => {
    // addToHistory({ title: 'trackList', path: `${pathname}?${searchParams.toString()}`})
    // if (trackId)
    //   router.push(`/music/tracks/trackForm?track_id=${trackId}`)
    // else if (condition.album_id)
    //   router.push(`/music/tracks/trackForm?album_id=${condition.album_id}`)
    // else if (condition.artist_id)
    //   router.push(`/music/tracks/trackForm?artist_id=${condition.artist_id}`)
    // else if (tracks[0].album_id)
    //   router.push(`/music/tracks/trackForm?album_id=${tracks[0].album_id}`)
    // else if (tracks[0].artist_id)
    //   router.push(`/music/tracks/trackForm?artist_id=${tracks[0].artist_id}`)
    // else
    //   router.push("/music/tracks/trackForm")
  }

  const checkLogin = async () => {
    await checkUser()
  }

  const loadData = async () => {
    const fetchData = await fetchLiveTracks(inEventId ?? '')
    setLiveTracks(fetchData)
  }

  useEffect(() => {
    checkLogin()
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
      <h2 className="header-title">Live Track List</h2>
      <MessageBanner
          message={message}
          type={messageType}
          errors={errors}
          onClose={() => setMessage('')} />
      <div>
        <div className="hidden sm:block">
          <table>
            <thead>
              <tr>
                <th></th>
                <th>#</th>
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
