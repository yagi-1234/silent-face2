'use client'

import { Suspense, useEffect, useState } from 'react'
import { ArrowLeft, Calendar, Clock, FileText, History, Plus, Search, OctagonX, Star } from 'lucide-react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'

import { fetchNotes } from '@/actions/tasks/note-action'
import { Breadcrumb } from '@/components/Breadcrumb'
import ConfirmModal from '@/components/ConfirmModal'
import HiddenPanel from '@/components/HiddenPanel'
import { useHistory } from '@/contexts/HistoryContext'
import MessageBanner from '@/components/MessageBanner'
import { useMessage } from '@/contexts/MessageContext'
import { checkUser } from '@/contexts/RooterContext'
import { NoteView } from '@/types/tasks/note-typtes'
import { formatDateTime } from '@/utils/dateFormat'
import { useCustomBack } from '@/utils/navigationUtils'
import { ellipsis } from '@/utils/viewUtils'

const Page = () => {
  return (
    <Suspense fallback={<div>Loading artist list...</div>}>
      <NoteList />
    </Suspense>
  )
}
export default Page

const NoteList = () => {

  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const { message, setMessage, messageType, errors } = useMessage()
  const [hiddenPanelOpen, setHiddenPanelOpen] = useState(false)
  const { addToHistory } = useHistory()
  const { handleBack } = useCustomBack()

  const [notes, setNotes] = useState<NoteView[]>([])

  const checkLogin = async () => {
    await checkUser()
  }

  const loadData = async () => {
    const fetchData = await fetchNotes()
    setNotes(fetchData)
  }

  const handleShowForm = (noteId: string) => {
    addToHistory({ title: 'noteList', path: `${pathname}?${searchParams.toString()}`})
    if (noteId) router.push(`/tasks/notes/noteForm?note_id=${noteId}`)
    else router.push('/tasks/notes/noteForm')
  }

  const handlePlus = () => {
    addToHistory({ title: 'noteList', path: `${pathname}?${searchParams.toString()}`})
    router.push(`/tasks/notes/noteForm`)
  }

  useEffect(() => {
    checkLogin()
    loadData()
  }, [])

  return (
    <div className="root-panel">
      <Breadcrumb />
      <h2 className="header-title">Notes</h2>
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
                <th>Title</th>
                <th>Content</th>
                <th>Updated</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {notes.map(note => (
                <tr key={note.note_id} className="leading-none">
                  <td>{ellipsis(note.title, 16)}</td>
                  <td>{ellipsis(note.content, 40)}</td>
                  <td>{formatDateTime(note.updated_at, "yyyy/MM/dd")}</td>
                  <td>
                    <button
                        className="button-page"
                        onClick={() => handleShowForm(note.note_id ?? "")} >
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
            {notes.map(note => (
              <div key={note.note_id} className="div-card">
                <div className="div-card-row card-title">
                  <button
                      className="button-link"
                      onClick={() => handleShowForm(note.note_id ?? '')}>
                    {note.title}
                  </button>
                </div>
                <div className="div-card-row">
                  {ellipsis(note.content, 20)}
                </div>
              </div>
            ))}
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
          <div>
            <button className="button-save"
                onClick={handlePlus}>
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
              </>
          } />
    </div>
  )
}
