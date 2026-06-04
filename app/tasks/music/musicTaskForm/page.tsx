'use client'

import { Suspense, useEffect, useState } from 'react'
import { ArrowLeft, Check, Plus } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

import { fetchMusicTask, mergeMusicTask, isMusicTaskEdited } from '@/actions/tasks/task-action'
import { Breadcrumb } from '@/components/Breadcrumb'
import ConfirmModal from '@/components/ConfirmModal'
import HiddenPanel from '@/components/HiddenPanel'
import { LogoffButton } from '@/components/LogoffButton'
import MessageBanner from '@/components/MessageBanner'
import PartialDateInput from '@/components/PartialDateInput'
import { useConfirmModal } from '@/contexts/ConfirmModalContext'
import { useMessage } from '@/contexts/MessageContext'
import { checkUser } from '@/contexts/RooterContext'
import { MusicTask, initialMusicTask } from '@/types/tasks/task-types'
import { formatDateTime } from '@/utils/dateFormat'
import { CodeTaskStatus, CodeMusicTaskType } from '@/utils/codeUtils'
import { useCustomBack } from '@/utils/navigationUtils'

const Page = () => {
  return (
    <Suspense fallback={<div>Loading music task form...</div>}>
      <MusicTaskForm />
    </Suspense>
  )
}
export default Page

