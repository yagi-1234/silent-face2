'use client'

import { Suspense, useEffect, useState } from 'react'
import { ArrowLeft, Check, Clock9, Clock2, Clock7, Coffee, IceCreamCone, Lollipop } from 'lucide-react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'

import { fetchEatings, mergeEating } from '@/actions/health/eating-action'
import { Breadcrumb } from '@/components/Breadcrumb'
import ConfirmModal from '@/components/ConfirmModal'
import HiddenPanel from '@/components/HiddenPanel'
import { useHistory } from '@/contexts/HistoryContext'
import MessageBanner from '@/components/MessageBanner'
import { useConfirmModal } from '@/contexts/ConfirmModalContext'
import { useMessage } from '@/contexts/MessageContext'
import { checkUser } from '@/contexts/RooterContext'
import { EatingView, initialEating } from '@/types/health/eating-types'
import { formatDateTime } from '@/utils/dateFormat'
import { useCustomBack } from '@/utils/navigationUtils'

const Page = () => {
  return (
    <Suspense fallback={<div>Loading eating_list...</div>}>
      <EatingList />
    </Suspense>
  )
}
export default Page

const EatingList = () => {

  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const { setIsModalOpen, setModalMessage, setConfirmHandler } = useConfirmModal()
  const { message, setMessage, messageType, setMessageType, errors } = useMessage()
  const [hiddenPanelOpen, setHiddenPanelOpen] = useState(false)
  const { addToHistory } = useHistory()
  const { handleBack } = useCustomBack()
  const isMobile = window.innerWidth < 640

  const [eatings, setEatings] = useState<EatingView[]>([])
  const today = formatDateTime(new Date(), 'yyyy-MM-dd')

  const handleChange = (eatingDate: string, event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target
    setEatings(prev =>
      prev.map(row =>
        formatDateTime(row.eating_date,'yyyy-MM-dd') === eatingDate ? {
           ...row,
           [name]: (event.target.type === 'number' ? Number(value) : value),
           is_edit: true
        } : row
      )
    )
  }
  const handleSave = async (newData: EatingView) => {
    setModalMessage('Do you want to continue with this registration?')
    setConfirmHandler(async () => {
      await mergeEating(newData)
      await loadData()
    })
    setIsModalOpen(true)
  }

  const checkLogin = async () => {
    await checkUser()
  }
  const loadData = async () => {
    const fetchData = await fetchEatings()
    setEatings(fetchData)
  }
  useEffect(() => {
    checkLogin()
    loadData()
  }, [])

  return (
    <div className="root-panel">
      <Breadcrumb />
      <h2 className="header-title">Eating List</h2>
      <MessageBanner
          message={message}
          type={messageType}
          errors={errors}
          onClose={() => setMessage('')} />
      <div className="border-y divide-y md:w-200">
        {eatings.map((eating, index) => (
          <div key={eating.work_date?.toString()}
            className={formatDateTime(eating.work_date,'yyyy-MM-dd') === today ?
                "flex flex-col md:flex-row gap-1 border-b py-1 bg-yellow-50" :
                "flex flex-col md:flex-row gap-1 border-b py-1"}>
            <div className="flex items-center gap-x-2 flex-wrap">
              <span className="font-bold w-12 sm:w-24">{isMobile ? formatDateTime(eating.work_date,"MM/dd") : formatDateTime(eating.work_date,"yyyy/MM/dd")}</span>
              <Clock9 className="h-4 w-4" />
              <span>
                <select
                    id="breakfast_score"
                    name="breakfast_score"
                    className="w-16 h-7"
                    value={eating.breakfast_score ?? ''}
                    onChange={(event) => handleChange(formatDateTime(eating.work_date,'yyyy-MM-dd'), event)}>
                  <option key="" value=""></option>
                  <option key="5" value="5">5</option>
                  <option key="4" value="4">4</option>
                  <option key="3" value="3">3</option>
                  <option key="2" value="2">2</option>
                  <option key="1" value="1">1</option>
                </select>
              </span>
              <span className="w-32">
                <input type="text"
                    id="breakfast"
                    name="breakfast"
                    className="w-full"
                    value={eating.breakfast ?? ""}
                    onChange={(event) => handleChange(formatDateTime(eating.work_date,'yyyy-MM-dd'), event)} />
              </span>
              <div className="w-full md:hidden"></div>
              <span className="font-bold w-12 md:hidden">{isMobile ? formatDateTime(eating.work_date,"EEE") : null}</span>
              <Clock9 className="h-4 w-4" />
              <span>
                <select
                    id="lunch_score"
                    name="lunch_score"
                    className="w-16"
                    value={eating.lunch_score ?? ""}
                    onChange={(event) => handleChange(formatDateTime(eating.work_date,'yyyy-MM-dd'), event)}>
                  <option key="" value=""></option>
                  <option key="5" value="5">5</option>
                  <option key="4" value="4">4</option>
                  <option key="3" value="3">3</option>
                  <option key="2" value="2">2</option>
                  <option key="1" value="1">1</option>
                </select>
              </span>
              <span className="w-32">
                <input type="text"
                    id="lunch"
                    name="lunch"
                    className="w-full"
                    value={eating.lunch ?? ""}
                    onChange={(event) => handleChange(formatDateTime(eating.work_date,'yyyy-MM-dd'), event)} />
              </span>
              <div className="w-full md:hidden"></div>
              <span className="w-12 md:hidden">
                {eating.is_edit ? (
                  <button className="bg-blue-600 text-white flex items-center justify-center rounded-sm w-10 h-6">
                    <Check className="h-4 w-4"
                        onClick={() => handleSave(eating)} />
                  </button>
                ) : null}
              </span>
              <Clock7 className="h-4 w-4" />
              <span>
                <select
                    id="dinner_score"
                    name="dinner_score"
                    className="w-16"
                    value={eating.dinner_score ?? ""}
                    onChange={(event) => handleChange(formatDateTime(eating.work_date,'yyyy-MM-dd'), event)}>
                  <option key="" value=""></option>
                  <option key="5" value="5">5</option>
                  <option key="4" value="4">4</option>
                  <option key="3" value="3">3</option>
                  <option key="2" value="2">2</option>
                  <option key="1" value="1">1</option>
                </select>
              </span>
              <span className="w-32">
                <input type="text"
                    id="dinner"
                    name="dinner"
                    className="w-full"
                    value={eating.dinner ?? ""}
                    onChange={(event) => handleChange(formatDateTime(eating.work_date,'yyyy-MM-dd'), event)} />
              </span>
              <div className="w-full"></div>
              <span className="font-bold w-12 sm:w-10">{isMobile ? null : formatDateTime(eating.work_date,"EEE")}</span>
              <span className="w-12 hidden sm:inline">
                {eating.is_edit ? (
                  <button className="bg-blue-600 text-white flex items-center justify-center rounded-sm w-10 h-6">
                    <Check className="h-4 w-4"
                        onClick={() => handleSave(eating)} />
                  </button>
                ) : null}
              </span>
              <Coffee className="h-4 w-4" />
              <span>
                <select
                    id="others_score"
                    name="others_score"
                    className="w-16"
                    value={eating.others_score ?? ""}
                    onChange={(event) => handleChange(formatDateTime(eating.work_date,'yyyy-MM-dd'), event)}>
                  <option key="" value=""></option>
                  <option key="5" value="5">5</option>
                  <option key="4" value="4">4</option>
                  <option key="3" value="3">3</option>
                  <option key="2" value="2">2</option>
                  <option key="1" value="1">1</option>
                </select>
              </span>
              <span className="w-32">
                <input type="text"
                    id="othres"
                    name="othres"
                    className="w-full"
                    value={eating.othres ?? ""}
                    onChange={(event) => handleChange(formatDateTime(eating.work_date,'yyyy-MM-dd'), event)} />
              </span>
              <div className="w-full md:hidden"></div>
              <span className="w-12 md:hidden" />
              <Lollipop className="h-4 w-4" />
              <span className="w-16 sm:mr-34">
                <input type="number"
                    id="snacks"
                    name="snacks"
                    className="w-full numeric-field"
                    value={eating.snacks ?? ""}
                    onChange={(event) => handleChange(formatDateTime(eating.work_date,'yyyy-MM-dd'), event)} />
              </span>
              <IceCreamCone className="h-4 w-4" />
              <span className="w-16">
                <input type="number"
                    id="deserts"
                    name="deserts"
                    className="w-full numeric-field"
                    value={eating.deserts ?? ""}
                    onChange={(event) => handleChange(formatDateTime(eating.work_date,'yyyy-MM-dd'), event)} />
              </span>
              <span className="font-semibold">
                {eating.eating_id && ((eating.breakfast_score ?? 0) *5) + ((eating.lunch_score ?? 0) * 5) + ((eating.dinner_score ?? 0) * 5) + ((eating.others_score ?? 0) * 5)
                    + ((eating.snacks ?? 0) * -10) + ((eating.deserts ?? 0) * -10)}
              </span>
              </div>
          </div>
        ))}
      </div>
      <div className="footer-area">
        <div className="footer-area-sub">
          <div className="footer-left">
            <button className="button-back"
                onClick={() => handleBack(true)}>
              <ArrowLeft size={16} />
            </button>
          </div>
        </div>
      </div>
      <ConfirmModal />
    </div>
  )
}
