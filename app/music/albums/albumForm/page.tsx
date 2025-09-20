'use client'

import { Suspense, useEffect, useState } from 'react'
import { Check, Clock, ArrowLeft, ArrowRight, Plus } from 'lucide-react'
import type { NextPage } from 'next'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'

import { fetchArtist } from '@/actions/music/artist-action'
import { fetchAlbum, mergeAlbum, isAlbumEdited, validateAlbum } from '@/actions/music/album-action'
import { Breadcrumb } from '@/components/Breadcrumb'
import ConfirmModal from '@/components/ConfirmModal'
import { removeErrorKey } from '@/components/form-error'
import HiddenPanel from '@/components/HiddenPanel'
import PartialDateInput from '@/components/PartialDateInput'
import MessageBanner from '@/components/MessageBanner'
import { useConfirmModal } from '@/contexts/ConfirmModalContext'
import { useHistory } from '@/contexts/HistoryContext'
import { useMessage } from '@/contexts/MessageContext'
import { checkUser } from '@/contexts/RooterContext'
import { Album, initialAlbum } from '@/types/music/album-types'
import { CodeAlbumType, CodeOwnedFlag } from '@/utils/codeUtils'
import { formatDateTime } from '@/utils/dateFormat'
import { useCustomBack } from '@/utils/navigationUtils'
import { removeArticle } from '@/utils/stringUtils'

const Page = () => {
  return (
    <Suspense fallback={<div>Loading artist list...</div>}>
      <AlbumList />
    </Suspense>
  )
}
export default Page