const MusicTaskForm = () => {

  const { handleBack } = useCustomBack()
  const { message, setMessage, messageType, setMessageType, errors } = useMessage()
  const { setIsModalOpen, setModalMessage, setConfirmHandler } = useConfirmModal()
  const searchParams = useSearchParams()
  const [task, setTask] = useState<MusicTask>(initialMusicTask)
  const [originalTask, setOriginalTask] = useState<MusicTask>(initialMusicTask)
  const [hiddenPanelOpen, setHiddenPanelOpen] = useState(false)
  
  const inTaskSubId = searchParams.get('task_sub_id') ?? ''
  const inArtistId = searchParams.get('artist_id') ?? ''
  const inArtistName = searchParams.get('artist_name') ?? ''
  const inAlbumId = searchParams.get('album_id') ?? ''
  const inAlbumName = searchParams.get('album_name') ?? ''

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target
    setTask(prev => ({
      ...prev, [name]: value
    }))
  }
  const handleChangeDate = (value: string) => {
    const newLastActedAt = value + " " + formatDateTime(task.last_acted_at, 'HH:mm:ss')
    setTask(prev => ({
      ...prev, last_acted_at: isNaN(new Date(newLastActedAt).getTime()) ? prev.last_acted_at : new Date(newLastActedAt)
    }))
  }

  const handlePlus = () => {
    setTask(prev => ({
      ...prev,
      action_count: prev.action_count == null ? 1 : Number(prev.action_count) + 1,
      last_acted_at: new Date(),
    }))
  }

  const handleSave = () => {
    setModalMessage("Do you want to continue with this registration?")
    setConfirmHandler(async () => {
      //const validationErrors = validateTask(task)
      // if (0 < Object.keys(validationErrors).length) {
      //   setMessage("Validation Error!")
      //   setMessageType("error")
      //   setErrors(validationErrors)
      //   return
      // }
      let updateAlbumKey = ''
      if (task.action_count && originalTask.action_count < task.action_count) updateAlbumKey = task.album_id ?? ''
      const result = await mergeMusicTask(task, updateAlbumKey)
      setTask(result)
      setOriginalTask(result)
      setMessage("Saved Successfully!")
      setMessageType("info")
    })
    setIsModalOpen(true)
  }

  const checkLogin = async () => {
    await checkUser()
  }

  useEffect(() => {
    checkLogin()
    const loadTask = async () => {
      if (inTaskSubId) {
        const fetchData = await fetchMusicTask(inTaskSubId)
        setTask(fetchData)
        setOriginalTask(fetchData)
      } else {
        setTask(prev => ({
          ...prev,
          artist_id: inArtistId,
          artist_name: inArtistName,
          album_id: inAlbumId,
          album_name: inAlbumName,
        }))
        setOriginalTask(prev => ({
          ...prev,
          artist_id: inArtistId,
          artist_name: inArtistName,
          album_id: inAlbumId,
          album_name: inAlbumName,
        }))
      }
    }
    loadTask()

    const handler = (e: WindowEventMap['keydown']) => {
      if (e.ctrlKey && e.altKey && e.key === 'd') {
        setHiddenPanelOpen((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler);
  }, [inTaskSubId, inArtistId, inArtistName, inAlbumId, inAlbumName])

  return (
    <div className="root-panel">
      <MessageBanner
          message={message}
          type={messageType}
          errors={errors}
          onClose={() => setMessage('')} />
      <Breadcrumb
          edited={isMusicTaskEdited(originalTask, task)} />
      <h2 className="header-title">Task Form (Music)</h2>
      <p className="timestamp">
        {task.task_sub_id ? "last updated at: " + formatDateTime(task.updated_at, 'yyyy/MM/dd HH:mm') + " (" + task.updated_count + ")" : '(Not registered)'}
      </p>
      <div>
        <div className="div-input-row">
          <label htmlFor="task_type" className="input-label">Task Type</label>
          <select
              id="task_sub_type"
              name="task_sub_type"
              className="w-48"
              value={task.task_sub_type ?? ""}
              onChange={(e) => handleChange(e)}>
            <option key="" value=""></option>
            {Object.entries(CodeMusicTaskType)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
            ))}
          </select>
        </div>
        <div className="div-input-row">
          <label htmlFor="task_status" className="input-label">Status</label>
          <select
              id="task_status"
              name="task_status"
              className="w-48"
              value={task.task_status ?? ""}
              onChange={(e) => handleChange(e)}>
            {Object.entries(CodeTaskStatus)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
            ))}
          </select>
        </div>
        <div className="div-input-row">
          <label htmlFor="task_priority" className="input-label">Priority</label>
          <input
              type="number"
              id="task_priority"
              name="task_priority"
              className="numeric-field w-24"
              value={task.task_priority ?? ""}
              onChange={handleChange} />
        </div>
        <div className="div-input-row">
          <label htmlFor="artist_name" className="input-label">Artist</label>
          <input
              type="text"
              id="artist_name"
              name="artist_name"
              className="w-full sm:w-160"
              value={task.artist_name ?? ""}
              onChange={(e) => handleChange(e)}/>
        </div>
        <div className="div-input-row">
          <label htmlFor="album_name" className="input-label">Album</label>
          <input
              type="text"
              id="album_name"
              name="album_name"
              className="w-full sm:w-160"
              value={task.album_name ?? ""}
              onChange={(e) => handleChange(e)}/>
        </div>
        <div className="div-input-row hidden sm:block">
          <label htmlFor="action_count" className="input-label">Acted</label>
          <div className="div-row-left">
            <button
                className="button-plus"
                onClick={handlePlus} >
              <Plus />
            </button>
            <input
                type="number"
                id="action_count"
                name="action_count"
                className="numeric-field w-16 sm:w-24"
                value={task.action_count ?? ""}
                onChange={handleChange} />
            <PartialDateInput
                name="last_acted_at"
                value={formatDateTime(task.last_acted_at, "yyyy-MM-dd")}
                onChange={handleChangeDate} />
            <span>{formatDateTime(task.last_acted_at, "HH:mm")}</span>
          </div>
        </div>
        <div className="div-input-row block sm:hidden">
          <label htmlFor="action_count" className="input-label">Acted</label>
          <div className="div-row-left">
            <button
                className="button-plus"
                onClick={handlePlus} >
              <Plus />
            </button>
            <input
                type="number"
                id="action_count"
                name="action_count"
                className="numeric-field w-16 sm:w-24"
                value={task.action_count ?? ""}
                onChange={handleChange} />
          </div>
        </div>
        <div className="div-input-row block sm:hidden">
          <div className="div-row-left">
            <span className="w-7"></span>
            <PartialDateInput
                name="last_acted_at"
                value={formatDateTime(task.last_acted_at, "yyyy-MM-dd")}
                onChange={handleChangeDate} />
            <span>{formatDateTime(task.last_acted_at, "HH:mm")}</span>
          </div>
        </div>
        <div className="div-input-row">
          <div className="input-form-full">
            <label htmlFor="task_comment">Comment</label>
            <textarea id="task_comment"
                name="task_comment"
                rows={3}
                value={task.task_comment ?? ''}
                onChange={handleChange} >
            </textarea>
          </div>
        </div>
      </div>
      <div className="footer-area">
        <div className="footer-area-sub">
          <div className="footer-left">
            <button className="button-back"
                onClick={() => handleBack(isMusicTaskEdited(originalTask, task))}>
              <ArrowLeft size={16} />
            </button>
          </div>
          <div className="footer-right">
            <button className="button-save"
                disabled={!isMusicTaskEdited(originalTask, task)}
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
            originalTask:
            <br /> {JSON.stringify(originalTask)}
            <br />
            task:
            <br /> {JSON.stringify(task)}
          </>
        }
      />
    </div>
  )
}
