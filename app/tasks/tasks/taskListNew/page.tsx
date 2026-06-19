'use client'

import React from 'react'
import { Suspense, useEffect, useState } from 'react'
import { ArrowLeft, Check, ChevronsDown, ChevronsUp, Plus, SquarePlus } from 'lucide-react'

import { fetchTasksNew, fetchTaskContents, fetchTaskHistories } from '@/actions/tasks/task-action'
import { Breadcrumb } from '@/components/Breadcrumb'
import ConfirmModal from '@/components/ConfirmModal'
import MessageBanner from '@/components/MessageBanner'
import { TaskForm } from '@/components/TaskForm'
import { TaskContentForm } from '@/components/TaskContentForm'
import { TaskHistoryForm } from '@/components/TaskHistoryForm'
import Modal from '@/components/Modal'
import { useMessage } from '@/contexts/MessageContext'
import { checkUser } from '@/contexts/RooterContext'
import { TaskNewView, TaskContentView, TaskHistoryView } from '@/types/tasks/task-types'
import { CodeTaskType } from '@/utils/codeUtils'
import { formatDateTime } from '@/utils/dateFormat'
import { useCustomBack } from '@/utils/navigationUtils'

const Page = () => {
  return (
    <Suspense fallback={<div>Loading task list...</div>}>
      <TaskList />
    </Suspense>
  )
}
export default Page

