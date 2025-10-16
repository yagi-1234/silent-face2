'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { ArrowLeft, Plus, FileText, CircleCheckBig, Info, Search } from 'lucide-react'

import { fetchTasks, updateLastActedAt, updateTaskStatus } from '@/actions/tasks/task-action'
import { Breadcrumb } from '@/components/Breadcrumb'
import ConfirmModal from '@/components/ConfirmModal'
import { LogoffButton } from '@/components/LogoffButton'
import MessageBanner from '@/components/MessageBanner'
import HiddenPanel from '@/components/HiddenPanel'
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { useConfirmModal } from '@/contexts/ConfirmModalContext'
import { useHistory } from '@/contexts/HistoryContext'
import { useMessage } from '@/contexts/MessageContext'
import { checkUser } from '@/contexts/RooterContext'
import { CodeTaskStatus, CodeTaskType, CodeScheduleType, CodePriorityType } from '@/utils/codeUtils'
import { formatDateTime } from '@/utils/dateFormat'
import { useCustomBack } from '@/utils/navigationUtils'
import { Task, TaskCondition, initialTaskCondition } from '@/types/tasks/task-types'
import { ellipsis } from '@/utils/viewUtils'

const Page = () => {
  return (
    <Suspense fallback={<div>Loading task list...</div>}>
      <TaskList />
    </Suspense>
  )
}
export default Page

