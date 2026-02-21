'use client'

import { Suspense, useEffect, useState } from 'react'
import { ArrowLeft, Plus, Weight } from 'lucide-react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'

import { fetchWeights } from '@/actions/health/health-action'
import { Breadcrumb } from '@/components/Breadcrumb'
import { useHistory } from '@/contexts/HistoryContext'
import { checkUser } from '@/contexts/RooterContext'
import { WeightView } from '@/types/health/health-types'
import { formatDateTime } from '@/utils/dateFormat'
import { useCustomBack } from '@/utils/navigationUtils'

const Page = () => {
  return (
    <Suspense fallback={<div>Loading health list...</div>}>
      <HealthList />
    </Suspense>
  )
}
export default Page

const HealthList = () => {

  const { handleBack } = useCustomBack()
  const router = useRouter()
  const { addToHistory } = useHistory()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [weights, setWeights] = useState<WeightView[]>([])

  const checkLogin = async () => {
    await checkUser()
  }

  const loadData = async () => {
    const fetchData = await fetchWeights()
    setWeights(fetchData)
  }

  const handleShowForm = (weightId: string) => {
    addToHistory({ title: 'healthList', path: `${pathname}?${searchParams.toString()}`})
    if (weightId) router.push(`/health/healthForm?weight_id=${weightId}`)
    else router.push(`/health/healthForm`)
  }

  const handlePlus = () => {
    addToHistory({ title: 'healthList', path: `${pathname}?${searchParams.toString()}`})
    router.push(`/health/healthForm`)
  }

  useEffect(() => {
    checkLogin()
    loadData()
  }, [])

  return (
    <div className="root-panel">
      <Breadcrumb />
      <h2 className="header-title">Health List</h2>
      <div>
        <div className="hidden sm:block">

        </div>
        <div className="block sm:hidden">
          <div className="div-card-area">
            {weights.map(weight => (
              <div key={weight.weight_id} className="div-card">
                <div className="div-card-row card-title">
                  <button
                      className="button-link"
                      onClick={() => handleShowForm(weight.weight_id ?? '')}>
                    {formatDateTime(weight.weight_date, "yyyy/MM/dd")}
                  </button>
                </div>
                <div className="div-card-row card-title">
                  <Weight size={14} />
                  {weight.weight}<span>kg</span>
                </div>
                <div className="div-card-row">
                  <div className="mr-2">
                    <span>BFP：</span>{weight.bfp}<span>%</span>
                  </div>
                  <div className="mr-2">
                    <span>Muscle：</span>{weight.muscle_mass}<span>kg</span>
                  </div>
                  <div>
                    <span>VFL：</span>{weight.vfl}
                  </div>
                </div>
              </div>
            ))}
          </div>
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
                onClick={handlePlus}>
              <Plus size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}