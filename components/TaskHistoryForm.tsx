'use client'

import { useEffect, useState } from 'react'
import { Check } from 'lucide-react'

import { fetchTaskContent, fetchTaskHistory, mergeTaskHistory } from '@/actions/tasks/task-action'
import PartialDateInput from '@/components/PartialDateInput'
import { TaskHistoryView, initialTaskHistory } from '@/types/tasks/task-types'
import { formatDateTime } from '@/utils/dateFormat'

interface TaskHistoryFormProps {
  taskContentId: string,
  taskHistoryId: string,
  onSave: (taskContentId: string) => void
}
export function TaskHistoryForm({ taskContentId, taskHistoryId, onSave }: TaskHistoryFormProps) {

  const [history, setHistory] = useState<TaskHistoryView>(initialTaskHistory)

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type, value, checked } = event.target
    setHistory(prev => ({
      ...prev, [name]: type === 'checkbox' ? (checked ? '1' : '0') : value
    }))
  }
  const handleChangeDate = (value: string, name: string) => {
    setHistory(prev => ({
      ...prev, [name]: value
    }))
  }
  const handleSave = async () => {
    await mergeTaskHistory(history)
    onSave(history.task_content_id ?? '')
  }
  const loadData = async () => {
    if (taskHistoryId) {
      const fetchData = await fetchTaskHistory(taskHistoryId ?? '')
      setHistory(fetchData)
    } else {
      const fetchData = await fetchTaskContent(taskContentId ?? '')
      const contentData = {
        ...history,
        task_id: fetchData.task_id,
        task_type: fetchData.task_type,
        task_name: fetchData.task_name,
        task_content_id: taskContentId,
        task_content_name: fetchData.task_content_name
      }
      setHistory(contentData)
    }
  }

  useEffect(() => {
    loadData()
  }, [taskHistoryId])

  return (
    <div className="w-80 md:w-168">
       <div className="div-input-row">
        <label htmlFor="task_name" className="input-label">Task Name</label>
        <span>{history.task_name ?? ""}</span>
      </div>
      <div className="div-input-row">
        <label htmlFor="task_content_name" className="input-label">Task Content Name</label>
        <span>{history.task_content_name ?? ""}</span>
      </div>
      <div className="div-input-row">
        <label htmlFor="acted_at" className="input-label">Last Acted</label>
        <div className="div-input-left">
          <PartialDateInput
              name="acted_at"
              value={formatDateTime(history.acted_at, "yyyy-MM-dd")}
              onChange={handleChangeDate} />
        </div>
      </div>
      <div className="div-input-row">
        <label htmlFor="progress" className="input-label">Progress</label>
        <input type="text"
            id="progress"
            name="progress"
            className="w-full"
            value={history.progress ?? ''}
            onChange={handleChange} />
      </div>
      <div className="div-input-row">
        <label htmlFor="completed" className="input-label">Completed</label>
        <input type="checkbox"
            id="completed"
            name="completed"
            className="w-5"
            checked={history.completed === "1"}
            value={history.completed ?? "0"}
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
