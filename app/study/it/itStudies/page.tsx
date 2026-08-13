'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Check, ChevronsUp, OctagonX, Plus, Search } from 'lucide-react'

import { fetchItDic, fetchItDics, fetchItDicsCount, mergeItDic } from '@/actions/study/study-action'
import { checkUser } from '@/contexts/RooterContext'
import { Breadcrumb } from '@/components/Breadcrumb'
import Modal from '@/components/Modal'
import PagingControl from '@/components/PagingControl'
import { ItDicsView, initialItDics, ItDicCondition, initialItDicCondition } from '@/types/study/study-types'
import { useCustomBack } from '@/utils/navigationUtils'

const Page = () => {
  return (
    <Suspense fallback={<div>Loading it studies...</div>}>
      <ItStudies />
    </Suspense>
  )
}
export default Page

const ItStudies = () => {

  const router = useRouter()
  const { handleBack } = useCustomBack()

  const [itDics, setItDics] = useState<ItDicsView[]>([])
  const [condition, setCondition] = useState<ItDicCondition>(initialItDicCondition)
  const [showFormModal, setShowFormModal] = useState(false)
  const [paramDicsId, setParamDicsId] = useState<string | null>(null)
  const [currentPageNo, setCurrentPageNo] = useState<number>(0)
  const [totalPages, setTotalPages] = useState<number>(0)

  const checkLogin = async () => {
    await checkUser()
  }
  const loadData = async (condition1: ItDicCondition, pageNo: number) => {
    const fetchData = await fetchItDics(condition1, pageNo)
    setItDics(fetchData)
  }
  const loadDataCount = async (condition1: ItDicCondition) => {
    const fetchCount = await fetchItDicsCount(condition1)
    setTotalPages(Math.floor(fetchCount / 20) + 1)
  }

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setCondition(prev => ({ ...prev, [name]: value }))
  }
  const handleSearch = async () => {
    setCurrentPageNo(0)
    await loadDataCount(condition)
    await loadData(condition, 0)
  }
  const handleClear = async () => {
    setCondition(initialItDicCondition)
  }
  const handleShowFormModal = (discId: string | null) => {
    setShowFormModal(true)
    setParamDicsId(discId)
  }
  const handleSaved = async (outDiscsId: string) => {
    const result = await fetchItDic(outDiscsId || '')
    await loadData(condition, currentPageNo)
    setShowFormModal(false)
  }
  const handleSelectPage = async (pageNo: number) => {
    setCurrentPageNo(pageNo)
    await loadData(condition, pageNo)
  }
  
  useEffect(() => {
    checkLogin()
    loadDataCount(condition)
    loadData(condition, 0)
  }, [])

  return (
    <div className="root-panel">
      <Breadcrumb />
      <h2 className="header-title">IT Studies</h2>
      <div className="block sm:hidden">
        <div>
          <div className="div-input-row">
            <label htmlFor="word" className="input-label">Word</label>
            <input type="text"
                id="word"
                name="word"
                className="w-full"
                value={condition.word ?? ''}
                onKeyDown={(e) => { if (e.key === "Enter") handleSearch() }}
                onChange={handleSearchChange} />
          </div>
          <div className="div-input-row">
            <label htmlFor="word_category" className="input-label">Word Category</label>
            <input type="text"
                id="word_category"
                name="word_category"
                className="w-full"
                value={condition.word_category ?? ''}
                onKeyDown={(e) => { if (e.key === "Enter") handleSearch() }}
                onChange={handleSearchChange} />
          </div>
          <div className="div-row-right">
            <button className="button-normal"
                onClick={handleClear}>
              <OctagonX size={16} />
            </button>
            <button className="button-search"
                onClick={handleSearch}>
              <Search size={16} />
            </button>
          </div>
        </div>
        <div className="border-t divide-y">
          {itDics.map((dics) => (
            <div key={dics.dics_id} className="flex flex-col gap-1 border-b py-1">
              <div className="flex justify-between">
                <span>
                  <button className="button-link"
                      onClick={() => handleShowFormModal(dics.dics_id)}>
                    {dics.word}
                  </button>
                </span>
                <span>
                  <button>
                    <ChevronsUp size={16} />
                  </button>
                </span>
              </div>
              <div className="div-row-flexible">
                <span>{dics.explanation}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="hidden sm:block">
        <div className="div-input-row">
          <label htmlFor="word" className="input-label">Word</label>
          <input type="text"
              id="word"
              name="word"
              className="w-120"
              value={condition.word ?? ''}
              onKeyDown={(e) => { if (e.key === "Enter") handleSearch() }}
              onChange={handleSearchChange} />
        </div>
        <div className="flex justify-between items-center">
          <div className="div-input-row">
            <label htmlFor="word_category" className="input-label">Word Category</label>
            <input type="text"
                id="word_category"
                name="word_category"
                className="w-120"
                value={condition.word_category ?? ''}
                onKeyDown={(e) => { if (e.key === "Enter") handleSearch() }}
                onChange={handleSearchChange} />
          </div>
          <div>
            <div className="div-row-right">
              <button className="button-normal"
                  onClick={handleClear}>
                <OctagonX size={16} />
              </button>
              <button className="button-search"
                  onClick={handleSearch}>
                <Search size={16} />
              </button>
            </div>
          </div>
        </div>
        <div className="border-t divide-y w-240">
          {itDics.map((dics) => (
            <div key={dics.dics_id} className="div-rows-flexible">
              <div className="div-row-flexible">
                <span className="w-32">
                  <button className="button-link"
                      onClick={() => handleShowFormModal(dics.dics_id)}>
                    {dics.word}
                  </button>
                </span>
                <span className="w-24">{dics.word_category_1}</span>
                <span className="w-24">{dics.word_category_2}</span>
                <span className="w-24">{dics.word_category_3}</span>
                <span className="w-24">{dics.word_type}</span>
                <span className="w-96">{dics.explanation}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="footer-area">
        <PagingControl
            totalPages={totalPages}
            currentPageNo={currentPageNo}
            onSelectPage={(pageNo) => handleSelectPage(pageNo)} />
        <div className="footer-area-sub">
          <div className="footer-left">
            <button className="button-back"
                onClick={() => handleBack(false)}>
              <ArrowLeft size={16} />
            </button>
          </div>
          <div className="footer-right">
            <button className="button-save"
                onClick={() => handleShowFormModal(null)}>
              <Plus size={16} />
            </button>
          </div>
        </div>
      </div>
      {showFormModal && (
        <Modal onClose={() => setShowFormModal(false)}>
          <ItStudyForm 
              inDicsId={paramDicsId}
              onSave={handleSaved} />
        </Modal>
      )}
    </div>
  )
}

interface Props {
  inDicsId: string | null
  onSave: (outDiscsId: string) => void
}

export function ItStudyForm({ inDicsId, onSave }: Props) {

  const [itDics, setItDics] = useState<ItDicsView>(initialItDics)

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target
    setItDics((prev) => ({ ...prev, [name]: value }))
  }
  const handleSave = async () => {
    const dicsId = await mergeItDic(itDics)
    onSave(dicsId)
  }

  const loadData = async () => {
    const fetchData = await fetchItDic(inDicsId ?? '')
    setItDics(fetchData)
  }

  useEffect(() => {
    if (inDicsId) loadData()
  }, [])

  return (
    <div className="w-168">
      <div className="div-input-row">
        <label htmlFor="word" className="input-label">Word</label>
        <input type="text"
            id="word"
            name="word"
            className="w-120"
            value={itDics.word ?? ''}
            onChange={handleChange} />
      </div>
      <div className="div-input-row mb-0">
        <label htmlFor="word_category_1" className="input-label">Word Category 1</label>
        <input type="text"
            id="word_category_1"
            name="word_category_1"
            className="w-80"
            value={itDics.word_category_1 ?? ''}
            onChange={handleChange} />
      </div>
      <div className="div-input-row mb-0">
        <input type="text"
            id="word_category_2"
            name="word_category_2"
            className="w-80"
            value={itDics.word_category_2 ?? ''} 
            onChange={handleChange} />
      </div>
      <div className="div-input-row">
        <input type="text"
            id="word_category_3"
            name="word_category_3"
            className="w-80"
            value={itDics.word_category_3 ?? ''}
            onChange={handleChange} />
      </div>
      <div className="div-input-row">
        <label htmlFor="word_type" className="input-label">Word Type</label>
        <input type="text"
            id="word_type"
            name="word_type"
            className="w-80"
            value={itDics.word_type ?? ''}
            onChange={handleChange} />
      </div>
      <div className="div-input-row">
        <label htmlFor="explanation" className="input-label">Explanation</label>
        <textarea id="explanation"
            name="explanation"
            rows={8}
            value={itDics.explanation ?? ""}
            onChange={handleChange} />
      </div>
      <div className="flex justify-end items-center">
        <button className="button-save" onClick={handleSave}>
          <Check size={16}/>
        </button>
      </div>
    </div>
  )
}
