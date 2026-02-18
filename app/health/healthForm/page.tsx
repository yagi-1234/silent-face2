'use client'

import { Suspense, useEffect, useState } from 'react'
import { ArrowLeft, Check, Plus } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

import { fetchWeight, mergeWeight } from '@/actions/health/health-action'
import { Breadcrumb } from '@/components/Breadcrumb'
import ConfirmModal from '@/components/ConfirmModal'
import HiddenPanel from '@/components/HiddenPanel'
import MessageBanner from '@/components/MessageBanner'
import PartialDateInput from '@/components/PartialDateInput'
import { useConfirmModal } from '@/contexts/ConfirmModalContext'
import { useMessage } from '@/contexts/MessageContext'
import { checkUser } from '@/contexts/RooterContext'
import { WeightView, initialWeight } from '@/types/health/health-types'
import { formatDateTime } from '@/utils/dateFormat'
import { useCustomBack } from '@/utils/navigationUtils'

const Page = () => {
  return (
    <Suspense fallback={<div>Loading artist list...</div>}>
      <DailyHealth />
    </Suspense>
  )
}
export default Page

const DailyHealth = () => {

  const { setIsModalOpen, setModalMessage, setConfirmHandler } = useConfirmModal()
  const { handleBack } = useCustomBack()
  const { message, setMessage, messageType, setMessageType, errors } = useMessage()
  const searchParams = useSearchParams()
  const [hiddenPanelOpen, setHiddenPanelOpen] = useState(false)

  const [weight, setWeight] = useState<WeightView>(initialWeight)

  const inWeightId = searchParams.get('weight_id') ?? ''

  const checkLogin = async () => {
    await checkUser()
  }

  const loadData = async () => {
    if (inWeightId) {
      const fetchData = await fetchWeight(inWeightId)
      setWeight(fetchData)
    }
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setWeight(prev => ({
      ...prev,
      [name]: value
    }))
  }
  const handleChangeDate = (value: string, name: string) => {
    setWeight(prev => ({
      ...prev, [name]: value
    }))
  }
  const handleSave = () => {
    setModalMessage('Do you want to continue with this registration?')
    setConfirmHandler(async () => {
      //const validationErrors = validateWeight(weight)
      // if (0 < Object.keys(validationErrors).length) {
      //   setMessage('Validation Error!')
      //   setMessageType('error')
      //   setErrors(validationErrors)
      //   return
      // }

      const result = await mergeWeight(weight)
      setWeight(result)
      // setOriginalTrack(result)
      setMessage('Saved Successfully!')
      setMessageType('info')
    })
    setIsModalOpen(true)
  }

  useEffect(() => {
    checkLogin()
    loadData()
    const handler = (e: WindowEventMap["keydown"]) => {
      if (e.ctrlKey && e.altKey && e.key === 'd')
        setHiddenPanelOpen(prev => !prev)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <div className="root-panel">
      <Breadcrumb />
      <h2 className="header-title">Daily Health</h2>
      <MessageBanner
          message={message}
          type={messageType}
          errors={errors}
          onClose={() => setMessage('')} />
      <div>
        <div className="div-input-row">
          <label htmlFor="date" className="input-label">Date</label>
          <PartialDateInput
              name="weight_date"
              value={formatDateTime(weight.weight_date, "yyyy-MM-dd")}
              onChange={handleChangeDate} />
        </div>
        <div className="div-input-row">
          <label htmlFor="weight" className="input-label">Weight</label>
          <input type="text"
              id="weight"
              name="weight"
              className="numeric-field w-24"
              value={weight.weight ?? ''}
              onChange={handleChange} />
          <span>kg</span>
        </div>
        <div className="div-input-row">
          <label htmlFor="bfp" className="input-label">Body Fat Percentage</label>
          <input type="text"
              id="bfp"
              name="bfp"
              className="numeric-field w-24"
              value={weight.bfp ?? ''}
              onChange={handleChange} />
          <span>%</span>
        </div>
        <div className="div-input-row">
          <label htmlFor="muscle_mass" className="input-label">Muscle Mass</label>
          <input type="text"
              id="muscle_mass"
              name="muscle_mass"
              className="numeric-field w-24"
              value={weight.muscle_mass ?? ''}
              onChange={handleChange} />
          <span>kg</span>
        </div>
        <div className="div-input-row">
          <label htmlFor="vfl" className="input-label">Visceral Fat Level</label>
          <input type="text"
              id="vfl"
              name="vfl"
              className="numeric-field w-24"
              value={weight.vfl ?? ''}
              onChange={handleChange} />
        </div>
        <div className="div-input-row">
          <label htmlFor="bmr" className="input-label">Basal Metabolic Rate</label>
          <input type="text"
              id="bmr"
              name="bmr"
              className="numeric-field w-24"
              value={weight.bmr ?? ''}
              onChange={handleChange} />
          <span>kcal</span>
        </div>
        <div className="div-input-row">
          <label htmlFor="body_age" className="input-label">Body Age</label>
          <input type="text"
              id="body_age"
              name="body_age"
              className="numeric-field w-24"
              value={weight.body_age ?? ''}
              onChange={handleChange} />
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
          <div className="footer-right">
            <button className="button-save"
                onClick={handleSave}>
              {weight.weight_id ? (
                <Check size={16} />
              ) : (
                <Plus size={16} />
              )}
            </button>
          </div>
        </div>
      </div>
      <ConfirmModal />
      <HiddenPanel
          isOpen={hiddenPanelOpen}
          content={
              <>
                weight:<br /> {JSON.stringify(weight)}<br />
              </>
          } />
    </div>
  )
}
