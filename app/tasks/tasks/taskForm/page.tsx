'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

import { ArrowLeft, Check, Plus } from 'lucide-react'

import { fetchItemForTask } from '@/actions/library/library-action'
import { fetchTask, mergeTask, validateTask, isTaskEdited, fetchTaskGroups } from '@/actions/tasks/task-action'
import { Breadcrumb } from '@/components/Breadcrumb'
import ConfirmModal from '@/components/ConfirmModal'
import { useConfirmModal } from '@/contexts/ConfirmModalContext'
import HiddenPanel from '@/components/HiddenPanel'
import MessageBanner from '@/components/MessageBanner'
import { useMessage } from '@/contexts/MessageContext'
import PartialDateInput from '@/components/PartialDateInput'
import { checkUser } from '@/contexts/RooterContext'
import { TaskView, initialTask, TaskGroupView } from '@/types/tasks/task-types'
import { CodeTaskType, CodePriorityType, CodeTaskStatus, CodeScheduleType } from '@/utils/codeUtils'
import { formatDateTime } from '@/utils/dateFormat'
import { useCustomBack } from '@/utils/navigationUtils'

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
  const [task, setTask] = useState<TaskView>(initialTask)
  const [originalTask, setOriginalTask] = useState<TaskView>(initialTask)
  const [taskGroups, setTaskGroups] = useState<TaskGroupView[]>([])

  const [hiddenPanelOpen, setHiddenPanelOpen] = useState(false)

  const { setIsModalOpen, setModalMessage, setConfirmHandler } = useConfirmModal()
  const { handleBack } = useCustomBack()
  const { message, setMessage, messageType, setMessageType, errors, setErrors } = useMessage()

  const handleTaskStatusChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    let isDone = false
    const { value } = event.target
    if (event.target.value === '2' || event.target.value === '8' || event.target.value === '9') isDone = true
    setTask(prev => ({
      ...prev,
      task_status: value,
      next_period: isDone ? null : task.next_period,
      next_date: isDone ? null : task.next_date,
      buffer_period: isDone ? null : task.buffer_period,
      limit_date: isDone ? null : task.limit_date,
    }))
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, classList } = event.target
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
  const handleTaskTypeChange = async (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setTask(prev => ({
      ...prev, task_type: event.target.value
    }))
    if (event.target.value) {
      const result = await fetchTaskGroups(event.target.value)
      setTaskGroups(result)
    }
  }
  const handleChangeDate = (value: string, name: string) => {
    setTask(prev => ({
      ...prev, [name]: value
    }))
    let nextDate = name == 'next_date' ? (value ? new Date(value) : null) : task.next_date
    let limitDate = name == 'limit_date' ? (value ? new Date(value) : null) : task.limit_date
    let firstActedAt = task.first_acted_at
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
    if (name === 'last_acted_at' && task.action_count === 1) firstActedAt = new Date(value)
    setTask(prev => ({
      ...prev,
      first_acted_at: firstActedAt,
      next_date: nextDate,
      limit_date: limitDate
    }))
  }

  const handlePlus = () => {
    setTask(prev => {
      const lastActedAt = new Date()
      const actionCount = task.action_count == null ? 1 : Number(task.action_count) + 1
      const firstActedAt = actionCount === 1 ? lastActedAt : task.first_acted_at
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
      return {
        ...prev,
        action_count: actionCount,
        last_acted_at: lastActedAt,
        first_acted_at: firstActedAt,
        next_date: nextDate,
        limit_date: limitDate
      }
    })
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
      const result = await mergeTask(task, updateTaskKey)
      setTask(result)
      setOriginalTask(result)
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
        const taskGroups = await fetchTaskGroups(fetchData.task_type ?? "")
        setTaskGroups(taskGroups)
        setTask(fetchData)
        setOriginalTask(fetchData)
      } else if (inItemId) {
        const fetchData = await fetchItemForTask(inItemId)
        const taskGroups = await fetchTaskGroups(fetchData.task_type ?? "")
        setTaskGroups(taskGroups)
        setTask(fetchData)
        setOriginalTask(fetchData)
      }
    }
    loadTask()

    const handler = (e: WindowEventMap['keydown']) => {
      if (e.ctrlKey && e.altKey && e.key === 'd') {
        setHiddenPanelOpen((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler);
  }, [inTaskId])

  return (
    <div className="root-panel">
      <MessageBanner
          message={message}
          type={messageType}
          errors={errors}
          onClose={() => setMessage('')} />
      <Breadcrumb 
          edited={isTaskEdited(originalTask, task)} />
      <h2 className="header-title">Task Form</h2>
      <p className="timestamp">
        {task.task_id ? "last updated at: " + formatDateTime(task.updated_at, 'yyyy/MM/dd HH:mm') + " (" + task.updated_count + ")" : '(Not registered)'}
      </p>
      <div>
        <div className="div-input-row">
          <label htmlFor="task_type" className="input-label">Task Type</label>
          <select
              id="task_type"
              name="task_type"
              className="w-48"
              value={task.task_type ?? ""}
              onChange={(e) => handleTaskTypeChange(e)}>
            {Object.entries(CodeTaskType)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
            ))}
          </select>
        </div>
        <div className="div-input-row">
          <label htmlFor="task_group_id" className="input-label">Group</label>
          <select
              id="task_group_id"
              name="task_group_id"
              className="w-full sm:w-160"
              value={task.task_group_id ?? ""}
              onChange={handleChange}>
            <option key="" value=""></option>
            {taskGroups.map(taskGroup => (
              <option key={taskGroup.task_group_id} value={taskGroup.task_group_id ?? ""}>
                {taskGroup.task_group_name}
              </option>
            ))}
          </select>
        </div>
        <div className="div-input-row">
          <label htmlFor="task_name" className="input-label">Task Name</label>
          <input
              type="text"
              id="task_name"
              name="task_name"
              className="w-full sm:w-160"
              value={task.task_name ?? ""}
              onChange={(e) => handleChange(e)}/>
        </div>
        <div className="div-input-row">
          <label htmlFor="priority" className="input-label">Priority</label>
          <select
              id="priority"
              name="priority"
              className="w-48"
              value={task.priority ?? ""}
              onChange={(e) => handleChange(e)}>
            <option value=""></option>
            {Object.entries(CodePriorityType).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div className="div-input-row">
          <label htmlFor="schedule_type" className="input-label">Schedule Type</label>
          <select
              id="schedule_type"
              name="schedule_type"
              className="w-48"
              value={task.schedule_type ?? ""}
              onChange={(e) => handleChange(e)}>
            <option value=""></option>
            {Object.entries(CodeScheduleType).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div className="div-input-row">
          <label htmlFor="task_status" className="input-label">Status</label>
          <select
              id="task_status"
              name="task_status"
              className="w-48"
              value={task.task_status ?? ""}
              onChange={(e) => handleTaskStatusChange(e)}>
            {Object.entries(CodeTaskStatus).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div className="div-input-row">
          <label htmlFor="action_count" className="input-label">Acted</label>
          <div className="div-input-left">
            <button
                className="button-plus"
                onClick={handlePlus} >
              <Plus />
            </button>
            <input
                type="number"
                id="action_count"
                name="action_count"
                className="numeric-field w-16 sm:w-24"
                value={task.action_count ?? ""}
                onChange={handleChange} />
            <PartialDateInput
                name="last_acted_at"
                value={formatDateTime(task.last_acted_at, "yyyy-MM-dd")}
                onChange={handleChangeDate} />
          </div>
        </div>
        <div className="div-input-row">
          <label htmlFor="next_period" className="input-label">First</label>
          <div className="div-input-left">
            <span className="w-25 sm:w-33"></span>
            <PartialDateInput
                name="first_acted_at"
                value={formatDateTime(task.first_acted_at, "yyyy-MM-dd")}
                onChange={handleChangeDate} />
          </div>
        </div>
        <div className="div-input-row">
          <label htmlFor="next_period" className="input-label">Next</label>
          <div className="div-input-left">
            <input
                type="number"
                id="next_period"
                name="next_period"
                className="numeric-field w-23 sm:w-31"
                value={task.next_period ?? ""}
                onChange={(e) => handleChange(e)}/>
            <PartialDateInput
                name="next_date"
                value={formatDateTime(task.next_date, "yyyy-MM-dd")}
                onChange={handleChangeDate} />
          </div>
        </div>
        <div className="div-input-row">
          <label htmlFor="buffer_period" className="input-label">Limit</label>
          <div className="div-input-left">
            <input
                type="number"
                id="buffer_period"
                name="buffer_period"
                className="numeric-field w-23 sm:w-31"
                value={task.buffer_period ?? ""}
                onChange={(e) => handleChange(e)}/>
            <PartialDateInput
                name="limit_date"
                value={formatDateTime(task.limit_date, "yyyy-MM-dd")}
                onChange={handleChangeDate} />
          </div>
        </div>
        <div className="div-input-row">
          <label htmlFor="task_comment" className="input-label">Task Comment</label>
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
