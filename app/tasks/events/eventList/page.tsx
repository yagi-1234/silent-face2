'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { ArrowLeft, Briefcase, CalendarDays, EyeClosed, PawPrint, FileText, Flower2, HeartPlus, List, MicVocal, Plus, ShoppingCart } from 'lucide-react'

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

  const [events, setEvents] = useState<EventItem[]>([])
  const [isListView, setIsListView] = useState<boolean>(false)
  const [selectMonth, setSelectMonth] = useState<Date>(new Date(new Date().getFullYear(), new Date().getMonth(), 1))
  const [hiddenNumber, setHiddenNumber] = useState<string>("")
  const calendarRef = useRef<FullCalendar | null>(null)

  const inEventType = searchParams.get('event_type') ?? ''

  const handleShowForm = (eventType: string, eventId: string) => {
    console.log(eventType)
    addToHistory({ title: 'trackList', path: `${pathname}?${searchParams.toString()}`})
    if (eventType === '01') router.push(`/music/lives/liveTrackList?event_id=${eventId}`)
    else router.push(`/tasks/events/eventForm?event_id=${eventId}`)
  }

  const handleChangeView = (isList: boolean) => {
    const query = new URLSearchParams()
    if (inEventType) query.append('event_type', inEventType)
    if (isList) query.append('is_list_view', 'true')
    router.push(`/tasks/events/eventList?${query.toString()}`)
    setIsListView(isList)
  }
  
  const handleEventClick = (info: EventClickArg) => {
    const query = new URLSearchParams()
    query.append('selectMonth', formatDateTime(selectMonth, 'yyyy-MM-dd'))
    const nowPath = `/tasks/events/eventList?${query.toString()}`
    addToHistory({ title: 'eventCalendar', path: nowPath})
    const eventType = events.filter(row => row.event_id === info.event.id).at(0)?.event_type
    if (eventType === '01') router.push(`/music/lives/liveTrackList?event_id=${info.event.id}`)
    else router.push(`/tasks/events/eventForm?event_id=${info.event.id}`)
  }

  const loadEvents = async () => {
    const result = await fetchEvents(inEventType)
    setEvents(result)
  }

  const checkLogin = async () => {
    await checkUser()
  }

  const calendarEvents = events.map(event => {
    if (event.event_type === '23' && hiddenNumber !== '423') return null
// 赤	bg-red-400	#f87171
// 青	bg-blue-400	#60a5fa
// 緑	bg-green-500	#22c55e
// 紫	bg-purple-400	#c084fc
// ピンク	bg-pink-400	#f472b6
// オレンジ	bg-orange-400	#fb923c
// 黄色	bg-yellow-400	#fde047
// ティール	bg-teal-500	#14b8a6
// シアン	bg-cyan-500	#06b6d4
// グレー	bg-gray-300	#9ca3af
    let color = '#9ca3af'
    if (event.event_type === '01') color = '#f87171'
    if (event.event_type === '03') color = '#60a5fa'
    if (event.event_type === '04') color = '#fde047'
    if (event.event_type === '05') color = '#fb923c'
    if (event.event_type === '06') color = '#f472b6'
    if (event.event_type === '08') color = '#c084fc'
    return {
      id: event.event_id,
      title: event.event_name + 
          (event.start_time ? ' ' + event.start_time : '') + 
          (event.location ? '@' + event.location : ''),
      start: event.start_at,
      backgroundColor: color
    }
  }).filter((e): e is NonNullable<typeof e> => e !== null)

  const getEventTypeIcon = (eventType: string) => {
    if (eventType === '01') return <div className="border bg-red-400 text-white"><MicVocal size={16} /></div>
    if (eventType === '03') return <div className="border bg-yellow-400 text-white"><ShoppingCart size={16} /></div>
    if (eventType === '04') return <div className="border bg-blue-400 text-white"><Flower2 size={16} /></div>
    if (eventType === '05') return <div className="border bg-orange-400 text-white"><PawPrint size={16} /></div>
    if (eventType === '06') return <div className="border bg-pink-400 text-white"><HeartPlus size={16} /></div>
    if (eventType === '08') return <div className="border bg-purple-400 text-white"><Briefcase size={16} /></div>
    if (eventType === '23') return <div className="border bg-gray-400 text-white"><EyeClosed size={16} /></div>
  }

  const handleCalendarMove = (move: number) => {
    setSelectMonth(new Date(selectMonth.getFullYear(), selectMonth.getMonth() + move, 1))
  }

  useEffect(() => {
    checkLogin()
    if (searchParams.get('selectMonth')) {
      setSelectMonth(new Date(searchParams.get('selectMonth') ?? '2019-01-01'))
      calendarRef.current?.getApi().gotoDate(searchParams.get('selectMonth') ?? '2019-01-01')
    }
    setIsListView(searchParams.get('is_list_view') === 'true' ? true : false)
    
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
      <h2 className="header-title">{"Event" + (inEventType === "01" ? " (Live)" : "")}</h2>
      <div className="block sm:hidden">
        <div>
          <div className="fc fc-direction-ltr">
            <div className="fc-header-toolbar fc-toolbar">
              <h2 className="fc-toolbar-title">{formatDateTime(selectMonth, "MMM yyyy")}</h2>
              <div>
                <button
                    className="fc-button fc-button-primary"
                    onClick={() => setSelectMonth(new Date(new Date().getFullYear(), new Date().getMonth(), 1))}>
                  today
                </button>
                <div className="fc-button-group">
                  <button
                      className="fc-button fc-button-primary"
                      onClick={() => setSelectMonth(new Date(selectMonth.getFullYear(), selectMonth.getMonth() - 1, 1))}>
                    <span className="fc-icon fc-icon-chevron-left" />
                  </button>
                  <button className="fc-button fc-button-primary"
                      onClick={() => setSelectMonth(new Date(selectMonth.getFullYear(), selectMonth.getMonth() + 1, 1))}>
                    <span className="fc-icon fc-icon-chevron-right" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-1">
          {events.filter(e => new Date(e.start_at) >= new Date(selectMonth) && new Date(e.start_at) < new Date(selectMonth.getFullYear(), selectMonth.getMonth() + 1, 1)).map(event => (
            <div className="border rounded-sm p-1 shadow-sm flex items-center" key={event.event_id}>
              <span className="font-bold w-14">{formatDateTime(event.start_at, "MM/dd EEE")}</span>
              {getEventTypeIcon(event.event_type)}
              <span>&ensp;</span>
              <button
                  className="button-link card-title"
                  onClick={() => handleShowForm(event.event_type, event.event_id ?? "")}>
                {event.event_name}
              </button>
            </div>
          ))}
        </div>
      </div>
      <div className="hidden sm:block">
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
                          onClick={() => handleShowForm(event.event_type, event.event_id ?? "")} >
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
              initialDate={formatDateTime(selectMonth, "yyyy-MM-dd")}
              datesSet={info => {
                const tmpDate = new Date(new Date(info.startStr))
                tmpDate.setDate(tmpDate.getDate() + 7)
                setSelectMonth(new Date(tmpDate.getFullYear(), tmpDate.getMonth(), 1))
              }}
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
              ref={calendarRef}
              aspectRatio={1.2} />
        }
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
            <input type="text"
                className="w-16 border-gray-100"
                value={hiddenNumber ?? ""}
                onChange={(e) => setHiddenNumber(e.target.value)} />
            <div className="hidden sm:block">
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
            </div>
            <button className="button-save"
                onClick={() => handleShowForm(inEventType, "")}>
              <Plus size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}