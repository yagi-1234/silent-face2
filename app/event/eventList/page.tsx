'use client'

import { Suspense, useEffect, useState } from 'react'
import { ArrowLeft, CalendarDays, List, Plus } from 'lucide-react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'

import { fetchEvents2 } from '@/actions/tasks/event-action'
import { Breadcrumb } from '@/components/Breadcrumb'
import CustomCalendar from '@/components/CustomCalendar'
import MessageBanner from '@/components/MessageBanner'
import { useHistory } from '@/contexts/HistoryContext'
import { useMessage } from '@/contexts/MessageContext'
import { checkUser } from '@/contexts/RooterContext'
import { EventItem, eventCondition, initialEventCondition } from '@/types/tasks/event-types'
import { formatDateTime } from '@/utils/dateFormat'
import { useCustomBack } from '@/utils/navigationUtils'

const Page = () => {
  return (
    <Suspense fallback={<div>Loading event list...</div>}>
      <EventList />
    </Suspense>
  )
}

export default Page

const EventList = () => {

  const { handleBack } = useCustomBack()
  const { addToHistory } = useHistory()
  const { message, setMessage, messageType, setMessageType, errors } = useMessage()
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date(new Date().getFullYear(), new Date().getMonth(), 1))
  const [events, setEvents] = useState<EventItem[]>([])
  const [isListView, setIsListView] = useState<boolean>(false)

  const inEventType = searchParams.get('event_type') ?? ''

  const handleShowForm = (eventType: string, eventId: string) => {
    const query = new URLSearchParams()
    query.append('selectMonth', formatDateTime(selectedMonth, 'yyyy-MM-dd'))
    const url = `/event/eventList?${query.toString()}`
    addToHistory({ title: 'eventCalendar', path: url})
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

  const checkLogin = async () => {
    await checkUser()
  }

  const loadEvents = async (month: Date) => {
    const result = await fetchEvents2('', formatDateTime(month, 'yyyy-MM-dd'))
    setEvents(result)
  }

  useEffect(() => {
    checkLogin()

    let month
    if (searchParams.get('selectMonth')) {
      month = new Date(searchParams.get('selectMonth') ?? '')
      setSelectedMonth(month)
    }
    loadEvents(month ? month : selectedMonth)
  }, [])
  useEffect(() => {
    loadEvents(selectedMonth)
  }, [selectedMonth])
  
  return (
    <div className="root-panel">
      <MessageBanner
          message={message}
          type={messageType}
          errors={errors}
          onClose={() => setMessage('')} />
      <Breadcrumb />
      <h2 className="header-title">{"Events" + (inEventType === "01" ? " (Live)" : "")}</h2>
      <p>{formatDateTime(selectedMonth, 'yyyy-MM-dd')}</p>
      <div className="mx-auto max-w-6xl p-4">
        <CustomCalendar
            events={events}
            selectedMonth={selectedMonth}
            onSelectMonth={setSelectedMonth}
            onShowForm={handleShowForm} />
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
            {/* <input type="text"
                className="w-16 border-gray-100"
                value={hiddenNumber ?? ""}
                onChange={(e) => setHiddenNumber(e.target.value)} /> */}
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
          </div>
        </div>
      </div>
    </div>
  )
}
