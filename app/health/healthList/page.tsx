'use client'

import { Suspense, useEffect, useState } from 'react'
import { ArrowLeft, Plus, Search, Weight } from 'lucide-react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'

import { fetchWeights } from '@/actions/health/health-action'
import { Breadcrumb } from '@/components/Breadcrumb'
import PartialDateInput from '@/components/PartialDateInput'
import { useHistory } from '@/contexts/HistoryContext'
import { checkUser } from '@/contexts/RooterContext'
import { WeightView, WeightCondition, initialWeightCondition } from '@/types/health/health-types'
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
  const [condition, setCondition] = useState<WeightCondition>(initialWeightCondition)

  const checkLogin = async () => {
    await checkUser()
  }

  const loadData = async (condition1: WeightCondition) => {
    const fetchData = await fetchWeights(condition1)
    setWeights(fetchData)
  }

  const handleChangeDate = (value: string) => {
    const fromDate = new Date(new Date(value).getFullYear(), new Date(value).getMonth(), 1)
    const toDate = new Date(fromDate.getFullYear(), fromDate.getMonth() + 1, 0)
    setCondition(prev => ({
      ...prev,
      weight_date_from: fromDate,
      weight_date_to: toDate
    }))
  }

  const handleSearch = async () => {
    const fetchData = await fetchWeights(condition)
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
    const condition1 = {
      ...initialWeightCondition,
      weight_date_from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      weight_date_to: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
    }
    setCondition(condition1)
    loadData(condition1)
  }, [])

  return (
    <div className="root-panel">
      <Breadcrumb />
      <h2 className="header-title">Health List</h2>
      <div>
        <div className="hidden sm:block">
        </div>
        <div className="block sm:hidden">
          <div>
            <div className="flex justify-between items-center">
              <div>
                <PartialDateInput
                    name="weight_date_from"
                    value={formatDateTime(condition.weight_date_from, 'yyyy/MM/dd') ?? ''}
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