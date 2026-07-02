'use client'

import { Suspense, useEffect, useState } from 'react'
import { ArrowLeft, Download, Info, Plus, TriangleAlert } from 'lucide-react'

import { fetchArtistTrack, mergeTracks } from '@/actions/music/track-action'
import { Breadcrumb } from '@/components/Breadcrumb'
import ConfirmModal from '@/components/ConfirmModal'
import MessageBanner from '@/components/MessageBanner'
import { useConfirmModal } from '@/contexts/ConfirmModalContext'
import { useMessage } from '@/contexts/MessageContext'
import { checkUser } from '@/contexts/RooterContext'
import { TrackView } from '@/types/music/track-types'
import { useCustomBack } from '@/utils/navigationUtils'
import { removeArticle, convertToRome, toLowerCase } from '@/utils/stringUtils'

import Papa from 'papaparse'

const Page = () => {
  return (
    <Suspense fallback={<div>Loading artist list...</div>}>
      <TrackImport />
    </Suspense>
  )
}
export default Page

const TrackImport = () => {

  const { setIsModalOpen, setModalMessage, setConfirmHandler } = useConfirmModal()
  const { handleBack } = useCustomBack()
  const { message, setMessage, messageType, setMessageType, errors } = useMessage()

  const [texts, setTexts] = useState<TrackView[]>([])

  const handleImport = async () => {
    const clipText = await navigator.clipboard.readText()
    const newTexts = []
    const result = Papa.parse<string[]>(clipText)
    for (const line of result.data) {
      const fetchData = await fetchArtistTrack(line[0], line[1], line[5])
      if (!fetchData) continue
      newTexts.push({
        artist_id: fetchData ? fetchData.artist_id : null,
        album_id: fetchData ? fetchData.album_id : null,
        track_id: fetchData ? fetchData.track_id : null,
        disc_no: line[2] ? Number(line[2]) : null,
        track_no: Number(line[3]),
        track_artist_name: line[4] || null,
        track_name_0: removeArticle(toLowerCase(await convertToRome(line[5]))),
        track_name_1: line[5],
        track_name_2: line[6] || null,
        is_bonus_track: line[10] ? '1' : null,
        track_year: line[8] ? Number(line[8]) : null,
        track_length: line[7],
        is_single: line[9] ? '1' : '0',
        single_no: line[9] ? Number(line[9]) : null,
        track_point: fetchData ? fetchData.track_point : null,
        is_point_except: '0',
        listening_count: fetchData ? fetchData.listening_count : null,
        last_listened_at: fetchData ? fetchData.last_listened_at : null,
        track_comment: '',
        created_at: null,
        updated_count: 0,
        updated_at: null,
        artist_name_0: '',
        artist_name_1: line[0],
        artist_name_2: '',
        album_name_0: '',
        album_name_1: line[1],
        album_name_2: '',
        album_no: null,
        album_year: 0,
        total_track_count: null,
        disc_no_for_sort: line[2] ? Number(line[2]) : 0,
        track_artist_name_1: null,
        track_count: null,
        album_track_length: null,
      })
    }
    console.log('texts', newTexts)
    setTexts(newTexts)
    if (result.data.length !== newTexts.length) {
      setMessage('Failed Import ' + newTexts.length + '/' + result.data.length)
      setMessageType('error')
    }
  }

  const handleCheckTrack = async (artist_name: string, album_name: string, track_name: string) => {
    const fetchData = await fetchArtistTrack(artist_name, album_name, track_name)
    if (fetchData) {

    }
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>, rowIndex: number) => {
    const { name, type, checked } = event.target
    const value = type === 'checkbox' ? checked ? '1' : '0' : event.target.value
    setTexts(prev =>
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
      const mergeCount = await mergeTracks(texts)
      setMessage('Saved Successfully! ' + mergeCount + '/' + texts.length)
      setMessageType('info')
    })
    setIsModalOpen(true)
  }

  const checkLogin = async () => {
    await checkUser()
  }

  useEffect(() => {
    checkLogin()
  }, [])

  return (
    <div className="root-panel">
      <MessageBanner
          message={message}
          type={messageType}
          errors={errors}
          onClose={() => setMessage('')} />
      <Breadcrumb />
      <h2 className="header-title">Track Import</h2>
      <div>
        <div className="div-input-row">
          <label htmlFor="artist_name_1" className="input-label">Artist Name</label>
          <div className="div-row-left">
            {(texts[0] && !!!texts[0].artist_id) && (
              <button className="mr-2">
                <TriangleAlert className="text-red-500 h-5 w-5" />
              </button>
            )}
            <input type="text"
                id="artist_name_1"
                name="artist_name_1"
                className="w-160"
                value={texts[0]?.artist_name_1 ?? ""} />
          </div>
        </div>
        <div className="div-input-row">
          <label htmlFor="album_name_1" className="input-label">Album Name</label>
          <div className="div-row-left">
            {(texts[0] && !!!texts[0].album_id) && (
              <button className="mr-2">
                <TriangleAlert className="text-red-500 h-5 w-5" />
              </button>
            )}
            <input type="text"
                id="album_name_1"
                name="album_name_1"
                className="w-160"
                value={texts[0]?.album_name_1 ?? ""} />
          </div>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th />
            <th>Track-Artist Name</th>
            <th>Track No</th>
            <th>Track Name</th>
            <th></th>
            <th></th>
            <th>Single</th>
            <th>Bonus</th>
            <th>Year</th>
            <th>Length</th>
          </tr>
        </thead>
        <tbody>
          {texts.map((text, index) => (
            <tr key={index}>
              <td>
                {text.track_id ? (
                  <span className="text-blue-500">
                    <Info className="h-5 w-5" />
                  </span>
                ) : null}
              </td>
              <td>
                <input type="text"
                    name="track_artist_name"
                    className="w-36"
                    value={text.track_artist_name ?? ""}
                    onChange={e => handleChange(e, index)} />
              </td>
              <td>
                <input type="text"
                    name="track_no"
                    className="numeric-field w-12"
                    value={text.track_no ?? ""}
                    onChange={e => handleChange(e, index)} />
                <span>/</span>
                <input type="text"
                    name="disc_no"
                    className="numeric-field w-10"
                    value={text.disc_no ?? ""}
                    onChange={e => handleChange(e, index)} />
              </td>
              <td>
                <input type="text"
                    name="track_name_0"
                    className="w-48"
                    value={text.track_name_0 ?? ""}
                    onChange={e => handleChange(e, index)} />
              </td>
              <td>
                <input type="text"
                    name="track_name_1"
                    className="w-60"
                    value={text.track_name_1 ?? ""}
                    onChange={e => handleChange(e, index)} />
              </td>
              <td>
                <input type="text"
                    name="track_name_2"
                    className="w-60"
                    value={text.track_name_2 ?? ""}
                    onChange={e => handleChange(e, index)} />
              </td>
              <td>
                <input type="text"
                    name="single_no"
                    className="numeric-field w-12"
                    value={text.single_no ?? ""}
                    onChange={e => handleChange(e, index)} />
              </td>
              <td className="flex justify-center pt-1">
                <input type="checkbox"
                    id="is_bonus_track"
                    name="is_bonus_track"
                    className="w-5 h-5"
                    checked={text.is_bonus_track === '1'}
                    value={text.is_bonus_track ?? ""}
                  onChange={e => handleChange(e, index)} />
              </td>
              <td>
                <input type="text"
                    name="track_year"
                    className="numeric-field w-16"
                    value={text.track_year ?? ""}
                    onChange={e => handleChange(e, index)} />
              </td>
              <td>
                <input type="text"
                    name="track_length"
                    className="numeric-field w-16"
                    value={text.track_length ?? ""}
                    onChange={e => handleChange(e, index)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="footer-area">
        <div className="footer-area-sub">
          <div className="footer-left">
            <button className="button-back"
                onClick={() => handleBack(false)}>
              <ArrowLeft size={16} />
            </button>
          </div>
          <div className="footer-right">
            <button className="button-normal"
                onClick={() => handleImport()}>
              <Download size={16} />
            </button>
            <button className="button-save"
                disabled={texts.length === 0}
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