const AlbumList = () => {

  const searchParams = useSearchParams()
  const inArtistId = searchParams.get('artist_id') ?? ''
  const inAlbumId = searchParams.get('album_id') ?? ''

  const { setIsModalOpen, setModalMessage, setConfirmHandler } = useConfirmModal()
  const { message, setMessage, messageType, setMessageType, errors, setErrors } = useMessage()
  const [hiddenPanelOpen, setHiddenPanelOpen] = useState(false)
  const { handleBack } = useCustomBack()
  const { addToHistory } = useHistory()
  const pathname = usePathname()
  const router = useRouter()

  const [album, setAlbum] = useState<Album>(initialAlbum)
  const [originalAlbum, setOriginalAlbum] = useState<Album>(initialAlbum)

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target
    if (name && name === 'album_name_1' && value) {
      setAlbum(prev => ({
        ...prev, album_name_0: removeArticle(value)
      }))
    }
    setErrors(removeErrorKey(errors, name))
    setAlbum(prev => ({
      ...prev, [name]: value
    }))
  }

  const handleChangeDate = (value: string, name: string) => {
    setAlbum(prev => ({
      ...prev, [name]: value
    }))
  }

  const handlePlus = () => {
    setAlbum(prev => ({
      ...prev,
      listening_count: prev.listening_count == null ? 1 : Number(prev.listening_count) + 1,
      last_listened_at: new Date(),
    }))
  }

  const handleSave = () => {
    setModalMessage('Do you want to continue with this registration?')
    setConfirmHandler(async () => {
      const validationErrors = validateAlbum(album)
      if (0 < Object.keys(validationErrors).length) {
        setMessage('Validation Error!')
        setMessageType('error')
        setErrors(validationErrors)
        return
      }
      const result = await mergeAlbum(album)
      setAlbum(result)
      setOriginalAlbum(result)
      setMessage('Saved Successfully!')
      setMessageType('info')
    })
    setIsModalOpen(true)
  }

  const handleAddTask = () => {
    addToHistory({ title: 'albumForm', path: `${pathname}?${searchParams.toString()}`})
    const queryPrams = new URLSearchParams()
    queryPrams.append('artist_id', album.artist_id)
    queryPrams.append('artist_name', album.artist_name_1)
    queryPrams.append('album_id', album.album_id)
    queryPrams.append('album_name', album.album_name_1)
    router.push(`/tasks/music/musicTaskForm/?${queryPrams.toString()}`)
  }

  const checkLogin = async () => {
    await checkUser()
  }
  useEffect(() => {
    checkLogin()
    const loadAlbum = async () => {
      if (inArtistId) {
        const fetchData = await fetchArtist(inArtistId)
        const fetchData2 = {
          ...album,
          artist_id: fetchData.artist_id,
          artist_name_0: fetchData.artist_name_0,
          artist_name_1: fetchData.artist_name_1,
          artist_name_2: fetchData.artist_name_2,
        }
        setAlbum(fetchData2)
        setOriginalAlbum(fetchData2)
      } else if (inAlbumId) {
        const fetchData = await fetchAlbum(inAlbumId)
        setAlbum(fetchData)
        setOriginalAlbum(fetchData)
      } else return
    }
    loadAlbum()

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
      <h2 className="header-title">Album Form</h2>
      <p className="timestamp">{album.album_id ? "last updated at: " + formatDateTime(album.updated_at, 'yyyy/MM/dd HH:mm') + " (" + album.updated_count + ")" : '(Not registered)'}</p>
      <div>
        <div className="input-form">
          <label htmlFor="artist_name_1"
              className="label-fixed">
            Artist Name
          </label>
          <input type="text"
              id="artist_name_1"
              name="artist_name_1"
              className="input-fixed"
              readOnly={true}
              value={album.artist_name_1 ?? ''}
              onChange={handleChange} />
        </div>
        <div className="input-form mb-2">
          <label htmlFor="album_name_0">Album Name</label>
          <input type="text"
              id="album_name_0"
              name="album_name_0"
              className={errors.album_name_0 ? "isError" : ""}
              value={album.album_name_0}
              onChange={handleChange} />
        </div>
        <div className="input-form mb-2">
          <label htmlFor="album_name_1"></label>
          <input type="text"
              id="album_name_1"
              name="album_name_1"
              className={errors.album_name_1 ? "isError" : ""}
              value={album.album_name_1}
              onChange={handleChange} />
        </div>
        <div className="input-form">
          <label htmlFor="album_name_2"></label>
          <input type="text"
              id="album_name_2"
              name="album_name_2"
              className={errors.album_name_2 ? "isError" : ""}
              value={album.album_name_2}
              onChange={handleChange} />
        </div>
        <div className="input-form">
          <label htmlFor="album_type">Album Type</label>
          <select
              id="album_type"
              name="album_type"
              className="w-48"
              value={album.album_type}
              onChange={handleChange} >
            <option key="" value=""></option>
            {Object.entries(CodeAlbumType)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([key, label]) => (<option key={key} value={key}>{label}</option>
            ))}
          </select>
          <input type="number"
              id="album_no"
              name="album_no"
              className={errors.album_no ? "numeric-field isError w-2" : "numeric-field w-20"}
              value={album.album_no ?? 0}
              onChange={handleChange} />
        </div>
        <div className="input-form">
          <label htmlFor="released">Released</label>
          <PartialDateInput
              name="released"
              value={album.released ?? ''}
              onChange={handleChangeDate}
              mode="flexible" />
        </div>
        <div className="input-form">
          <label htmlFor="owned_flag">Owned</label>
          <select
              id="owned_flag"
              name="owned_flag"
              className="w-24"
              value={album.owned_flag}
              onChange={handleChange} >
            <option key="" value=""></option>
            {Object.entries(CodeOwnedFlag)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([key, label]) => (<option key={key} value={key}>{label}</option>
            ))}
          </select>
          <PartialDateInput
              name="added_at"
              value={formatDateTime(album.added_at, 'yyyy/MM/dd') ?? ''}
              onChange={handleChangeDate}
              mode="flexible" />
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
              value={album.listening_count ?? ''}
              onChange={handleChange} />
          <PartialDateInput
              name="last_listened_at"
              value={formatDateTime(album.last_listened_at, 'yyyy/MM/dd') ?? ''}
              onChange={handleChangeDate}
              mode="flexible" />
        </div>
        <div className="input-form-full">
          <label htmlFor="album_comment">Album Comment</label>
          <textarea id="album_comment"
              name="album_comment"
              rows={3}
              value={album.album_comment ?? ''}
              onChange={handleChange} >
          </textarea>
        </div>
      </div>
      <div className="footer-area">
        <div className="footer-area-sub">
          <div className="footer-left">
            <button className="button-back"
                onClick={() => handleBack(isAlbumEdited(originalAlbum, album))}>
              <ArrowLeft size={16} />
            </button>
          </div>
          <div className="footer-right">
            <button className="button-second"
                disabled={!album.album_id}
                onClick={handleAddTask}>
              <ArrowRight size={14} />
              <span>&nbsp;</span>
              <Clock size={16} />
            </button>
            <button className="button-save"
                disabled={!isAlbumEdited(originalAlbum, album)}
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
                originalAlbum:<br /> {JSON.stringify(originalAlbum)}<br />
                album:<br /> {JSON.stringify(album)}
              </>
          } />
    </div>
  )
}
