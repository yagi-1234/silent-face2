'use client'

import { useEffect, useState } from 'react'
import { Check } from 'lucide-react'

import { fetchTaskNew, mergeTaskNew } from '@/actions/tasks/task-action'
import { TaskNewView, initialTaskNew } from '@/types/tasks/task-types'
import { CodeTaskType, CodeScheduleType } from '@/utils/codeUtils'

interface TaskFormProps {
  taskId: string
  onSave: (taskId: string) => void
}

export function TaskForm({ taskId, onSave }: TaskFormProps) {

  const [task, setTask] = useState<TaskNewView>(initialTaskNew)

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target
    setTask((prev) => ({ ...prev, [name]: value }))
  }
  const handleSave = async () => {
    const taskId = await mergeTaskNew(task)
    onSave(taskId)
  }

  const loadData = async () => {
    const fetchData = await fetchTaskNew(taskId ?? '')
    setTask(fetchData)
  }

  useEffect(() => {
    if (taskId) loadData()
  }, [taskId])

  return (
    <div className="w-80 md:w-168">
      <div className="div-input-row">
        <label htmlFor="task_type" className="input-label">Task Type</label>
          <select
              id="task_type"
              name="task_type"
              className="w-48"
              value={task.task_type ?? ""}
              onChange={handleChange}>
            <option value=""></option>
            {Object.entries(CodeTaskType)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([key, label]) => (<option key={key} value={key}>{label}</option>))}
          </select>
      </div>
      <div className="div-input-row">
        <label htmlFor="task_name" className="input-label">Task Name</label>
        <input type="text"
            id="task_name"
            name="task_name"
            className="w-full"
            value={task.task_name ?? ''}
            onChange={handleChange} />
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
          {Object.entries(CodeScheduleType)
              .map(([key, label]) => (<option key={key} value={key}>{label}</option>))}
        </select>
      </div>
      <div className="flex justify-end items-center">
        <button className="button-save" onClick={handleSave}>
          <Check size={16}/>
        </button>
      </div>
    </div>
  )
}
