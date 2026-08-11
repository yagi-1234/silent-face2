'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import { ArrowLeft, Plus, Search } from 'lucide-react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'

import { fetchExercises } from '@/actions/health/exercise-action'
import { Breadcrumb } from '@/components/Breadcrumb'
import ConfirmModal from '@/components/ConfirmModal'
import HiddenPanel from '@/components/HiddenPanel'
import { useHistory } from '@/contexts/HistoryContext'
import MessageBanner from '@/components/MessageBanner'
import Modal from '@/components/Modal'
import { ExerciseForm } from '@/components/form/ExerciseForm'
import { useConfirmModal } from '@/contexts/ConfirmModalContext'
import PartialDateInput from '@/components/PartialDateInput'
import { useCodes } from '@/contexts/MasterContext'
import { useMessage } from '@/contexts/MessageContext'
import { checkUser } from '@/contexts/RooterContext'
import { ExerciseView, ExerciseCondition, initialExerciseCondition } from '@/types/health/exercise-types'
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

  const codes = useCodes('ExerciseType')
  const { setIsModalOpen, setModalMessage, setConfirmHandler } = useConfirmModal()
  const { message, setMessage, messageType, setMessageType, errors } = useMessage()
  const [hiddenPanelOpen, setHiddenPanelOpen] = useState(false)
  const { addToHistory } = useHistory()
  const { handleBack } = useCustomBack()
  const isMobile = window.innerWidth < 640
  const today = formatDateTime(new Date(), 'yyyy-MM-dd')

  const [exercises, setExercises] = useState<ExerciseView[]>([])
  const [condition, setCondition] = useState<ExerciseCondition>(initialExerciseCondition)
  const [showForm, setShowForm] = useState("")

  const handleChangeDate = (value: string) => {
    const fromDate = new Date(new Date(value).getFullYear(), new Date(value).getMonth(), 1)
    const toDate = new Date(fromDate.getFullYear(), fromDate.getMonth() + 1, 0)
    setCondition(prev => ({
      ...prev,
      exercise_date_from: fromDate,
      exercise_date_to: toDate
    }))
  }

  const handleShowForm = (exerciseId: string) => {
    setShowForm(exerciseId)
  }

  const handlePlus = () => {
    setShowForm('new')
  }

  const handleSearch = async () => {
    const fetchData = await fetchExercises(condition)
    setExercises(fetchData)
  }

  const handleSaved = async (exerciseId: string) => {
    const fetchData = await fetchExercises(condition)
    setExercises(fetchData)
    setShowForm('')
  }

  const checkLogin = async () => {
    await checkUser()
  }
  const loadData = async (condition1: ExerciseCondition) => {
    const fetchData = await fetchExercises(condition1)
    setExercises(fetchData)
  }
  useEffect(() => {
    checkLogin()
    const condition1 = {
      ...initialExerciseCondition,
      exercise_date_from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      exercise_date_to: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
    }
    setCondition(condition1)
    loadData(condition1)
  }, [])
  const grouped = useMemo(() => {
    return exercises.reduce((acc, exercise) => {
      (acc[formatDateTime(exercise.work_date, 'yyyy-MM-dd')] ??= []).push(exercise)
      return acc
    }, {} as Record<string, ExerciseView[]>)
  }, [exercises])

  return (
    <div className="root-panel">
      <Breadcrumb />
      <h2 className="header-title">Exercises</h2>
      <MessageBanner
          message={message}
          type={messageType}
          errors={errors}
          onClose={() => setMessage('')} />
      <div className="md:w-200">
        <div>
          <div className="flex justify-between items-center">
            <div>
              <PartialDateInput
                  name="exercise_date_from"
                  value={formatDateTime(condition.exercise_date_from, 'yyyy/MM/dd') ?? ''}
                  onChange={handleChangeDate}
                  mode="flexible"
                  scope="ym" />
            </div>
            <div className="div-row-right">
              <button className="button-search"
                  onClick={handleSearch}>
                  <Search size={16} />
              </button>
            </div>
          </div>
        </div>
        {Object.entries(grouped).map(([workDate, items]) => (
          <div key={workDate} 
              className={workDate === today ? "border-b py-1 bg-yellow-50" : "border-b py-1"}>
            {items.map(exercise => (
              <div key={exercise.exercise_id} className="flex items-center">
                <span className="font-bold w-12 sm:w-24">
                    {exercise.rownumber === 1 ? formatDateTime(workDate, 'MM/dd') : null}
                </span>
                <span className="w-36">
                  <button className="button-link"
                      onClick={() => handleShowForm(exercise.exercise_id ?? "")}>
                    {codes.find(code => code.code_key === exercise.exercise_content)?.code_value}
                  </button>
                </span>
                <span className="w-12">{exercise.exercise_length ? `${exercise.exercise_length} m` : null}</span>
                <span className="w-28">{exercise.exercise_place}</span>
              </div>
            ))}
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
          <div className="footer-right">
            <button className="button-save"
                onClick={handlePlus}>
              <Plus size={16} />
            </button>
          </div>
        </div>
      </div>
      <ConfirmModal />
      {showForm && (
        <Modal onClose={() => setShowForm("")}>
          <ExerciseForm 
              exerciseId={showForm}
              onSave={handleSaved} />
        </Modal>
      )}
    </div>
  )
}
