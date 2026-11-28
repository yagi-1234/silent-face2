'use client'

import { Suspense, useEffect, useState } from 'react'
import { Check, ArrowLeft, EllipsisVertical, Minus, Pencil, Plus } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

import { fetchNote, mergeNote, deleteNote } from '@/actions/tasks/note-action'
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
  const { handleBack } = useCustomBack()
  const { message, setMessage, messageType, setMessageType, errors, setErrors } = useMessage()

  const [note, setNote] = useState<NoteView>(initialNote)
  const lines = (note.content ?? '').split('\n')
  const [hiddenPanelOpen, setHiddenPanelOpen] = useState(false)
  const [isEdit, setIsEdit] = useState<boolean>(false)
  const [checkedItems, setCheckedItems] = useState<number[]>([])
  const [showSubMenu, setshowSubMenu] = useState(false)
  const [subMenuPosition, setSubMenuPosition] = useState({ x: 0, y: 0 })

  const checkLogin = async () => {
    await checkUser()
  }

  const loadData = async () => {
    if (inNoteId) {
      const fetchData = await fetchNote(inNoteId)
      setNote(fetchData)
    }
  }

  const renderContent = (content: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g
    return content.split(urlRegex).map((part, index) => {
      if (urlRegex.test(part)) {
        urlRegex.lastIndex = 0
        return (
          <a key={index}
              href={part}
              target="_blank"
              rel="nooperner noreferrer"
              className="text-blue-500 underline hover:text-blue-700">
            {part}
          </a>
        )
      }
      return part
    })
  }

  const toggleCheck = (index: number) => {
    setCheckedItems((prev) =>
      prev.includes(index) ? prev.filter((item) => item !== index) : [...prev, index]
    )
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target
    setNote(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.clientX
    console.log(event.clientX)
    setSubMenuPosition({ x: event.clientX, y: event.clientY })
    setshowSubMenu(true)
  }

  const handleSave = () => {
    setModalMessage('Do you want to continue with this registration?')
    setConfirmHandler(async () => {
      const result = await mergeNote(note)
      setNote(result)
      setMessage('Saved Successfully!')
      setMessageType('info')
      setIsEdit(false)
    })
    setIsModalOpen(true)
  }

  const handleDelete = async () => {
    setModalMessage('Do you want to continue with this deletion?')
    setConfirmHandler(async () => {
      await deleteNote(note)
      setMessage('Deleted Successfully!')
      setMessageType('info')
      handleBack(false)
    })
    setIsModalOpen(true)
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
      <div className="flex justify-end gap-2">
        <p className="timestamp">{note.note_id ? "last updated at: " + formatDateTime(note.updated_at, 'yyyy/MM/dd HH:mm') + " (" + note.updated_count + ")" : '(Not registered)'}</p>
        <button className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center"
            onClick={handleMenu}>
          <EllipsisVertical size={16} />
        </button>
      </div>
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
            <div className="div-row-left items-center">
              <label htmlFor="content" className="w-16">Content</label>
              {!isEdit && note.note_id ? (
                <button
                    onClick={() => setIsEdit(true)} >
                  <Pencil size={16} />
                </button>
              ) : null}
            </div>
            {isEdit || !note.note_id ? (
              <div className="div-row-left">
                <textarea id="content"
                    name="content"
                    rows={10}
                    value={note.content ?? ""}
                    onChange={handleChange} >
                </textarea>
              </div>
            ) : (
              <div className="div-row-left">
                <div className="whitespace-pre-wrap">
                  {lines.map((line, index) => {
                    const match = line.match(/^\[([ x])\]\s*(.*)$/i)
                    if (match) {
                      const isChecked = match[1].toLowerCase() === 'x' || checkedItems.includes(index)
                      return (
                        <div key={index} className="div-row-left">
                          <input type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleCheck(index)}
                              className="w-4 mr-2" />
                          <span>{renderContent(match[2])}</span>
                        </div>
                      )
                    }
                    return (
                      <div key={index}>
                        {renderContent(line)}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
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
            {isEdit || !note.note_id ? (
              <button className="button-save"
                  onClick={handleSave}>
                {note.note_id ? (
                  <Check size={16} />
                ) : (
                  <Plus size={16} />
                )}
              </button>
            ) : null}
          </div>
        </div>
      </div>
      <button className="button-delete"
          onClick={() => handleDelete()}>
        <Minus size={16} />
      </button>
      <ConfirmModal />
      <HiddenPanel
          isOpen={hiddenPanelOpen}
          content={
              <>
              </>
          } />
      {showSubMenu && (
        <>
          <div className="fixed inset-0 bg-[rgba(0,0,0,0.4)]"
              onClick={() => setshowSubMenu(false)} />
          <div className="fixed bg-white rounded-lg shadow-lg w-48 p-6"
              style={{ left: subMenuPosition.x - 200, top: subMenuPosition.y - 80 }}>
            <button
                className="flex items-center cursor-pointer"
                onClick={() => handleDelete()}>
              <Minus className="bg-red-400 rounded-full mr-2 text-white" size={16} />
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  )
}
