'use client'

import { Suspense, useEffect, useState } from 'react'
import { ArrowLeft, Check, Search } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

import { fetchArtist, mergeArtist, isArtistEdited, validateArtist } from '@/actions/music/artist-action'
import { Breadcrumb } from '@/components/Breadcrumb'
import ConfirmModal from '@/components/ConfirmModal'
import { removeErrorKey } from '@/components/form-error'
import Modal from '@/components/Modal'
import HiddenPanel from '@/components/HiddenPanel'
import MessageBanner from '@/components/MessageBanner'
import RegionList from '@/components/ReigonList'
import { useConfirmModal } from '@/contexts/ConfirmModalContext'
import { useMessage } from '@/contexts/MessageContext'
import { Artist, initialArtist } from '@/types/music/artist-types'
import { CodeArtistType, CodeArtistGrade } from '@/utils/codeUtils'
import { formatDateTime } from '@/utils/dateFormat'
import { useCustomBack } from '@/utils/navigationUtils'
import { removeArticle } from '@/utils/stringUtils'

const Page = () => {
  return (
    <Suspense fallback={<div>Loading artist list...</div>}>
      <ArtistForm />
    </Suspense>
  )
}
export default Page

const ArtistForm = () => {

  const params = useSearchParams()
  const inArtistId = params.get('artist_id') ?? ''

  const [artist, setArtist] = useState<Artist>(initialArtist)
  const [originalArtist, setOriginalArtist] = useState<Artist>(initialArtist)

  const { setIsModalOpen, setModalMessage, setConfirmHandler } = useConfirmModal()
  const { message, setMessage, messageType, setMessageType, errors, setErrors } = useMessage()
  const [hiddenPanelOpen, setHiddenPanelOpen] = useState(false)
  const { handleBack } = useCustomBack()
  const [showRegionModal, setShowRegionModal] = useState(false)

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target
    if (name === 'artist_name_1' && value) {
      setArtist(prev => ({
        ...prev, artist_name_0: removeArticle(value)
      }))
    }
    setErrors(removeErrorKey(errors, name))
    setArtist(prev => ({
      ...prev, [name]: value
    }))
  }

  const handleRegionSelect = (regionCode: string, regionName: string) => {
    setShowRegionModal(false)
    setArtist(prev => ({
      ...prev,
      origin_code: regionCode,
      origin_full_name_1: regionName,
    }))
  }

  const handleSave = () => {
    setModalMessage('Do you want to continue with this registration?')
    setConfirmHandler(async () => {
      const validationErrors = validateArtist(artist)
      if (0 < Object.keys(validationErrors).length) {
        setMessage('Validation Error!')
        setMessageType('error')
        setErrors(validationErrors)
        return
      }
      const result = await mergeArtist(artist)
      setArtist(result)
      setOriginalArtist(result)
      setMessage('Saved Successfully!')
      setMessageType('info')
    })
    setIsModalOpen(true)
  }

  useEffect(() => {
    const loadArtist = async () => {
      if (!inArtistId) return
      const fetchData = await fetchArtist(inArtistId)
      setArtist(fetchData)
      setOriginalArtist(fetchData)
    }
    loadArtist()

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
      <h2 className="header-title">Artist Form</h2>
      <p className="timestamp">{artist.artist_id ? "last updated at: " + formatDateTime(artist.updated_at, 'yyyy/MM/dd HH:mm') + " (" + artist.updated_count + ")" : '(Not registered)'}</p>
      <div>
        <div className="input-form mb-2">
          <label htmlFor="artist_name_0">Artist Name</label>
          <input type="text"
              id="artist_name_0"
              name="artist_name_0"
              className={errors.artist_name_0 ? "isError" : ""}
              value={artist.artist_name_0}
              onChange={handleChange} />
        </div>
        <div className="input-form mb-2">
          <label htmlFor="artist_name_1"></label>
          <input type="text"
              id="artist_name_1"
              name="artist_name_1"
              className={errors.artist_name_1 ? "isError" : ""}
              value={artist.artist_name_1}
              onChange={handleChange} />
        </div>
        <div className="input-form">
          <label htmlFor="artist_name_2"></label>
          <input type="text"
              id="artist_name_2"
              name="artist_name_2"
              value={artist.artist_name_2 ?? ""}
              onChange={handleChange} />
        </div>
        <div className="input-form">
          <label htmlFor="artist_type">Artist Type</label>
          <select
              id="artist_type"
              name="artist_type"
              className="w-80"
              value={artist.artist_type ?? ""}
              onChange={handleChange} >
            <option key="" value=""></option>
            {Object.entries(CodeArtistType)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([key, label]) => (<option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
        <div className="input-form">
          <label htmlFor="origin_full_name_1">Origin</label>
          <input type="text"
              id="origin_full_name_1"
              name="origin_full_name_1"
              value={artist.origin_full_name_1 ?? ''}
              readOnly />
          <button className="button-normal"
              onClick={() => setShowRegionModal(true)}>
            <Search size={16} />
          </button>
        </div>
        <div className="input-form">
          <label htmlFor="years_active">Years Active</label>
          <input type="text"
              id="years_active"
              name="years_active"
              value={artist.years_active ?? ""}
              onChange={handleChange} />
        </div>
        <div className="input-form">
          <label htmlFor="grade">Grade</label>
          <select
              id="grade"
              name="grade"
              className="w-80"
              value={artist.grade}
              onChange={handleChange} >
            <option key="" value=""></option>
            {Object.entries(CodeArtistGrade)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([key, label]) => (<option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
        <div className="input-form">
          <label htmlFor="last_listened_at">Last Listened At</label>
          <input type="text"
              id="last_listened_at"
              name="last_listened_at"
              value={formatDateTime(artist.last_listened_at, 'yyyy/MM/dd HH:mm')}
              readOnly />
        </div>
        <div className="input-form-full">
          <label htmlFor="artist_comment">Artist Comment</label>
          <textarea id="artist_comment"
              name="artist_comment"
              rows={3}
              value={artist.artist_comment ?? ''}
              onChange={handleChange} >
          </textarea>
        </div>
      </div>
      <div className="footer-area">
        <div className="footer-area-sub">
          <div className="footer-left">
            <button className="button-back"
                onClick={() => handleBack(isArtistEdited(originalArtist, artist))}>
              <ArrowLeft size={16} />
            </button>
          </div>
          <div>
            <button className="button-save"
                disabled={!isArtistEdited(originalArtist, artist)}
                onClick={handleSave}>
              <Check size={16} />
            </button>
          </div>
        </div>
      </div>
      {showRegionModal && (
        <Modal onClose={() => setShowRegionModal(false)}>
          <RegionList
              onSelect={handleRegionSelect} />
        </Modal>
      )}
      <ConfirmModal />
      <HiddenPanel
          isOpen={hiddenPanelOpen}
          content={
              <>
                originalArtist:<br /> {JSON.stringify(originalArtist)}<br />
                artist:<br /> {JSON.stringify(artist)}
              </>
          } />
    </div>
  )
}
