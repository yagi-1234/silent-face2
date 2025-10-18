'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

import { ArrowLeft, Check, Plus } from 'lucide-react'

import { fetchItemForTask } from '@/actions/library/library-action'
import { fetchTask, mergeTask, validateTask, isTaskEdited } from '@/actions/tasks/task-action'
import PartialDateInput from '@/components/PartialDateInput'
import ConfirmModal from '@/components/ConfirmModal'
import { useConfirmModal } from '@/contexts/ConfirmModalContext'
import { useMessage } from '@/contexts/MessageContext'
import { checkUser } from '@/contexts/RooterContext'
import { Task, initialTask } from '@/types/tasks/task-types'
import { CodeTaskType, CodePriorityType, CodeTaskStatus, CodeScheduleType } from '@/utils/codeUtils'
import { formatDateTime } from '@/utils/dateFormat'
import { useCustomBack } from '@/utils/navigationUtils'

import { Breadcrumb } from '@/components/Breadcrumb'
import { LogoffButton } from '@/components/LogoffButton'
import MessageBanner from '@/components/MessageBanner'
import HiddenPanel from '@/components/HiddenPanel'

const Page = () => {
  return (
    <Suspense fallback={<div>Loading task form...</div>}>
      <TaskForm />
    </Suspense>
  )
}
export default Page

