'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { AlarmClockCheck, ArrowLeft, BookImage, BookOpenText, BookText, CalendarClock, CircleCheckBig, Clapperboard, Hourglass, Plus, FileText, Gamepad2, Tv, Info, Search } from 'lucide-react'

import { fetchTasks, updateLastActedAt, updateTaskStatus } from '@/actions/tasks/task-action'
import { Breadcrumb } from '@/components/Breadcrumb'
import ConfirmModal from '@/components/ConfirmModal'
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
import { ellipsis, isEllipsed } from '@/utils/viewUtils'

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

  const getInputClassName = (originalClassName: string, taskStatus: string, targetDate: Date | null) => {
    let className = originalClassName
    if (taskStatus !== '1' || !targetDate) {
      return className
    }
    const today = new Date().setHours(0, 0, 0, 0)
    if (targetDate) {
      const targetDate2 = new Date(targetDate)?.setHours(0, 0, 0, 0)
      if (today >= targetDate2) {
        className += ' text-red-600'
      }
    }
    return className
  }

  const getTaskStatusClass = (taskStatus: string): string => {
    if (taskStatus === '0') return "bg-gray-200"
    if (taskStatus === '1') return "bg-red-200"
    if (taskStatus === '2') return "bg-green-200"
    if (taskStatus === '8') return "bg-yellow-100"
    if (taskStatus === '9') return "bg-blue-200"
    return ""
  }

  const getTaskTypeIcon = (taskType: string) => {
    if (taskType === '02') return <BookText size={14} />
    if (taskType === '03') return <BookImage size={14} />
    if (taskType === '04') return <Clapperboard size={14} />
    if (taskType === '05') return <Tv size={14} />
    if (taskType === '06') return <Gamepad2 size={14} />
    if (taskType === '07') return <BookOpenText size={14} />
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
      </div>
      <h2 className="header-title">Task List</h2>
      <div>
        <div className="mb-2">
          <label htmlFor="task_type" className="input-label">Task Type</label>
          <select
              id="task_type"
              name="task_type"
              className="w-40"
              value={condition.task_type}
              onChange={(e) => handleChange(e)}>
            <option key="" value=""></option>
            {Object.entries(CodeTaskType)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([key, label]) => (<option key={key} value={key}>{label}</option>)
            )}
          </select>
        </div>
        <div className="div-input-row">
          <label htmlFor="task_status" className="input-label">Task Status</label>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
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
          </div>
        </div>
        <div className="div-row-right">
          <button className="button-search button-md"
              onClick={handleSearch}>
            <Search size={16} />
          </button>
        </div>
      </div>
      <div className="hidden sm:block">
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
            {tasks.map(task => (
              <tr key={task.task_id}>
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
                <td>
                  {isEllipsed(task.task_name, 24) ? (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild><div>{ellipsis(task.task_name, 24)}</div></TooltipTrigger>
                        <TooltipContent>{task.task_name}</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : (
                    <div>{task.task_name}</div>
                  )}
                </td>
                <td>{CodePriorityType[task.priority]}</td>
                <td>{CodeScheduleType[task.schedule_type]}</td>
                <td className="numeric-field">{task.task_progress}</td>
                <td className="numeric-field">{task.action_count}</td>
                <td>{formatDateTime(task.first_acted_at, "yyyy/MM/dd")}</td>
                <td>{formatDateTime(task.last_acted_at, "yyyy/MM/dd")}</td>
                <td className={getInputClassName("", task.task_status, task.next_date)}>{formatDateTime(task.next_date, "yyyy/MM/dd")}</td>
                <td className={getInputClassName("", task.task_status, task.limit_date)}>{formatDateTime(task.limit_date, "yyyy/MM/dd")}</td>
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
      </div>
      <div className="block sm:hidden">
        <div className="div-card-area">
          {tasks.map(task => (
            <div key={task.task_id}
                className="div-card">
              <div className="div-card-row">
                <label className={"card-label w-25 " + getTaskStatusClass(task.task_status)}>{CodeTaskStatus[task.task_status]}</label>
                <div className="flex items-center card-label bg-blue-100 w-25">
                  {getTaskTypeIcon(task.task_type)}
                  <label>{CodeTaskType[task.task_type]}</label>
                </div>
                <label className="bg-purple-100 card-label">{task.task_cycle}</label>
              </div>
              <div>
                <button
                    className="button-link card-title"
                    onClick={() => handleShowForm(task.task_id)}>
                  {task.task_name}
                </button>
              </div>
              <div className="div-card-row">
                <AlarmClockCheck size={14} />
                {formatDateTime(task.last_acted_at, "yyyy/MM/dd")}
              </div>
              <div className={getInputClassName("div-card-row", task.task_status, task.next_date)}>
                <CalendarClock size={14} />
                {formatDateTime(task.next_date, "yyyy/MM/dd")}
                <span>&ensp;</span>
                <Hourglass size={14} />
                {formatDateTime(task.limit_date, "yyyy/MM/dd")}
              </div>
            </div>
          ))}
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