const TaskList = () => {

  const { setIsModalOpen, setModalMessage, setConfirmHandler } = useConfirmModal()
  const { handleBack } = useCustomBack()
  const { addToHistory } = useHistory()
  const { message, setMessage, messageType, setMessageType, errors } = useMessage()
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [tasks, setTasks] = useState<Task[]>([])
  const [condition, setCondition] = useState<TaskCondition>(initialTaskCondition)
  const [hiddenPanelOpen, setHiddenPanelOpen] = useState(false)

  const handleSearch = async () => {
    const query = new URLSearchParams()
    if (condition.task_status_list.length > 0) query.append('task_status_list', condition.task_status_list.join(','))
    if (condition.task_type) query.append('task_type', condition.task_type)
    router.push(`/tasks/tasks/taskList?${query.toString()}`)
    const fetchData = await fetchTasks(condition)
    setTasks(fetchData)
  }

  const handleShowForm = (taskId: string) => {
    addToHistory({ title: 'taskList', path: `${pathname}?${searchParams.toString()}`})
    if (taskId) router.push(`/tasks/tasks/taskForm?task_id=${taskId}`)
    else router.push("/tasks/tasks/taskForm")
  }

  const handleStatusChange = (taskId: string, taskStatus: string) => {
    setModalMessage('Are you sure you want to change Status?')
    setConfirmHandler(async () => {
      const result = await updateTaskStatus(taskId, taskStatus)
      setTasks(prev => prev.map(t => t.task_id === result.task_id ? result : t))
      setMessage('Saved Successfully!')
      setMessageType('info')
      loadList()
    })
    setIsModalOpen(true)
  }

  const handleDoneAction = (taskId: string) => {
    setModalMessage('Are you sure you want to mark this as completed?')
    setConfirmHandler(async () => {
      const result = await updateLastActedAt(taskId)
      setTasks(prev => prev.map(t => t.task_id === result.task_id ? result : t))
      setMessage('Saved Successfully!')
      setMessageType('info')
    })
    setIsModalOpen(true)
  }

  const getInputClassName = (scheduleType: string, taskStatus: string, nextDate: Date | null, limitDate: Date | null) => {
    let className = ''

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const nextDate2 = nextDate ? new Date(nextDate) : null
    nextDate2?.setHours(0, 0, 0, 0)
    const limiteDate2 = limitDate ? new Date(limitDate) : null
    limiteDate2?.setHours(0, 0, 0, 0)

    if (taskStatus === '9') {
      className += 'bg-gray-300'
    }

    if (limiteDate2 && today > limiteDate2)
      className += ' text-red-600'

    if (scheduleType && scheduleType === '1' && (taskStatus === '0' || taskStatus === '1'))
      if (nextDate2 && today > nextDate2)
        className += ' bg-green-100'
    if (scheduleType && scheduleType === '2')
      if (nextDate2 && today > nextDate2)
        className += ' bg-green-100'

    return className
  }

  const loadList = async () => {
    const result = await fetchTasks(condition)
    setTasks(result)
  }

  const checkLogin = async () => {
    await checkUser()
  }

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = event.target;
    console.log('a')
    setCondition(prev => ({
      ...prev, [name]: value
    }))
  }

  useEffect(() => {
    checkLogin()

    if ([...searchParams.keys()].length !== 0) {
      const taskStatusList = searchParams.get('task_status_list')
      console.log('searchParams', searchParams)
      console.log('taskStatusList', taskStatusList)
      const condition1 = {
        ...condition,
        task_type: searchParams.get('task_type') ?? '',
        task_status_list: taskStatusList ? taskStatusList.split(',') : [],
      }
      setCondition(condition1)
    }
    loadList()

    const handler = (e: WindowEventMap['keydown']) => {
      if (e.ctrlKey && e.altKey && e.key === 'd') {
        setHiddenPanelOpen((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler);
  }, [])

  return (
    <div className="root-panel">
      <MessageBanner
          message={message}
          type={messageType}
          errors={errors}
          onClose={() => setMessage('')} />
      <div className="flex justify-between">
        <Breadcrumb />
        <LogoffButton />
      </div>
      <h2 className="header-title">Task List</h2>
      <div className="searchPanel">
        <div className="input-form">
          <label htmlFor="task_type">Type</label>
          <select
              id="task_type"
              name="task_type"
              className="w-48"
              value={condition.task_type}
              onChange={(e) => handleChange(e)}>
            <option key="" value=""></option>
            {Object.entries(CodeTaskType)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
            ))}
          </select>
        </div>
        <div className="input-form">
          <label htmlFor="task_status">Task Status</label>
          {Object.entries(CodeTaskStatus)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([key, label]) => (
                <label key={key} className="input-check-label">
                  <input type="checkbox"
                      className=""
                      value={key}
                      checked={condition?.task_status_list.includes(key)}
                      onChange={(e) => {
                        setCondition(prev => ({
                          ...prev,
                          task_status_list: e.target.checked ? [...prev.task_status_list, key] : prev.task_status_list.filter(status => status !== key)
                        }))
                      }}
                  />
                  <span>{label}</span>
                </label>
          ))}
          <button className="button-search"
              onClick={handleSearch}>
            <Search size={16} />
          </button>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>Status</th>
            <th>Type</th>
            <th>Cycle</th>
            <th>Name</th>
            <th>Priority</th>
            <th>Schedule Type</th>
            <th>Progess</th>
            <th>Action count</th>
            <th>First Acted</th>
            <th>Last Acted</th>
            <th>Next Date</th>
            <th>Limit Date</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr key={task.task_id} className={getInputClassName(task.schedule_type, task.task_status, task.next_date, task.limit_date)}>
              <td>
                <select
                    value={task.task_status}
                    onChange={(e) => handleStatusChange(task.task_id, e.target.value) }>
                  {Object.entries(CodeTaskStatus).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </td>
              <td>{CodeTaskType[task.task_type] ?? ""}</td>
              <td>{task.task_cycle}</td>
              <td>{ellipsis(task.task_name, 24)}</td>
              <td>{CodePriorityType[task.priority]}</td>
              <td>{CodeScheduleType[task.schedule_type]}</td>
              <td className="numeric-field">{task.task_progress}</td>
              <td className="numeric-field">{task.action_count}</td>
              <td>{formatDateTime(task.first_acted_at, "yyyy/MM/dd")}</td>
              <td>{formatDateTime(task.last_acted_at, "yyyy/MM/dd")}</td>
              <td>{formatDateTime(task.next_date, "yyyy/MM/dd")}</td>
              <td>{formatDateTime(task.limit_date, "yyyy/MM/dd")}</td>
              <td className="flex items-center gap-1">
                <button className="bg-gray-100 text-green-700 flex items-center justify-center w-10 p-2"
                    onClick={() => handleDoneAction(task.task_id)} >
                  <CircleCheckBig className="w-5 h-5" />
                </button>
                <button
                    className="button-page"
                    onClick={() => handleShowForm(task.task_id)} >
                  <FileText className="w-5 h-5" />
                </button>
                {task.task_comment && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className="p-2 hover:bg-gray-100">
                          <Info className="w-5 h-5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="bg-blue-500 text-white text-base px-2 py-1">
                        <p>{task.task_comment}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
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
                onClick={() => handleShowForm("")}>
              <Plus size={16} />
            </button>
          </div>
        </div>
      </div>
      <ConfirmModal />
      <HiddenPanel
        isOpen={hiddenPanelOpen}
        content={
          <>
            condition:
            <br /> {JSON.stringify(condition)}
          </>
        }
      />
    </div>
  )
}