const TaskList = () => {

  const { handleBack } = useCustomBack()

  const { message, setMessage, messageType, setMessageType, errors } = useMessage()
  const [tasks, setTasks] = useState<TaskNewView[]>([])
  const [taskContents, setTaskContents] = useState<TaskContentView[]>([])
  const [taskHistories, setTaskHistories] = useState<TaskHistoryView[]>([])

  const [openedTaskId, setOpenedTaskId] = useState<string>('')
  const [openedContentId, setOpenedContentId] = useState<string>('')

  const [showTaskForm, setShowTaskForm] = useState(false)
  const [formTaskId, setFormTaskId] = useState<string>('')
  const [showContentForm, setShowContentForm] = useState(false)
  const [formTaskContentId, setFormTaskContentId] = useState<string>('')
  const [showHistoryForm, setShowHistoryForm] = useState(false)
  const [formTaskHistoryId, setFormTaskHistoryId] = useState<string>('')

  const checkLogin = async () => {
    await checkUser()
  }
  const loadData = async () => {
    const fetchData = await fetchTasksNew()
    setTasks(fetchData)
  }
  const hadleOpenContents = async(task: TaskNewView) => {
    if (task.task_id === openedTaskId) {
      setOpenedTaskId('')
      setTaskContents([])
    } else {  
      const result = await fetchTaskContents(task.task_id ?? '')
      setTaskContents(result)
      setOpenedTaskId(task.task_id ?? '')
      console.log(result)
    }
    setOpenedContentId('')
    setTaskHistories([])
  }
  const hadleOpenHistories = async(content: TaskContentView) => {
    if (content.task_content_id === openedContentId) {
      setOpenedContentId('')
      setTaskHistories([])
    } else {
      const result = await fetchTaskHistories(content.task_content_id ?? '')
      setTaskHistories(result)
      setOpenedContentId(content.task_content_id ?? '')
    }
  }

  const handleShowTaskForm = (taskId?: string) => {
    setFormTaskId(taskId ?? '')
    setShowTaskForm(true)
  }
  const handleTaskSaved = async () => {
    await loadData()
    setShowTaskForm(false)
  }

  const handleShowContentForm = (taskId: string, taskContentId?: string) => {
    setFormTaskId(taskId ?? '')
    setFormTaskContentId(taskContentId ?? '')
    setShowContentForm(true)
  }
  const handleContentSaved = async () => {
    const result = await fetchTaskContents(formTaskId ?? '')
    setTaskContents(result)
    setShowContentForm(false)
  }

  const handleShowHistoryForm = (taskContentId: string, taskHistoryId?: string) => {
    setFormTaskContentId(taskContentId ?? '')
    setFormTaskHistoryId(taskHistoryId ?? '')
    setShowHistoryForm(true)
  }
  const handleHistorySaved = async (taskContentId: string) => {
    const result = await fetchTaskHistories(formTaskContentId ?? '')
    setTaskHistories(result)
    setShowHistoryForm(false)
  }

  useEffect(() => {
    checkLogin()
    loadData()
  }, [])

  return (
    <div className="root-panel">
      <div className="flex justify-between">
        <Breadcrumb />
      </div>
      <h2 className="header-title">Tasks</h2>
      <MessageBanner
          message={message}
          type={messageType}
          errors={errors}
          onClose={() => setMessage('')} />
      <div className="border-y divide-y md:w-200">
        {tasks.map((task, index) => (
          <>
            <div key={task.task_id} className="div-rows-flexible">
              <div className="div-row-flexible">
                <span className="w-24">{CodeTaskType[task.task_type ?? ""]}</span>
                <span className="w-48 md:w-64">
                  <button className="button-link"
                      onClick={() => handleShowTaskForm(task.task_id ?? "")}>
                    {task.task_name}
                  </button>
                </span>
                <span className="w-4">
                  <button
                      onClick={() => hadleOpenContents(task)}>
                    {task.task_id === taskContents[0]?.task_id ? <ChevronsUp size={16} /> : <ChevronsDown size={16} />}
                  </button>
                </span>
              </div>
            </div>
            {task.task_id === openedTaskId ? (
              <>
                {taskContents.map((content) => (
                  <React.Fragment key={content.task_content_id}>
                    <div className="div-rows-flexible">
                      <div className="div-row-flexible">
                        <span className="w-28"></span>
                        <span className="w-44 md:w-64">
                          <button className="button-link"
                              onClick={() => handleShowContentForm(task.task_id ?? "", content.task_content_id ?? "")}>
                            {content.task_content_name}
                          </button>
                        </span>
                        <span className="w-4">
                          <button
                              onClick={() => hadleOpenHistories(content)}>
                            {content.task_content_id === taskHistories[0]?.task_content_id ? <ChevronsUp size={16} /> : <ChevronsDown size={16} />}
                          </button>
                        </span>
                      </div>
                    </div>
                    {content.task_content_id === openedContentId ? (
                      <>
                        {taskHistories.map((history) => (
                          <React.Fragment key={history.task_history_id}>
                            <div className="div-rows-flexible">
                              <div className="div-row-flexible">
                                <span className="w-32"></span>
                                <span className="w-24">
                                  <button className="button-link"
                                      onClick={() => handleShowHistoryForm(content.task_content_id ?? "", history.task_history_id ?? "")}>
                                    {formatDateTime(history.last_acted_at, "yyyy/MM/dd")}
                                  </button>
                                </span>
                              </div>
                            </div>
                          </React.Fragment>
                        ))}
                        <div className="div-rows-flexible">
                          <div className="div-row-flexible">
                            <span className="w-32"></span>
                            <span className="w-8">
                              <button
                                  onClick={() => handleShowHistoryForm(content.task_content_id ?? "", "")}>
                                <SquarePlus className="text-blue-800 w-4 h-4" />
                              </button>
                            </span>
                          </div>
                        </div>
                      </>
                    ) : null}
                  </React.Fragment>
                ))}
                <div className="div-rows-flexible">
                  <div className="div-row-flexible">
                    <span className="w-28"></span>
                    <span className="w-8">
                      <button
                          onClick={() => handleShowContentForm(task.task_id ?? "", "")}>
                        <SquarePlus className="text-blue-800 w-4 h-4" />
                      </button>
                    </span>
                  </div>
                </div>
              </>
            ) : null}
          </>
        ))}
      </div>
      <ConfirmModal />
      {showTaskForm && (
        <Modal onClose={() => setShowTaskForm(false)}>
          <TaskForm 
              taskId={formTaskId}
              onSave={handleTaskSaved} />
        </Modal>
      )}
      {showContentForm && (
        <Modal onClose={() => setShowContentForm(false)}>
          <TaskContentForm 
              taskId={formTaskId}
              taskContentId={formTaskContentId}
              onSave={handleContentSaved} />
        </Modal>
      )}
      {showHistoryForm && (
        <Modal onClose={() => setShowHistoryForm(false)}>
          <TaskHistoryForm 
              taskContentId={formTaskContentId}
              taskHistoryId={formTaskHistoryId}
              onSave={handleHistorySaved} />
        </Modal>
      )}
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
                onClick={() => handleShowTaskForm('')}>
              <Plus size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