const TaskForm = () => {
  const params = useSearchParams()
  const inTaskId = params.get("task_id") ?? ""
  const inItemId = params.get("item_id") ?? ""
  const [task, setTask] = useState<Task>(initialTask)
  const [originalTask, setOriginalTask] = useState<Task>(initialTask)

  const [hiddenPanelOpen, setHiddenPanelOpen] = useState(false)

  const { setIsModalOpen, setModalMessage, setConfirmHandler } = useConfirmModal()
  const { handleBack } = useCustomBack()
  const { message, setMessage, messageType, setMessageType, errors, setErrors } = useMessage()

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, classList } = event.target;
    const isNumeric = classList.contains("numeric-field")
    setTask(prev => ({
      ...prev, [name]: isNumeric ? (value === '' ? null : Number(value)) : value
    }))
    let nextDate = task.next_date
    let limitDate = task.limit_date
    if (task.last_acted_at && name === 'next_period' && value) {
      nextDate = new Date(task.last_acted_at)
      nextDate.setDate(nextDate.getDate() + Number(value))
      if (task.buffer_period) {
        limitDate = new Date(nextDate)
        limitDate.setDate(limitDate.getDate() + Number(task.buffer_period))
      }
    } else if (nextDate && name === 'buffer_period' && value) {
      limitDate = new Date(nextDate)
      limitDate.setDate(limitDate.getDate() + Number(value))
    }
    setTask(prev => ({
      ...prev,
      next_date: nextDate,
      limit_date: limitDate
    }))
  }
  const handleChangeDate = (value: string, name: string) => {
    console.log('value', value)
    setTask(prev => ({
      ...prev, [name]: value
    }))
    let nextDate = name == 'next_date' ? (value ? new Date(value) : null) : task.next_date
    let limitDate = name == 'limit_date' ? (value ? new Date(value) : null) : task.limit_date
    if (task.next_period && name === 'last_acted_at' && value) {
      nextDate = new Date(value)
      nextDate.setDate(nextDate.getDate() + Number(task.next_period))
      if (task.buffer_period) {
        limitDate = new Date(nextDate)
        limitDate.setDate(limitDate.getDate() + Number(task.buffer_period))
      }
    }
    if (task.buffer_period && name === 'next_date' && value) {
      limitDate = new Date(value)
      limitDate.setDate(limitDate.getDate() + Number(task.buffer_period))
    }
    console.log('nextDate', nextDate)
    setTask(prev => ({
      ...prev,
      next_date: nextDate,
      limit_date: limitDate
    }))
  }

  const handlePlus = () => {
    const lastActedAt = new Date()
    let nextDate = task.next_date
    let limitDate = task.limit_date
    if (task.next_period) {
      nextDate = new Date(lastActedAt)
      nextDate.setDate(nextDate.getDate() + Number(task.next_period))
      if (task.buffer_period) {
        limitDate = new Date(nextDate)
        limitDate.setDate(limitDate.getDate() + Number(task.buffer_period))
      }
    }
    setTask(prev => ({
      ...prev,
      action_count: prev.action_count == null ? 1 : Number(prev.action_count) + 1,
      last_acted_at: lastActedAt,
      next_date: nextDate,
      limit_date: limitDate,
    }))
  }

  const handleSave = () => {
    setModalMessage("Do you want to continue with this registration?")
    setConfirmHandler(async () => {
      const validationErrors = validateTask(task)
      if (0 < Object.keys(validationErrors).length) {
        setMessage("Validation Error!")
        setMessageType("error")
        setErrors(validationErrors)
        return
      }

      let updateTaskKey = ''
      if (task.task_key && originalTask.action_count && task.action_count && originalTask.action_count < task.action_count) updateTaskKey = task.task_key
      setTask(await mergeTask(task, updateTaskKey))
      setMessage("Saved Successfully!")
      setMessageType("info")
    })
    setIsModalOpen(true)
  }

  const checkLogin = async () => {
    await checkUser()
  }

  useEffect(() => {
    checkLogin()
    const loadTask = async () => {
      if (inTaskId) {
        const fetchData = await fetchTask(inTaskId)
        setTask(fetchData)
        setOriginalTask(fetchData)
      } else if (inItemId) {
        const fetchData = await fetchItemForTask(inItemId)
        setTask(fetchData)
        setOriginalTask(fetchData)
      }
    }
    loadTask()

    const handler = (e: WindowEventMap["keydown"]) => {
      if (e.ctrlKey && e.altKey && e.key === "d") {
        setHiddenPanelOpen((prev) => !prev)
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler);
  }, [inTaskId])

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
      <h2 className="header-title">Task Form</h2>
      <p className="timestamp">
        {task.task_id ? "last updated at: " + formatDateTime(task.updated_at, 'yyyy/MM/dd HH:mm') + " (" + task.updated_count + ")" : '(Not registered)'}
      </p>
      <div>
        <div className="input-form">
          <label htmlFor="task_type">Task Type</label>
          <select
              id="task_type"
              name="task_type"
              className="w-48"
              value={task.task_type}
              onChange={(e) => handleChange(e)}>
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
          <label htmlFor="task_cycle">Cycle</label>
          <input
              type="text"
              id="task_cycle"
              name="task_cycle"
              className="w-48"
              value={task.task_cycle}
              onChange={(e) => handleChange(e)}/>
        </div>
        <div className="input-form">
          <label htmlFor="task_name">Task Name</label>
          <input
              type="text"
              id="task_name"
              name="task_name"
              className="w-80"
              value={task.task_name}
              onChange={(e) => handleChange(e)}/>
        </div>
        <div className="input-form">
          <label htmlFor="priority">Priority</label>
          <select
              id="priority"
              name="priority"
              className="w-48"
              value={task.priority}
              onChange={(e) => handleChange(e)}>
            <option value=""></option>
            {Object.entries(CodePriorityType).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div className="input-form">
          <label htmlFor="schedule_type">Schedule Type</label>
          <select
              id="schedule_type"
              name="schedule_type"
              className="w-48"
              value={task.schedule_type}
              onChange={(e) => handleChange(e)}>
            <option value=""></option>
            {Object.entries(CodeScheduleType).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div className="input-form">
          <label htmlFor="task_status">Status</label>
          <select
              id="task_status"
              name="task_status"
              className="w-48"
              value={task.task_status}
              onChange={(e) => handleChange(e)}>
            {Object.entries(CodeTaskStatus).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div className="input-form">
          <label htmlFor="task_progress">Progress</label>
          <input
              type="number"
              id="task_progress"
              name="task_progress"
              className="numeric-field w-30"
              value={task.task_progress ?? ""}
              onChange={(e) => handleChange(e)}/>
        </div>
        <div className="input-form">
          <label htmlFor="action_count">Acted</label>
          <button
              className="button-plus"
              onClick={handlePlus} >
            <Plus />
          </button>
          <input
              type="number"
              id="action_count"
              name="action_count"
              className="numeric-field w-24"
              value={task.action_count ?? ""}
              onChange={handleChange} />
          <PartialDateInput
              name="last_acted_at"
              value={formatDateTime(task.last_acted_at, "yyyy-MM-dd")}
              onChange={handleChangeDate} />
        </div>
        <div className="input-form">
          <label htmlFor="next_period">Next</label>
          <input
              type="number"
              id="next_period"
              name="next_period"
              className="numeric-field w-31"
              value={task.next_period ?? ""}
              onChange={(e) => handleChange(e)}/>
          <PartialDateInput
              name="next_date"
              value={formatDateTime(task.next_date, "yyyy-MM-dd")}
              onChange={handleChangeDate} />
        </div>
        <div className="input-form">
          <label htmlFor="buffer_period">Limit</label>
          <input
              type="number"
              id="buffer_period"
              name="buffer_period"
              className="numeric-field w-31"
              value={task.buffer_period ?? ""}
              onChange={(e) => handleChange(e)}/>
          <PartialDateInput
              name="limit_date"
              value={formatDateTime(task.limit_date, "yyyy-MM-dd")}
              onChange={handleChangeDate} />
        </div>
        <div className="input-form-full">
          <label htmlFor="task_comment">Task Comment</label>
          <textarea
              id="task_comment"
              name="task_comment"
              rows={3}
              value={task.task_comment ?? ""}
              onChange={(e) => handleChange(e)} />
        </div>
      </div>
      <div className="footer-area">
        <div className="footer-area-sub">
          <div className="footer-left">
            <button className="button-back"
                onClick={() => handleBack(isTaskEdited(originalTask, task))}>
              <ArrowLeft size={16} />
            </button>
          </div>
          <div className="footer-right">
            <button className="button-save"
                disabled={!isTaskEdited(originalTask, task)}
                onClick={handleSave}>
              <Check size={16} />
            </button>
          </div>
        </div>
      </div>
      <ConfirmModal />
      <HiddenPanel
        isOpen={hiddenPanelOpen}
        content={
          <>
            originalTask:
            <br /> {JSON.stringify(originalTask)}
            <br />
            task:
            <br /> {JSON.stringify(task)}
          </>
        }
      />
    </div>
  )
}
