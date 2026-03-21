'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'

import { AlarmClockCheck, ArrowLeft, FileText, Plus, Search, RotateCw } from 'lucide-react'

import { fetchMusicTasks, updateMusicTaskStatus, refreshMusicTask } from '@/actions/tasks/task-action'
import { Breadcrumb } from '@/components/Breadcrumb'
import ConfirmModal from '@/components/ConfirmModal'
import MessageBanner from '@/components/MessageBanner'
import { useConfirmModal } from '@/contexts/ConfirmModalContext'
import { useHistory } from '@/contexts/HistoryContext'
import { useMessage } from '@/contexts/MessageContext'
import { checkUser } from '@/contexts/RooterContext'
import { useCustomBack } from '@/utils/navigationUtils'
import { MusicTask, MusicTaskCondition, initialMusicTaskCondition } from '@/types/tasks/task-types'
import { CodeTaskStatus, CodeMusicTaskType } from '@/utils/codeUtils'
import { formatDateTime } from '@/utils/dateFormat'

const Page = () => {
  return (
    <Suspense fallback={<div>Loading music task list...</div>}>
      <MusicTaskList />
    </Suspense>
  )
}
export default Page

const MusicTaskList = () => {

  const { setIsModalOpen, setModalMessage, setConfirmHandler } = useConfirmModal()
  const { handleBack } = useCustomBack()
  const { addToHistory } = useHistory()
  const { message, setMessage, messageType, setMessageType, errors } = useMessage()
  const pathname = usePathname()
  const router = useRouter();
  const searchParams = useSearchParams()

  const [condition, setCondition] = useState<MusicTaskCondition>(initialMusicTaskCondition)
  const [tasks, setTasks] = useState<MusicTask[]>([]);

  const loadData = async () => {
    if (searchParams.size > 0) {
      const condition1 = {
        ...condition,
        taskStatusList: searchParams.get('taskStatusList')?.toString().split(',') ?? []
      }
      setCondition(condition1)
      router.push(`/tasks/music/musicTaskList?${searchParams.get('taskStatusList')?.toString()}`)
    }
    const fetchData = await fetchMusicTasks(condition)
    setTasks(fetchData)
  }

  const handleSearch = async () => {
    const query = new URLSearchParams()
    if (condition.taskStatusList.length > 0) query.append('taskStatusList', condition.taskStatusList.join(','))
    router.push(`/tasks/music/musicTaskList?${query.toString()}`)
    const fetchData = await fetchMusicTasks(condition)
    setTasks(fetchData)
  }

  const handleRefresh = async () => {
    await refreshMusicTask(condition)
    const fetchData = await fetchMusicTasks(condition)
    setTasks(fetchData)
  }

  const handleStatusChange = (taskSubId: string, taskStatus: string) => {
    setModalMessage('Are you sure you want to change Status?')
    setConfirmHandler(async () => {
      const result = await updateMusicTaskStatus(taskSubId, taskStatus)
      await loadData()
      setMessage('Saved Successfully!')
      setMessageType('info')
    })
    setIsModalOpen(true)
  }

  const handleShowArtist = (artistId: string, artistName: string) => {
    addToHistory({ title: 'task List (Music)', path: `${pathname}?${searchParams.toString()}`})
    router.push(`/music/artists/artistList?artist_id=${artistId}&artist_name=${artistName}`);
  }
  const handleShowAlbums = (artistId: string, artistName: string, albumId: string, albumName: string) => {
    addToHistory({ title: 'task List (Music)', path: `${pathname}?${searchParams.toString()}`})
    router.push(`/music/albums/albumList?artist_id=${artistId}&artist_name=${artistName}&album_id=${albumId}&album_name=${albumName}`);
  }

  const handleShowForm = (taskSubId: string) => {
    addToHistory({ title: 'task List (Music)', path: `${pathname}?${searchParams.toString()}`})
    if (taskSubId) router.push(`/tasks/music/musicTaskForm?task_sub_id=${taskSubId}`);
    else router.push('/tasks/music/musicTaskForm');
  }

  const checkLogin = async () => {
    await checkUser()
  }

  useEffect(() => {
    checkLogin()
    loadData()
  }, [])

  const getTaskStatusClass = (taskStatus: string): string => {
    if (taskStatus === '0') return "bg-gray-200"
    if (taskStatus === '1') return "bg-red-200"
    if (taskStatus === '2') return "bg-green-200"
    if (taskStatus === '8') return "bg-yellow-100"
    if (taskStatus === '9') return "bg-blue-200"
    return ''
  }

  return (
    <div className="root-panel">
      <MessageBanner
          message={message}
          type={messageType}
          errors={errors}
          onClose={() => setMessage('')} />
      <Breadcrumb />
      <h2 className="header-title">Task List (Music)</h2>
      <div>
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
                        checked={condition?.taskStatusList.includes(key)}
                        onChange={(e) => {
                          setCondition(prev => ({
                            ...prev,
                            taskStatusList: e.target.checked ? [...prev.taskStatusList, key] : prev.taskStatusList.filter(status => status !== key)
                          }))
                        }}
                    />
                    <span>{label}</span>
                  </label>
            ))}
          </div>
        </div>
        <div className="div-row-right">
          <button className="button-search"
              onClick={handleSearch}>
            <Search size={16} />
          </button>
          <button className="button-save"
              onClick={handleRefresh}>
            <RotateCw size={16} />
          </button>
        </div>
      </div>
      <div className="hidden sm:block">
        <table>
          <thead>
            <tr>
              <th>Status</th>
              <th>Type</th>
              <th>Priority</th>
              <th>Artist</th>
              <th>Album</th>
              <th>Act Count</th>
              <th>Last Acted At</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {tasks.map(task => (
              <tr key={task.task_sub_id}>
                <td>
                  <select
                      value={task.task_status ?? ""}
                      onChange={(e) => handleStatusChange(task.task_sub_id ?? "", e.target.value) } >
                      {Object.entries(CodeTaskStatus).map(([key, label]) => (
                          <option key={key} value={key}>{label}</option>
                      ))}
                  </select>
                </td>
                <td>{CodeMusicTaskType[task.task_sub_type ?? ""]}</td>
                <td className="numeric-field">{task.task_priority}</td>
                <td>
                  <button
                      className="button-link"
                      onClick={() => handleShowArtist(task.artist_id ?? "", task.artist_name ?? "")}>
                    {task.artist_name}
                  </button>
                </td>
                <td>
                  <button
                      className="button-link"
                      onClick={() => handleShowAlbums(task.artist_id ?? "", task.artist_name ?? "", task.album_id ?? "", task.album_name ?? "")}>
                    {task.album_name}
                  </button>
                </td>
                <td className="numeric-field">{task.action_count}</td>
                <td>{formatDateTime(task.last_acted_at, "yyyy/MM/dd")}</td>
                <td>
                  <button
                      className="button-page"
                      onClick={() => handleShowForm(task.task_sub_id || "")} >
                    <FileText className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="block sm:hidden">
        <div className="div-card-area">
          {tasks.map(task => (
            <div key={task.task_sub_id} className="div-card">
              <div className="div-card-row">
                <label className={"card-label w-30 " + getTaskStatusClass(task.task_status ?? "")}>
                  {CodeTaskStatus[task.task_status ?? ""] + (task.task_status !== "0" ? " (" + task.task_priority + ")" : "")}
                </label>
                <div className="flex items-center card-label bg-blue-100 w-30">
                  {CodeMusicTaskType[task.task_sub_type ?? ""] + (task.task_status === "0" ? " (" + task.task_priority + ")" : "")}
                </div>
              </div>
              <div className="div-card-row">
                {task.artist_name}
              </div>
              <div className="div-card-row">
                <button
                    className="button-link card-title"
                    onClick={() => handleShowForm(task.task_id ?? "")}>
                  {task.album_name}
                </button>
              </div>
              {task.last_acted_at && (
                <div className="div-card-row">
                  <AlarmClockCheck size={14} />
                  {formatDateTime(task.last_acted_at, "yyyy/MM/dd")}
                  <span>&ensp;{"(" + task.action_count + ")"}</span>
                </div>
              )}
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
    </div>
  )
}
