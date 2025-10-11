'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { ArrowLeft, Check } from 'lucide-react'

import { fetchEvent, mergeEvent } from '@/actions/tasks/event-action'
import { Breadcrumb } from '@/components/Breadcrumb'
import ConfirmModal from '@/components/ConfirmModal'
import HiddenPanel from '@/components/HiddenPanel'
import MessageBanner from '@/components/MessageBanner'
import PartialDateInput from '@/components/PartialDateInput'
import { useConfirmModal } from '@/contexts/ConfirmModalContext'
import { useMessage } from '@/contexts/MessageContext'
import { checkUser } from '@/contexts/RooterContext'
import { CodeEventType, CodePriorityType } from '@/utils/codeUtils'
import { formatDateTime } from '@/utils/dateFormat'
import { useCustomBack } from '@/utils/navigationUtils'
import { EventItem, initialEventItem } from '@/types/tasks/event-types'

const Page = () => {
  return (
    <Suspense fallback={<div>Loading event form...</div>}>
      <EventForm />
    </Suspense>
  )
}
export default Page

const EventForm = () => {

  const { handleBack } = useCustomBack()
  const { setIsModalOpen, setModalMessage, setConfirmHandler } = useConfirmModal()
  const { message, setMessage, messageType, setMessageType, errors } = useMessage()
  const searchParams = useSearchParams()
  const inEventId = searchParams.get('event_id') ?? ''

  const [event, setEvent] = useState<EventItem>(initialEventItem)
  const [originalEvent, setOriginalEvent] = useState<EventItem>(initialEventItem)
  const [hiddenPanelOpen, setHiddenPanelOpen] = useState(false)

  const loadEvent = async () => {
    if (inEventId) {
      const fetchData = await fetchEvent(inEventId)
      setEvent(fetchData)
      setOriginalEvent(fetchData)
    }
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target
    setEvent(prev => ({
      ...prev, [name]: value
    }))
  }
  const handleChangeDate = (value: string, name: string) => {
    setEvent(prev => ({
      ...prev, [name]: value
    }))
  }

  const handleSave = () => {
    setModalMessage('Do you want to continue with this registration?')
    setConfirmHandler(async () => {
      const result = await mergeEvent(event)
      setEvent(result)
      setOriginalEvent(event)
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
    loadEvent()
  }, [])

  return (
    <div className="root-panel">
      <MessageBanner
          message={message}
          type={messageType}
          errors={errors}
          onClose={() => setMessage('')} />
      <Breadcrumb />
      <h2 className="header-title">Event Form</h2>
      <p className="timestamp">{event.event_id ? "last updated at: " + formatDateTime(event.updated_at, 'yyyy/MM/dd HH:mm') + " (" + event.updated_count + ")" : '(Not registered)'}</p>
      <div className="input-form">
        <label htmlFor="event_type">Event Type</label>
        <select
            id="event_type"
            name="event_type"
            className="w-48"
            value={event.event_type}
            onChange={(e) => handleChange(e)}>
          <option value=""></option>
          {Object.entries(CodeEventType).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <div className="input-form">
        <label htmlFor="event_name">Event Name</label>
        <input type="text"
            id="event_name"
            name="event_name"
            value={event.event_name ?? ''}
            onChange={handleChange} />
      </div>
      <div className="input-form">
        <label htmlFor="event_name_2"></label>
        <input type="text"
            id="event_name_2"
            name="event_name_2"
            value={event.event_name_2 ?? ''}
            onChange={handleChange} />
      </div>
      <div className="input-form">
        <label htmlFor="start_at">Start</label>
        <PartialDateInput
            name="start_at"
            value={formatDateTime(event.start_at,'yyyy/MM/dd') ?? ''}
            onChange={handleChangeDate}
            mode="flexible" />
      </div>
      <div className="input-form">
        <label htmlFor="priority">Priority</label>
        <select
            id="priority"
            name="priority"
            className="w-48"
            value={event.priority}
            onChange={(e) => handleChange(e)}>
          <option value=""></option>
          {Object.entries(CodePriorityType).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <div className="input-form-full">
        <label htmlFor="event_comment">Comment</label>
        <textarea id="event_comment"
            name="event_comment"
            rows={3}
            value={event.event_comment ?? ''}
            onChange={handleChange} >
        </textarea>
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
              </>
          } />
    </div>
  )
}
