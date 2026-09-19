'use client'

import { Suspense, useEffect, useState } from 'react'
import { ArrowLeft, Check, MapPin, Search } from 'lucide-react'
import { FaInstagram, FaTiktok, FaWikipediaW, FaYoutube } from 'react-icons/fa'
import { FaXTwitter } from 'react-icons/fa6'
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
import { useCodes } from '@/contexts/MasterContext'
import { useMessage } from '@/contexts/MessageContext'
import { Artist, initialArtist } from '@/types/music/artist-types'
import { CodeArtistType } from '@/utils/codeUtils'
import { formatDateTime } from '@/utils/dateFormat'
import { useCustomBack } from '@/utils/navigationUtils'
import { removeArticle, convertToRome, toLowerCase } from '@/utils/stringUtils'

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
  const [artistNameWork, setArtistNameWork] = useState<string>('')

  const { setIsModalOpen, setModalMessage, setConfirmHandler } = useConfirmModal()
  const codes = useCodes('ArtistGrade')
  const { message, setMessage, messageType, setMessageType, errors, setErrors } = useMessage()
  const [hiddenPanelOpen, setHiddenPanelOpen] = useState(false)
  const { handleBack } = useCustomBack()
  const [showRegionModal, setShowRegionModal] = useState(false)

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target
    setErrors(removeErrorKey(errors, name))
    setArtist(prev => ({
      ...prev, [name]: value ? value : null
    }))
  }

  const handleNameOneToZero = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target
    if (artistNameWork === value && artist.artist_name_0) return
    const artistName0 = removeArticle(toLowerCase(await convertToRome(value)))
    setErrors(removeErrorKey(errors, 'artist_name_0'))
    setArtist(prev => ({
      ...prev,
      artist_name_0: artistName0
    }))
    setArtistNameWork(value)
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
      await loadArtist(result.artist_id ?? '')
      setMessage('Saved Successfully!')
      setMessageType('info')
    })
    setIsModalOpen(true)
  }

  const loadArtist = async (artistId: string) => {
    if (!artistId) return
    const fetchData = await fetchArtist(artistId)
    setArtist(fetchData)
    setOriginalArtist(fetchData)
    setArtistNameWork(fetchData.artist_name_1)
  }

  type AIArtistInfo = {
    overview: string
  }
  const [aiResult, setAiResult] = useState<AIArtistInfo | null>(null)
  const handleAiSearch = async () => {
    try {
      const response = await fetch('/api/ai/artist-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ artistName: artist.artist_name_1.trim() })
      })
      const data = await response.json()
      if (!response.ok) {
        console.log('AI search error', data)
        return
      }
      console.log('AI result:', data)
      setAiResult(data)
    } catch (error) {
      console.log('AI search error:', error)
    } finally {
//      setLoading(false)
    }
  }

  type WikiArtistInfo = {
    overview: string
  }
  type WikiKeywordSettings = {
    addBand: string
  }
  const [wikiKeywordSetting, setWikiKeywordSetting] = useState<WikiKeywordSettings>({ addBand: '' })
  const [wikiData, setWikiData] = useState<WikiArtistInfo | null>(null)
  const handleWikiKeywordAddBand = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type, value } = event.target
    const checked = type === 'checkbox' ? (event.target as HTMLInputElement).checked : null
    setWikiKeywordSetting(prev => ({
      ...prev, [name]: type === 'checkbox' ? checked ? '1' : '0' : (value ? value : null)
    }))
    setArtist(prev => ({
      ...prev, keyword_wiki: (artist.artist_name_1 ?? '') + (checked ? ' (band)' : '')
    }))
  }
  const handleWikiSearch = async () => {
    try {
      const keyword = artist.keyword_wiki ? artist.keyword_wiki : artist.artist_name_1
      const response = await fetch('/api/wiki/artist-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          artist_name: keyword.trim(),
          country_name: artist.country_name_1})
      })
      const data = await response.json()
      if (!response.ok) {
        console.log('Wiki search error', data)
        setWikiData({ ...wikiData, overview: 'Not Found' })
        return
      }
      setWikiData(data)
    } catch (error) {
      console.log('Wiki search error:', error)
    } finally {
//      setLoading(false)
    }
  }

  useEffect(() => {
    loadArtist(inArtistId)

    const handler = (e: WindowEventMap["keydown"]) => {
      if (e.ctrlKey && e.altKey && e.key === 'd')
        setHiddenPanelOpen(prev => !prev)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])
  // useEffect(() => {
  //   setWikiKeyword(artist.artist_name_1)
  // }, [artist.artist_name_1])

  const handleShowMap = () => {
    const placeName = artist.origin_full_name_1
    if (placeName) window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(placeName)}`, '_blank')
  }

  return (
    <div className="root-panel">
      <MessageBanner
          message={message}
          type={messageType}
          errors={errors}
          onClose={() => setMessage('')} />
      <Breadcrumb
          edited={isArtistEdited(originalArtist, artist)} />
      <h2 className="header-title">Artist Form</h2>
      <p className="timestamp">{artist.artist_id ? "last updated at: " + formatDateTime(artist.updated_at, 'yyyy/MM/dd HH:mm') + " (" + artist.updated_count + ")" : '(Not registered)'}</p>
      <div>
        <div className="div-input-row">
          <label htmlFor="artist_name_0" className="input-label">Artist Name</label>
          <input type="text"
              id="artist_name_0"
              name="artist_name_0"
              className={errors.artist_name_0 ? "isError w-full sm:w-160" : "w-full sm:w-160"}
              value={artist.artist_name_0}
              onChange={handleChange} />
        </div>
        <div className="div-input-row">
          <input type="text"
              id="artist_name_1"
              name="artist_name_1"
              className={errors.artist_name_1 ? "isError w-full sm:w-160" : "w-full sm:w-160"}
              value={artist.artist_name_1}
              onChange={handleChange}
              onBlur={handleNameOneToZero} />
        </div>
        <div className="div-input-row">
          <input type="text"
              id="artist_name_2"
              name="artist_name_2"
              className="w-full sm:w-160"
              value={artist.artist_name_2 ?? ""}
              onChange={handleChange} />
        </div>
        <div className="div-input-row">
          <label htmlFor="artist_type" className="input-label">Artist Type</label>
          <select
              id="artist_type"
              name="artist_type"
              className="w-48"
              value={artist.artist_type ?? ""}
              onChange={handleChange} >
            <option key="" value=""></option>
            {Object.entries(CodeArtistType)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([key, label]) => (<option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
        <div className="div-input-row">
          <label htmlFor="origin_full_name_1" className="input-label">Origin</label>
          <div className="div-input-left">
            <input type="text"
                id="origin_full_name_1"
                name="origin_full_name_1"
                className="flex-auto"
                value={artist.origin_full_name_1 ?? ''}
                readOnly />
            <button className="button-normal"
                onClick={() => setShowRegionModal(true)}>
              <Search size={16} />
            </button>
            <button
                onClick={handleShowMap}>
              <MapPin className="w-6 h-6" />
            </button>
          </div>
        </div>
        <div className="div-input-row">
          <label htmlFor="years_active" className="input-label">Years Active</label>
          <input type="text"
              id="years_active"
              name="years_active"
              value={artist.years_active ?? ""}
              onChange={handleChange} />
        </div>
        <div className="div-input-row">
          <label htmlFor="grade" className="input-label">Grade</label>
          <select
              id="grade"
              name="grade"
              className="w-48"
              value={artist.grade ?? ""}
              onChange={handleChange} >
            <option key="" value=""></option>
            {codes.map(row => (
              <option key={row.code_key} value={row.code_key ?? ""}>{row.code_value}</option>
            ))}
          </select>
        </div>
        <div className="div-input-row">
          <label htmlFor="last_listened_at" className="input-label">Last Listened At</label>
          <input type="text"
              id="last_listened_at"
              name="last_listened_at"
              value={formatDateTime(artist.last_listened_at, 'yyyy/MM/dd HH:mm')}
              readOnly />
        </div>
        <div className="div-input-row">
          <label className="input-label">Links</label>
          <div className="flex gap-3">
            <div className="div-links bg-red-600">
              <a href={`https://youtube.com//results?search_query=${encodeURIComponent(artist.artist_name_1)}`}
                  target="_blank" 
                  rel="noopener noreferrer">
                <FaYoutube className="text-white" />
              </a>
            </div>
            <div className="div-links bg-yellow-100">
              <a href={`https://ja.wikipedia.org/w/index.php?search=${encodeURIComponent(artist.artist_name_1)}`}
                  target="_blank" 
                  rel="noopener noreferrer">
                <FaWikipediaW className="text-gray-600" />
              </a>
            </div>
            <div className="div-links bg-gray-200">
              <a href={`https://en.wikipedia.org/w/index.php?search=${encodeURIComponent(artist.artist_name_1)}`}
                  target="_blank" 
                  rel="noopener noreferrer">
                <FaWikipediaW className="text-gray-600" />
              </a>
            </div>
            <div className="div-links bg-black">
              <a href={`https://twitter.com/search?src=typed_query&f=user&q=${encodeURIComponent(artist.artist_name_1)}`}
                  target="_blank" 
                  rel="noopener noreferrer">
                <FaXTwitter className="text-white" />
              </a>
            </div>
            <div className="div-links bg-pink-500">
              <a href={`https://www.instagram.com/explore/search/keyword/?q=${encodeURIComponent(artist.artist_name_1)}`}
                  target="_blank" 
                  rel="noopener noreferrer">
                <FaInstagram className="text-white" />
              </a>
            </div>
            <div className="div-links bg-black">
              <a href={`https://www.tiktok.com/search?q=${encodeURIComponent(artist.artist_name_1)}`}
                  target="_blank" 
                  rel="noopener noreferrer">
                <FaTiktok className="text-white" />
              </a>
            </div>
          </div>
        </div>
        <div className="div-input-row">
          <label htmlFor="artist_comment" className="input-label">Artist Comment</label>
          <textarea id="artist_comment"
              name="artist_comment"
              rows={3}
              value={artist.artist_comment ?? ''}
              onChange={handleChange} >
          </textarea>
        </div>
        <div className="div-input-row">
          <div className="flex items-center">
            <button className="border-2 flex items-center justify-center rounded-sm w-20 h-6 mr-2" onClick={handleWikiSearch}>
              Wiki
            </button>
            <label className="input-check-label mr-2">
              <input type="checkbox"
                  id="addBand"
                  name="addBand"
                  className="w-5"
                  checked={wikiKeywordSetting.addBand === '1'}
                  value={wikiKeywordSetting.addBand}
                  onChange={handleWikiKeywordAddBand} />
              <span>Band</span>
            </label>
            <input type="text"
                id="artist.keyword_wiki"
                name="artist.keyword_wiki"
                className="w-48 md:w-60"
                value={artist.keyword_wiki ?? ""}
                onChange={handleChange} />
          </div>
          {wikiData?.overview ? (
            <textarea id="artist_comment"
                name="artist_comment"
                rows={4}
                readOnly
                value={wikiData?.overview ?? ''}
                onChange={handleChange} >
            </textarea>
          ) : null}
        </div>
  {/* .button-normal {
    @apply border-2 text-gray-600 flex items-center justify-center rounded-sm w-16 h-8 mr-2 mb-1;
    &:hover {
      @apply bg-gray-200
    }
    &:disabled {
      @apply border-0 bg-gray-300 text-white
    }
  } */}

        {/* <div className="div-input-row">
          <button onClick={handleAiSearch}>AI Search</button>
          {aiResult?.overview}
        </div> */}
      </div>
      <div className="footer-area">
        <div className="footer-area-sub">
          <div className="footer-left">
            <button className="button-back"
                onClick={() => handleBack(isArtistEdited(originalArtist, artist))}>
              <ArrowLeft size={16} />
            </button>
          </div>
          <div className="footer-right">
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
