'use client'

import { Suspense, useEffect, useState } from 'react'
import { ArrowLeft, Download, Plus, } from "lucide-react"
import type { NextPage } from 'next'

import { Breadcrumb } from '@/components/Breadcrumb'
import ConfirmModal from '@/components/ConfirmModal'
import MessageBanner from '@/components/MessageBanner'
import { useConfirmModal } from '@/contexts/ConfirmModalContext'
import { useMessage } from '@/contexts/MessageContext'
import { checkUser } from '@/contexts/RooterContext'
import { Track } from '@/types/music/track-types'
import { useCustomBack } from '@/utils/navigationUtils'
import { fetchArtistTrack, mergeTracks } from '@/actions/music/track-action'
import { removeArticle } from '@/utils/stringUtils'

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
  const { message, setMessage, messageType, setMessageType, errors, setErrors } = useMessage()

  const [texts, setTexts] = useState<Track[]>([])

  const handleImport = async () => {
    const clipText = await navigator.clipboard.readText()
    const lines = clipText.trim().split('\n')
    const newTexts = []
    for (const line of lines) {
      const cells = line.split('\t')
      const fetchData = await fetchArtistTrack(cells[2], cells[3], cells[5])
      newTexts.push({
        artist_id: fetchData.artist_id || '',
        artist_name_0: '',
        artist_name_1: cells[2],
        artist_name_2: '',
        album_id: fetchData.album_id || '',
        album_name_0: '',
        album_name_1: cells[3],
        album_name_2: '',
        album_year: 0,
        track_id: fetchData.track_id || '',
        disc_no: cells[1] ? Number(cells[1]) : null,
        track_no: Number(cells[0]),
        track_artist_name: cells[4],
        track_name_0: removeArticle(cells[5]),
        track_name_1: cells[5],
        track_name_2: cells[6],
        is_bonus_track: cells[9] ? '1' : '0',
        track_year: cells[10] ? Number(cells[10]) : null,
        track_length: cells[7] ? cells[7].substring(0, cells[7].length - 2) + ":" + cells[7].substring(cells[7].length - 2, cells[7].length) : "",
        is_single: cells[8] ? '1' : '0',
        single_no: cells[8] ? Number(cells[8]) : null,
        track_point: null,
        is_point_except: '0',
        listening_count: null,
        last_listened_at: null,
        track_comment: '',
        updated_count: 0,
        updated_at: null,
      })
    }
    console.log('texts', newTexts)
    setTexts(newTexts)
  }

  const handleSave = async () => {
    setModalMessage('Do you want to continue with this registration?')
    setConfirmHandler(async () => {
      await mergeTracks(texts)
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
      <table>
        <thead>
          <tr>
            <th>Artist Name</th>
            <th>Album Name</th>
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
          {texts.map((text) => (
            <tr key={text.track_name_0}>
              <td className={text.artist_id ? "text-blue-600" : ""}>{text.artist_name_1}</td>
              <td className={text.album_id ? "text-blue-600" : ""}>{text.album_name_1}</td>
              <td>{text.track_artist_name}</td>
              <td className="numeric-field">{text.track_no}{text.disc_no ? ' / ' + text.disc_no : ''}</td>
              <td className={text.track_id ? "text-blue-600" : ""}>{text.track_name_0}</td>
              <td className={text.track_id ? "text-blue-600" : ""}>{text.track_name_1}</td>
              <td className={text.track_id ? "text-blue-600" : ""}>{text.track_name_2}</td>
              <td className="numeric-field">{text.single_no}</td>
              <td>{text.is_bonus_track}</td>
              <td className="numeric-field">{text.track_year}</td>
              <td>{text.track_length}</td>
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
