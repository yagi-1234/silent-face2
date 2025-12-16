'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { ArrowLeft, CalendarDays, FileText, List, Plus } from 'lucide-react'

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
import { CodeEventType } from '@/utils/codeUtils'
import { formatDateTime, formatDateVariousTime } from '@/utils/dateFormat'
import { useCustomBack } from '@/utils/navigationUtils'

import { TaskCondition, initialTaskCondition } from '@/types/tasks/task-types'
import type { EventItem } from '@/types/tasks/event-types'
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

  const [events, setEvents] = useState<EventItem[]>([])
  const [isListView, setIsListView] = useState<boolean>(false)

  const handleShowForm = (eventId: string) => {
    addToHistory({ title: 'eventCalendar', path: `${pathname}?is_list_view=${isListView}`})
    router.push(`/tasks/events/eventForm?event_id=${eventId}`)
  }

  const handleChangeView = (isList: boolean) => {
    setIsListView(isList)
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
    console.log(searchParams.get('is_list_view'))
    setIsListView(searchParams.get('is_list_view') === 'true' ? true : false)
    loadEvents()
  }, [])

  const calendarEvents = events.map(event => {
    const colorBlue = '#60a5fa'
    const colorGreen = '#4ade80'
    const colorYellow = '#facc15'
    const colorRed = '#f87171'
    const colorPurple = '#c084fc'
    const colorGray = '#9ca3af'
    let color = colorGray
    if (event.event_type === '01') color = colorRed
    if (event.event_type === '03') color = colorBlue
    if (event.event_type === '04') color = colorBlue
    if (event.event_type === '08') color = colorPurple
    return {
      id: event.event_id,
      title: event.event_name + 
          (event.start_time ? ' ' + event.start_time : '') + 
          (event.location ? '@' + event.location : ''),
      start: event.start_at,
      backgroundColor: color
    }
  })

  return (
    <div className="root-panel">
      <MessageBanner
          message={message}
          type={messageType}
          errors={errors}
          onClose={() => setMessage('')} />
      <Breadcrumb />
      <h2 className="header-title">Event</h2>
      {isListView &&
        <>
          <div className="searchPanel">
          </div>
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Event Name</th>
                <th>Location</th>
                <th>Start At</th>
                <th />
                <th />
              </tr>
            </thead>
            <tbody>
              {events.map(event => (
                <tr key={event.event_id} className="leading-none">
                  <td>{CodeEventType[event.event_type]}</td>
                  <td>{event.event_name}</td>
                  <td>{event.location}</td>
                  <td>{formatDateTime(event.start_at, "yyyy/MM/dd")}</td>
                  <td>{event.start_time}</td>
                  <td>
                    <button
                        className="button-page"
                        onClick={() => handleShowForm(event.event_id ?? "")} >
                      <FileText className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      }
      {!isListView &&
        <FullCalendar
            plugins={[dayGridPlugin]}
            initialView="dayGridMonth"
            events={calendarEvents}
            eventClick={handleEventClick}
            eventContent={(arg) => (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="truncate">
                      {arg.event.title}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    {arg.event.title}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            height="auto"
            aspectRatio={1.2} />
      }
      <div className="footer-area">
        <div className="footer-area-sub">
          <div className="footer-left">
            <button className="button-back"
                onClick={() => handleBack(false)}>
              <ArrowLeft size={16} />
            </button>
          </div>
          <div className="footer-right">
            {isListView &&
              <button className="button-second"
                  onClick={() => handleChangeView(false)}>
                <CalendarDays size={16} />
              </button>
            }
            {!isListView &&
              <button className="button-second"
                  onClick={() => handleChangeView(true)}>
                <List size={16} />
              </button>
            }
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