'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { ArrowLeft, Plus, FileText, CircleCheckBig, Info, Search } from 'lucide-react'

import { fetchEvents } from '@/actions/tasks/event-action'
import { Breadcrumb } from '@/components/Breadcrumb'
import ConfirmModal from '@/components/ConfirmModal'
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import MessageBanner from '@/components/MessageBanner'
import { useConfirmModal } from '@/contexts/ConfirmModalContext'
import { useHistory } from '@/contexts/HistoryContext'
import { useMessage } from '@/contexts/MessageContext'
import { checkUser } from '@/contexts/RooterContext'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import Calendar from '@/components/Calendar'

import { CodeTaskStatus, CodeTaskType, CodeScheduleType, CodePriorityType } from '@/utils/codeUtils'
import { formatDateTime } from '@/utils/dateFormat'
import { useCustomBack } from '@/utils/navigationUtils'
import { Task, TaskCondition, initialTaskCondition } from '@/types/tasks/task-types'
import { ellipsis } from '@/utils/viewUtils'
import type { CalendarEvent} from '@/types/tasks/event-types'
import { EventClickArg } from '@fullcalendar/core'

const Page = () => {
  return (
    <Suspense fallback={<div>Loading event list...</div>}>
      <EventList />
    </Suspense>
  )
}

export default Page

const EventList = () => {

  const { setIsModalOpen, setModalMessage, setConfirmHandler } = useConfirmModal()
  const { handleBack } = useCustomBack()
  const { addToHistory } = useHistory()
  const { message, setMessage, messageType, setMessageType, errors } = useMessage()
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [condition, setCondition] = useState<TaskCondition>(initialTaskCondition)

  const [events, setEvents] = useState<CalendarEvent[]>([])
  //'https://fullcalendar.io/api/demo-feeds/events.json'

  const handleShowForm = (eventId: string) => {
    addToHistory({ title: 'eventCalendar', path: `${pathname}?${searchParams.toString()}`})
    router.push('/tasks/events/eventForm')
  }

  const handleEventClick = (info: EventClickArg) => {
    const eventId = info.event.id
    addToHistory({ title: 'eventCalendar', path: `${pathname}?${searchParams.toString()}`})
    router.push(`/tasks/events/eventForm?event_id=${eventId}`)
  }

  const loadEvents = async () => {
    const result = await fetchEvents()
    setEvents(result)
  }

  const checkLogin = async () => {
    await checkUser()
  }

  useEffect(() => {
    checkLogin()
    loadEvents()
  }, [])

  return (
    <div className="root-panel">
      <MessageBanner
          message={message}
          type={messageType}
          errors={errors}
          onClose={() => setMessage('')} />
      <Breadcrumb />
      <h2 className="header-title">Event</h2>
      <FullCalendar
          plugins={[dayGridPlugin]}
          initialView="dayGridMonth"
          events={events}
          eventClick={handleEventClick}
          height='600px'
      />
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
                onClick={() => handleShowForm("")}>
              <Plus size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}