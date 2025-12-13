'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { ArrowLeft, FileText, Plus, Search } from 'lucide-react'

import { fetchItems, fetchItemMst } from '@/actions/library/library-action'
import { Breadcrumb } from '@/components/Breadcrumb'
import ConfirmModal from '@/components/ConfirmModal'
import MessageBanner from '@/components/MessageBanner'
import { useHistory } from '@/contexts/HistoryContext'
import { useMessage } from '@/contexts/MessageContext'
import { checkUser } from '@/contexts/RooterContext'
import { CodeCompletedFlag, CodeOwnedFlag, CodeLibraryGrade, CodeTaskType, CodeTaskStatus } from '@/utils/codeUtils'
import { formatDateTime } from "@/utils/dateFormat"
import { useCustomBack } from '@/utils/navigationUtils'
import { LibraryItem, LibraryItemMst, LibraryCondition, initialLibraryCondition } from '@/types/library/library-types'
import { ellipsis } from '@/utils/viewUtils'

const Page = () => {
  return (
    <Suspense fallback={<div>Loading library list...</div>}>
      <LibraryList />
    </Suspense>
  )
}
export default Page

const LibraryList = () => {

  const { handleBack } = useCustomBack()
  const { addToHistory } = useHistory()
  const { message, setMessage, messageType, setMessageType, errors } = useMessage()
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const inLibraryType = searchParams.get('library_type') ?? ''

  const [items, setItems] = useState<LibraryItem[]>([])
  const [itemMst, setItemMst] = useState<LibraryItemMst>()
  const [condition, setCondition] = useState<LibraryCondition>(initialLibraryCondition)

  const loadMst = async () => {
    const fetchData = await fetchItemMst(inLibraryType)
    setItemMst(fetchData)
  }

  const loadData = async () => {
    const condition1 = {
      ...condition,
      library_type: searchParams.get('library_type') ?? '',
      item_type: searchParams.get('item_type') ?? '',
      item_name: searchParams.get('item_name') ?? '',
      task_status: searchParams.get('task_status') ?? ''
    }
    setCondition(condition1)
    const fetchData = await fetchItems(condition1)
    setItems(fetchData)
  }

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement|HTMLSelectElement>) => {
    const { name, value } = event.target
    setCondition(prev => ({
      ...prev, 
      [name]: value
    }))
  }

  const handleShowTask = (taskId: string) => {
    addToHistory({ title: CodeTaskType[inLibraryType] + ' List', path: `${pathname}?${searchParams.toString()}`})
    router.push(`/tasks/tasks/taskForm?task_id=${taskId}`)
  }

  const handleShowForm = (itemId: string) => {
    addToHistory({ title: CodeTaskType[inLibraryType] + ' List', path: `${pathname}?${searchParams.toString()}`})
    if (itemId) router.push(`/library/libraryForm?library_type=${inLibraryType}&item_id=${itemId}`)
    else router.push(`/library/libraryForm?library_type=${inLibraryType}`)
  }

  const handleSearch = async () => {
    const query = new URLSearchParams()
    if (condition.library_type) query.append('library_type', condition.library_type)
    if (condition.item_type) query.append('item_type', condition.item_type)
    if (condition.item_name) query.append('item_name', condition.item_name)
      if (condition.task_status) query.append('item_name', condition.task_status)
    router.push(`/library/libraryList?${query.toString()}`)
    const fetchData = await fetchItems(condition)
    console.log("fetchData", fetchData[0])
    setItems(fetchData)
  }

  const checkLogin = async () => {
    await checkUser()
  }

  useEffect(() => {
    checkLogin()
    loadMst()
    loadData()
  }, [])

  return (
    <div className="root-panel">
      <MessageBanner
          message={message}
          type={messageType}
          errors={errors}
          onClose={() => setMessage('')} />
      <Breadcrumb />
      <h2 className="header-title">{CodeTaskType[inLibraryType]} List</h2>
      <div className="searchPanel">
        {itemMst?.item_type && 
          <div className="input-form">
            <label htmlFor="item_type">{itemMst?.item_type}</label>
            <input type="text"
                id="item_type"
                name="item_type"
                className="w-24"
                value={condition.item_type ?? ''}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch()
                }}
                onChange={handleSearchChange} />
          </div>
        }
        <div className="input-form">
          <label htmlFor="item_name">{itemMst?.item_name}</label>
          <input type="text"
              id="item_name"
              name="item_name"
              value={condition.item_name ?? ''}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch()
              }}
              onChange={handleSearchChange} />
        </div>
        <div className="input-form">
          <label htmlFor="task_status">Task Status</label>
          <select
              id="task_status"
              name="task_status"
              className="w-48"
              value={condition.task_status ?? ''}
              onChange={(e) => handleSearchChange(e)}>
            <option key="" value=""></option>
            {Object.entries(CodeTaskStatus)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
            ))}
          </select>
          <button className="button-search"
              onClick={handleSearch}>
            <Search size={16} />
          </button>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            {itemMst?.item_type && <th>{itemMst.item_type}</th> }
            <th>{itemMst?.item_name}</th>
            {itemMst?.item_name_2 && <th></th> }
            <th>{itemMst?.author_name}</th>
            <th>{itemMst?.author_name_2}</th>
            <th>{itemMst?.owner_name}</th>
            <th>{itemMst?.actors_1}</th>
            <th>{itemMst?.released}</th>
            {itemMst?.volumes && <th>{itemMst.volumes}</th> }
            {itemMst?.completed_flag && <th>{itemMst.completed_flag}</th> }
            <th>{itemMst?.genre}</th>
            {itemMst?.owned_flag && <th>{itemMst.owned_flag}</th> }
            <th>Grade</th>
            <th>Progress</th>
            <th>{itemMst?.action_count}</th>
            <th>{itemMst?.last_actioned_at}</th>
            <th>Tasked</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.item_id}>
              {itemMst?.item_type && 
                <td>{item.item_type}</td>
              }
              <td>{item.item_name_1}</td>
              {itemMst?.item_name_2 && 
                <td>{ellipsis(item.item_name_2, 24)}</td> 
              }
              <td>{item.author_name_1}</td>
              <td>{item.author_name_2}</td>
              <td>{item.owner_name}</td>
              <td>{item.actors_1}</td>
              <td>{formatDateTime(item.released, "yyyy/MM/dd")}</td>
              {itemMst?.volumes && <td className="numeric-field">{item.volumes}</td> }
              {itemMst?.completed_flag && <td className="numeric-field">{CodeCompletedFlag[item.completed_flag]}</td> }
              <td>{item.genre}</td>
              {itemMst?.owned_flag && 
                <td className="text-center">{CodeOwnedFlag[item.owned_flag]}</td>
              }
              <td>{CodeLibraryGrade[item.grade ?? ""]}</td>
              <td className="numeric-field">{item.progress}</td>
              <td className="numeric-field">{item.action_count}</td>
              <td>{formatDateTime(item.last_actioned_at, "yyyy/MM/dd")}</td>
              <td className="numeric-field">
                <button
                    className="button-link"
                    onClick={() => handleShowTask(item.task_id ?? "")}>
                  {CodeTaskStatus[item.task_status ?? ""]}
                </button>
              </td>
              <td>
                <button
                    className="button-page"
                    onClick={() => handleShowForm(item.item_id)} >
                  <FileText className="w-5 h-5" />
                </button>
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
    </div>
  )
}
