'use client'

import { Suspense, useEffect, useState } from 'react'
import { ArrowLeft, Check, Pencil } from 'lucide-react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'

import { fetchMasters, mergeMaster } from '@/actions/master/master-action'
import { Breadcrumb } from '@/components/Breadcrumb'
import ConfirmModal from '@/components/ConfirmModal'
import HiddenPanel from '@/components/HiddenPanel'
import { useHistory } from '@/contexts/HistoryContext'
import MessageBanner from '@/components/MessageBanner'
import { ToggleButton } from '@/components/ToggleButton'
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { useMessage } from '@/contexts/MessageContext'
import { checkUser } from '@/contexts/RooterContext'
import { TaskTypeView, initialTaskType } from '@/types/master/master-types'
import { formatDateTime } from '@/utils/dateFormat'
import { useCustomBack } from '@/utils/navigationUtils'
import { ellipsis, isEllipsed } from '@/utils/viewUtils'
import { isTaskEdited } from '@/actions/tasks/task-action'

const Page = () => {
  return (
    <Suspense fallback={<div>Loading release list...</div>}>
      <MasterList />
    </Suspense>
  )
}
export default Page

const MasterList = () => {

  const [taskTypes, setTaskTypes] = useState<TaskTypeView[]>([])
  const [newTaskType, setNewTaskType] = useState<TaskTypeView>(initialTaskType)

  const checkLogin = async () => {
    await checkUser()
  }

  const loadData = async () => {
    const fetchData = await fetchMasters<TaskTypeView>('cm01_task_types')
    setTaskTypes(fetchData)
  }

  const handleEdit = (taskType: TaskTypeView) => {
    setNewTaskType(taskType)
    setTaskTypes(prev =>
      prev.map(row =>
        row.task_type === taskType.task_type && row.task_sub_type === taskType.task_sub_type ? {
          ...row, is_edit: true
        } : row
      )
    )
  }

  const handleSave = async () => {
    const result = await mergeMaster(newTaskType)
    setTaskTypes(prev =>
      prev.map(row =>
        row.task_type === result.task_type ? result : row
      )
    )
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setNewTaskType(prev => ({
      ...prev,
      [name]: value ? value : null
    }))
  }

  useEffect(() => {
    checkLogin()
    loadData()
  }, [])

  return (
    <div className="root-panel">
      <Breadcrumb />
      <h2 className="header-title">Master List</h2>
      <div className="border-y divide-y">
        {taskTypes.map(taskType => (
          <div key={(taskType.task_type ?? "") + taskType.task_sub_type} className="p-2">
            <div className="grid grid-cols-[64px_240px_1fr]">
              <div>{(taskType.task_type ?? "") + taskType.task_sub_type}</div>
              {taskType.is_edit ? (
                <div>
                  <input type="text"
                      name="task_type_name"
                      className="w-36"
                      value={newTaskType.task_type_name ?? ""} 
                      onChange={handleChange} />
                </div>
              ) : (
                <div>{taskType.task_type_name}</div>
              )}
              <div>
                {taskType.is_edit ? (
                  <button
                      className="button-page"
                      onClick={() => handleSave()} >
                    <Check size={14} />
                  </button>
                ) : (
                  <button
                      className="button-page"
                      onClick={() => handleEdit(taskType)} >
                    <Pencil size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
//grid grid-cols-2 gap-4 p-2"
// rounded-lg border p-3 shadow-sm