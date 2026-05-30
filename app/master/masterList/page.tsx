'use client'

import { Suspense, useEffect, useState } from 'react'
import { ArrowLeft, Check, CirclePlus, Plus } from 'lucide-react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'

import { fetchCodeNames, fetchCodes, insertCode, updateCode } from '@/actions/master/master-action'
import { Breadcrumb } from '@/components/Breadcrumb'
import ConfirmModal from '@/components/ConfirmModal'
import HiddenPanel from '@/components/HiddenPanel'
import { useHistory } from '@/contexts/HistoryContext'
import MessageBanner from '@/components/MessageBanner'
import { ToggleButton } from '@/components/ToggleButton'
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { useConfirmModal } from '@/contexts/ConfirmModalContext'
import { useMessage } from '@/contexts/MessageContext'
import { checkUser } from '@/contexts/RooterContext'
import { CodeView, initialCode, TaskTypeView, initialTaskType } from '@/types/master/master-types'
import { formatDateTime } from '@/utils/dateFormat'
import { useCustomBack } from '@/utils/navigationUtils'
import { ellipsis, isEllipsed } from '@/utils/viewUtils'

const Page = () => {
  return (
    <Suspense fallback={<div>Loading release list...</div>}>
      <MasterList />
    </Suspense>
  )
}
export default Page

const MasterList = () => {

  const { setIsModalOpen, setModalMessage, setConfirmHandler } = useConfirmModal()
  const { handleBack } = useCustomBack()

  const [selectedCode, setSelectedCode] = useState<string>('')
  const [codeNames, setCodeNames] = useState<string[]>([])
  const [codes, setCodes] = useState<CodeView[]>([])
  const [newCode, setNewCode] = useState<CodeView>(initialCode)
  const [taskTypes, setTaskTypes] = useState<TaskTypeView[]>([])
  const [newTaskType, setNewTaskType] = useState<TaskTypeView>(initialTaskType)

  const checkLogin = async () => {
    await checkUser()
  }

  const loadCodeNames = async () => {
    const result = await fetchCodeNames()
    setCodeNames(result)
  }
  const loadData = async (codeName: string) => {
    const fetchData = await fetchCodes(codeName)
    setCodes(fetchData)
  }
  const handleSelectCode = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value
    setSelectedCode(value)
    await loadData(value)
  }
  const handleChange = (codeKey: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const { type, name, value, checked } = event.target
    setCodes(prev =>
      prev.map(row =>
        row.code_key === codeKey ? {
          ...row,
          [name]: type === 'checkbox' ? (checked ? '1' : null) : value,
          edited: 'u'
        } : row
      )
    )
  }
  const handleChangeNew = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { type, name, value } = event.target
    setNewCode(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }))
  }
  const handlePlus = async () => {
    setModalMessage('Do you want to continue with this registration?')
    setConfirmHandler(async () => {
      const newData = {
        ...newCode,
        code_name: selectedCode,
      }
      await insertCode(newData)
      await loadData(selectedCode)
      setNewCode(initialCode)
    })
    setIsModalOpen(true)
  }
  const handleSave = async (code: CodeView) => {
    setModalMessage('Do you want to continue with this registration?')
    setConfirmHandler(async () => {
      const result = await updateCode(code)
      setCodes(prev =>
        prev.map(row =>
          row.code_key === code.code_key ? result : row
        )
      )
    })
    setIsModalOpen(true)
  }

  useEffect(() => {
    checkLogin()
    loadCodeNames()
  }, [])

  return (
    <div className="root-panel">
      <Breadcrumb />
      <h2 className="header-title">Master List</h2>
      <div className="div-input-row">
        <span>
          <select
              id="code_names"
              name="code_names"
              className="w-48"
              value={selectedCode}
              onChange={handleSelectCode}>
            <option key="" value=""></option>
            {codeNames.map(row => (
              <option key={row} value={row}>{row}</option>
            ))}
          </select>
        </span>
      </div>
      <div className="border-t divide-y w-168">
        {codes.map(code => (
          <div key={code.code_key}
              className="div-rows-flexible">
            <div className="div-row-flexible">
              <span className="w-16">{code.code_key}</span>
              <span className="w-64">
                <input type="text"
                    id="code_value"
                    name="code_value"
                    className="w-full"
                    value={code.code_value ?? ""}
                    onChange={(event) => handleChange(code.code_key ?? "", event)} />
              </span>
              <span className="w-32">
                <input type="text"
                    id="code_value_short"
                    name="code_value_short"
                    className="w-full"
                    value={code.code_value_short ?? ""}
                    onChange={(event) => handleChange(code.code_key ?? "", event)} />
              </span>
              <span className="w-16 numeric-field">{code.code_order}</span>
              <span className="w-16 flex justify-center">
                <label className="input-check-label">
                  <input type="checkbox"
                      name="deleted"
                      checked={code.deleted ? true : false}
                      onChange={(event) => handleChange(code.code_key ?? "", event)} />
                </label>
              </span>
              <span className="w-12">
                {code.edited ? (
                <button className="bg-blue-600 text-white flex items-center justify-center rounded-sm w-8 h-6">
                    <Check className="h-4 w-4"
                        onClick={() => handleSave(code)} />
                  </button>
                ) : null}
              </span>
            </div>
          </div>
        ))}
        {selectedCode ? (
          <div className="div-rows-flexible">
            <div className="div-row-flexible">
              <span className="w-16">
                <input type="text"
                    id="code_key"
                    name="code_key"
                    className="w-full"
                    value={newCode.code_key ?? ""}
                    onChange={handleChangeNew} />
              </span>
              <span className="w-64">
                <input type="text"
                    id="code_value"
                    name="code_value"
                    className="w-full"
                    value={newCode.code_value ?? ""}
                    onChange={handleChangeNew} />
              </span>
              <span className="w-32">
                <input type="text"
                    id="code_value_short"
                    name="code_value_short"
                    className="w-full"
                    value={newCode.code_value_short ?? ""}
                    onChange={handleChangeNew} />
              </span>
              <span className="w-16">
                <input type="text"
                    id="code_order"
                    name="code_order"
                    className="w-full numeric-field"
                    value={newCode.code_order ?? ""}
                    onChange={handleChangeNew} />
              </span>
              <span className="w-12" />
              <span className="w-16 flex justify-center">
                {newCode.code_key ? (
                  <button className="bg-blue-600 text-white flex items-center justify-center rounded-sm w-8 h-6">
                    <Plus className="h-4 w-4"
                        onClick={handlePlus} />
                  </button>
                ) : null}
              </span>
            </div>
          </div>
        ) : null}
      </div>
      <div className="footer-area">
        <div className="footer-area-sub">
          <div className="footer-left">
            <button className="button-back"
                onClick={() => handleBack(false)}>
              <ArrowLeft size={16} />
            </button>
          </div>
        </div>
      </div>
      <ConfirmModal />
    </div>
  )
}
