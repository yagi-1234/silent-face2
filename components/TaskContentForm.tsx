'use client'

import { useEffect, useState } from 'react'
import { Check } from 'lucide-react'

import { fetchTaskNew, fetchTasksNew, fetchTaskContent, mergeTaskContent } from '@/actions/tasks/task-action'
import { TaskNewView, TaskContentView, initialTaskContent } from '@/types/tasks/task-types'
import { CodeTaskType } from '@/utils/codeUtils'

interface TaskContentFormProps {
  taskId?: string,
  taskContentId?: string,
  taskType?: string,
  taskKey?: string,
  taskContentName?: string,
  onSave: () => void
}
export function TaskContentForm({ taskId, taskContentId, taskType, taskContentName, taskKey, onSave }: TaskContentFormProps) {

  const [content, setContent] = useState<TaskContentView>(initialTaskContent)
  const [tasks, setTasks] = useState<TaskNewView[]>([])

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target
    setContent((prev) => ({ ...prev, [name]: value }))
  }
  const handleSave = async () => {
    await mergeTaskContent(content)
    onSave()
  }
  const loadData = async () => {
    if (taskContentId) {
      const fetchData = await fetchTaskContent(taskContentId ?? '')
      setContent(fetchData)
    } else if (taskId) {
      const fetchData = await fetchTaskNew(taskId ?? '')
      const contentData = {
        ...content,
        task_id: taskId ?? '',
        task_type: fetchData.task_type,
        task_name: fetchData.task_name
      } 
      setContent(contentData)
    } else {
      const contentData = {
        ...content,
        task_type: taskType ?? '',
        task_key: taskKey ?? '',
        task_content_name: taskContentName ?? ''
      }
      setContent(contentData)
      const taskList = await fetchTasksNew(taskType ?? '')
      setTasks(taskList)
    }
  }

  useEffect(() => {
    loadData()
  }, [taskContentId])

  return (
    <div className="w-80 md:w-168">
      <div className="div-input-row">
        <label htmlFor="task_type" className="input-label">Task Type</label>
        <span>{CodeTaskType[content.task_type ?? ""]}</span>
      </div>
      <div className="div-input-row">
        <label htmlFor="task_name" className="input-label">Task Name</label>
        {taskKey ? (
          <span>
            <select
                id="task_id"
                name="task_id"
                className="w-48"
                value={content.task_id ?? ""}
                onChange={handleChange}>
              <option key="" value=""></option>
              {tasks.map(row => (
                <option key={row.task_id} value={row.task_id ?? ""}>{row.task_name}</option>
              ))}
            </select>
          </span>
        ) : (
          <span>{content.task_name ?? ""}</span>
        )}
      </div>
      <div className="div-input-row">
        <label htmlFor="task_content_name" className="input-label">Task Content Name</label>
        <input type="text"
            id="task_content_name"
            name="task_content_name"
            className="w-full"
            value={content.task_content_name ?? ''}
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
