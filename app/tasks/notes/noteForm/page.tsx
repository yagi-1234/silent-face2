'use client'

import { Suspense, useEffect, useState } from 'react'
import { Check, ArrowLeft, Plus } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

import { fetchNote, mergeNote } from '@/actions/tasks/note-action'
import { Breadcrumb } from '@/components/Breadcrumb'
import ConfirmModal from '@/components/ConfirmModal'
import HiddenPanel from '@/components/HiddenPanel'
import MessageBanner from '@/components/MessageBanner'
import { useConfirmModal } from '@/contexts/ConfirmModalContext'
import { useMessage } from '@/contexts/MessageContext'
import { checkUser } from '@/contexts/RooterContext'
import { NoteView, initialNote } from '@/types/tasks/note-typtes'
import { formatDateTime } from '@/utils/dateFormat'
import { useCustomBack } from '@/utils/navigationUtils'

const Page = () => {
  return (
    <Suspense fallback={<div>Loading note from...</div>}>
      <NoteForm />
    </Suspense>
  )
}
export default Page

const NoteForm = () => {

  const searchParams = useSearchParams()
  const inNoteId = searchParams.get('note_id') ?? ''

  const { setIsModalOpen, setModalMessage, setConfirmHandler } = useConfirmModal()
  const { message, setMessage, messageType, setMessageType, errors, setErrors } = useMessage()
  const [hiddenPanelOpen, setHiddenPanelOpen] = useState(false)
  const { handleBack } = useCustomBack()

  const [note, setNote] = useState<NoteView>(initialNote)
  // const [originalTrack, setOriginalTrack] = useState<TrackView>(initialTrack)

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target
    setNote(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSave = () => {
    setModalMessage('Do you want to continue with this registration?')
    setConfirmHandler(async () => {
      //const validationErrors = validateWeight(weight)
      // if (0 < Object.keys(validationErrors).length) {
      //   setMessage('Validation Error!')
      //   setMessageType('error')
      //   setErrors(validationErrors)
      //   return
      // }

      const result = await mergeNote(note)
      setNote(result)
      // setOriginalTrack(result)
      setMessage('Saved Successfully!')
      setMessageType('info')
    })
    setIsModalOpen(true)
  }

  const checkLogin = async () => {
    await checkUser()
  }

  const loadData = async () => {
    if (inNoteId) {
      const fetchData = await fetchNote(inNoteId)
      setNote(fetchData)
    }
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
      <MessageBanner
          message={message}
          type={messageType}
          errors={errors}
          onClose={() => setMessage('')} />
      <Breadcrumb />
      <h2 className="header-title">Note Form</h2>
      <p className="timestamp">{note.note_id ? "last updated at: " + formatDateTime(note.updated_at, 'yyyy/MM/dd HH:mm') + " (" + note.updated_count + ")" : '(Not registered)'}</p>
      <div>
        <div className="div-input-row">
          <label htmlFor="title" className="input-label">Title</label>
          <input type="text"
              id="title"
              name="title"
              className="w-full sm:w-160"
              value={note.title ?? ""}
              onChange={handleChange} />
        </div>
        <div className="div-input-row">
          <div className="input-form-full">
            <label htmlFor="content">Content</label>
            <div className="div-row-left">
              <textarea id="content"
                  name="content"
                  rows={10}
                  value={note.content ?? ""}
                  onChange={handleChange} >
              </textarea>
            </div>
          </div>
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
                onClick={handleSave}>
              {note.note_id ? (
                <Check size={16} />
              ) : (
                <Plus size={16} />
              )}
            </button>
          </div>
        </div>
      </div>
      <ConfirmModal />
      <HiddenPanel
          isOpen={hiddenPanelOpen}
          content={
              <>
              </>
          } />
    </div>
  )
}
