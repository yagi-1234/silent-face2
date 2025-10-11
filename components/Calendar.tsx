'use client'

import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import { useRouter } from 'next/navigation'

export default function Calendar() {
  const router = useRouter()

  return (
    <FullCalendar
      plugins={[dayGridPlugin, interactionPlugin]}
      initialView="dayGridMonth"
      height="auto"
      dateClick={(info) => {
        // 日付クリック時に遷移（例: /calendar/2025-08-01）
        router.push(`/calendar/${info.dateStr}`)
      }}
      events={[
        // 表示するイベントの例
        { title: '予定1', date: '2025-08-19', url: '/events/1' },
        { title: '予定2', date: '2025-08-25', url: '/events/2' },
      ]}
    />
  )
}
