'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { AlarmClockCheck, ArrowLeft, AtSign, CalendarCheck, FileText, OctagonX, 
    Pen, Plus, Search, Spotlight, Star } from 'lucide-react'

import { fetchItems, fetchItemsCount, fetchItemMst } from '@/actions/library/library-action'
import { Breadcrumb } from '@/components/Breadcrumb'
import ConfirmModal from '@/components/ConfirmModal'
import MessageBanner from '@/components/MessageBanner'
import { EllipsisAndTooltip } from '@/components/EllipsisAndTooltip'
import SelectButton from '@/components/SelectButton'
import { useHistory } from '@/contexts/HistoryContext'
import { useMessage } from '@/contexts/MessageContext'
import { checkUser } from '@/contexts/RooterContext'
import { CodeCompletedFlag, CodeOwnedMagazineFlag, CodeLibraryGrade, CodeTaskType, CodeTaskStatus, OrderLibraryList } from '@/utils/codeUtils'
import { formatDateTime } from "@/utils/dateFormat"
import { useCustomBack } from '@/utils/navigationUtils'
import { LibraryItem, LibraryItemMst, LibraryCondition, initialLibraryCondition } from '@/types/library/library-types'
import PagingControl from '@/components/PagingControl'

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
  const [currentPageNo, setCurrentPageNo] = useState<number>(0)
  const [totalPages, setTotalPages] = useState<number>(0)

  const loadMst = async () => {
    const fetchData = await fetchItemMst(inLibraryType)
    setItemMst(fetchData)
  }

  const loadDataCount = async (condition1: LibraryCondition) => {
    const fetchCount = await fetchItemsCount(condition1)
    setTotalPages(Math.floor(fetchCount / 20) + 1)
  }

  const loadData = async (condition1: LibraryCondition, pageNo: number) => {
    setCurrentPageNo(pageNo)
    const fetchData = await fetchItems(condition1, pageNo)
    setItems(fetchData)
  }

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement|HTMLSelectElement>) => {
    const { name, value, type } = event.target
    let newValue = value
    if (type === 'checkbox') newValue = event.target.checked ? '1' : '0'
    setCondition(prev => ({
      ...prev, 
      [name]: newValue
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

  const handleClear = () => {
    const condition1 = {
      ...initialLibraryCondition,
      library_type: searchParams.get('library_type') ?? '',
    }
    setCondition(condition1)
    setItems([])
    setCurrentPageNo(0)
    setTotalPages(0)
  }

  const handleSearch = async () => {
    const query = new URLSearchParams()
    if (condition.library_type) query.append('library_type', condition.library_type)
    if (condition.item_type) query.append('item_type', condition.item_type)
    if (condition.item_name) query.append('item_name', condition.item_name)
    if (condition.task_status) query.append('item_name', condition.task_status)
    if (condition.actioned) query.append('actioned', condition.actioned)
    if (condition.not_actioned) query.append('not_actioned', condition.not_actioned)
    if (condition.order_condition) query.append('order_condition', condition.order_condition)
    router.push(`/library/libraryList?${query.toString()}`)
    setCurrentPageNo(0)
    loadDataCount(condition)
    loadData(condition, 0)
  }

  const handleSelectPage = async (pageNo: number) => {
    router.push(`${pathname}?${searchParams.toString()}&page=${pageNo}`)
    loadData(condition, pageNo)
  }

  const checkLogin = async () => {
    await checkUser()
  }

  useEffect(() => {
    checkLogin()
    loadMst()
    const condition1 = {
      ...condition,
      library_type: searchParams.get('library_type') ?? '',
      item_type: searchParams.get('item_type') ?? '',
      item_name: searchParams.get('item_name') ?? '',
      task_status: searchParams.get('task_status') ?? '',
      actioned: searchParams.get('actioned') ?? '',
      not_actioned: searchParams.get('not_actioned') ?? '',
      order_condition: searchParams.get('order_condition') ?? '',
    }
    setCondition(condition1)
    loadDataCount(condition1)
    loadData(condition1, searchParams.get('page') ? Number(searchParams.get('page')) : 0)
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
      <div>
        {itemMst?.item_type &&
          <div className="div-input-row">
            <label htmlFor="item_type" className="input-label">{itemMst?.item_type}</label>
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
        <div className="div-input-row">
          <label htmlFor="item_name" className="input-label">{itemMst?.item_name}</label>
          <input type="text"
              id="item_name"
              name="item_name"
              className="w-full sm:w-160"
              value={condition.item_name ?? ''}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch()
              }}
              onChange={handleSearchChange} />
        </div>
        <div className="hidden sm:block">
          <div className="div-input-row">
            <div className="div-row-left">
              <div className="w-60">
                <label htmlFor="task_status" className="input-label">Task Status</label>
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
              </div>
              <div>
                <label htmlFor="actioned" className="input-label">Not Actioned</label>
                <div className="flex flex-wrap gap-x-4 gap-y-2">
                  <label className="input-check-label">
                    <input type="checkbox"
                        id="actioned"
                        name="actioned"
                        className="w-5"
                        checked={condition.actioned === '1'}
                        value={condition.actioned}
                        onChange={handleSearchChange} />
                    <span>actioned</span>
                  </label>
                  <label className="input-check-label">
                    <input type="checkbox"
                        id="not_actioned"
                        name="not_actioned"
                        className="w-5"
                        checked={condition.not_actioned === '1'}
                        value={condition.not_actioned}
                        onChange={handleSearchChange} />
                    <span>not_actioned</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="block sm:hidden">
          <div className="div-input-row">
            <div className="div-row-left">
              <div className="w-60">
                <label htmlFor="task_status" className="input-label">Task Status</label>
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
              </div>
            </div>
          </div>
          <div className="div-input-row">
            <label htmlFor="actioned" className="input-label">Not Actioned</label>
            <label className="input-check-label">
              <input type="checkbox"
                  id="actioned"
                  name="actioned"
                  className="w-5"
                  checked={condition.actioned === '1'}
                  value={condition.actioned}
                  onChange={handleSearchChange} />
              <span className="mr-4">actioned</span>
              <input type="checkbox"
                  id="not_actioned"
                  name="not_actioned"
                  className="w-5"
                  checked={condition.not_actioned === '1'}
                  value={condition.not_actioned}
                  onChange={handleSearchChange} />
              <span>not actioned</span>
            </label>
          </div>
        </div>
        <div>
          <div className="flex justify-between items-center">
            <div>
              <label htmlFor="order" className="input-label">Order</label>
              <div className="div-row-left">
                <SelectButton
                    options={OrderLibraryList}
                    value={condition.order_condition}
                    onChange={(val) => (setCondition(prev => ({...prev, order_condition: val})))} />
              </div>
            </div>
            <div>
              <span>　</span>
              <div className="div-row-right">
                <button className="button-normal"
                    onClick={handleClear}>
                  <OctagonX size={16} />
                </button>
                <button className="button-search"
                    onClick={handleSearch}>
                  <Search size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="hidden sm:block">
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
              {/* <th>Progress</th> */}
              <th>{itemMst?.last_actioned_at}</th>
              <th>Tasked</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.item_id}>
                {itemMst?.item_type && 
                  <td>{item.item_type}</td>
                }
                <td>{EllipsisAndTooltip(item.item_name_1, 30)}</td>
                {itemMst?.item_name_2 && 
                  <td>{EllipsisAndTooltip(item.item_name_2, 16)}</td>
                }
                <td>{EllipsisAndTooltip(item.author_name_1, 12)}</td>
                <td>{EllipsisAndTooltip(item.author_name_2, 12)}</td>
                <td>{EllipsisAndTooltip(item.owner_name, 8)}</td>
                <td>{EllipsisAndTooltip(item.actors_1, 12)}</td>
                <td>{formatDateTime(item.released, "yyyy/MM/dd")}</td>
                {itemMst?.volumes && <td className="numeric-field">{item.volumes}</td> }
                {itemMst?.completed_flag && <td className="numeric-field">{CodeCompletedFlag[item.completed_flag]}</td> }
                <td>{EllipsisAndTooltip(item.genre, 8)}</td>
                {itemMst?.owned_flag && 
                  <td className="text-center">{CodeOwnedMagazineFlag[item.owned_flag]}</td>
                }
                <td>{CodeLibraryGrade[item.grade ?? ""]}</td>
                {/* <td className="numeric-field">{item.progress}</td> */}
                <td>{item.action_count ?? 0 > 0 ? formatDateTime(item.last_actioned_at, "yyyy/MM/dd") + " (" + item.action_count + ")" : ""}</td>
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
        <PagingControl
            totalPages={totalPages}
            currentPageNo={currentPageNo}
            onSelectPage={(pageNo) => handleSelectPage(pageNo)} />
      </div>
      <div className="block sm:hidden">
        <div className="div-card-area">
          {items.map(item => (
            <div key={item.item_id} className="div-card">
              <div className="div-card-row">
                <button
                    className="button-link card-title"
                    onClick={() => handleShowForm(item.item_id)}>
                  {item.item_name_1}
                </button>
              </div>
              {itemMst?.item_name_2 &&
                <div className="div-card-row">{item.item_name_2}</div>
              }
              {item.author_name_1 &&
                <div className="div-card-row">
                  <Pen size={14} />
                  {item.author_name_1}
                  {item.author_name_2 &&
                    <>
                      <span>&ensp;/&ensp;</span>
                      {item.author_name_2}
                    </>
                  }
                </div>
              }
              {item.owner_name &&
                <div className="div-card-row">
                  <AtSign size={14} />
                  {item.owner_name}
                </div>
              }
              {item.actors_1 &&
                <div className="div-card-row">
                  <Spotlight size={14} />
                  {item.actors_1}
                </div>
              }
              <div className="div-card-row">
                <CalendarCheck size={14} />
                {formatDateTime(item.released, "yyyy/MM/dd")}
                {itemMst?.volumes &&
                  <>
                    <span>&ensp;</span>
                    Vol.{item.volumes}
                  </>
                }
                {itemMst?.completed_flag &&
                  <>
                    {item.completed_flag === "1" ? "Completed" : ""}
                  </>
                }
                {itemMst?.owned_flag &&
                  <>
                    <span>&ensp;</span>
                    {"Owned " + CodeOwnedMagazineFlag[item.owned_flag]}
                  </>
                }
              </div>
              <div className="div-card-row">
                <Star size={14} />
                {CodeLibraryGrade[item.grade ?? ""]}
                <span>&ensp;</span>
                <AlarmClockCheck size={14} />
                {formatDateTime(item.last_actioned_at, "yyyy/MM/dd")}
                <span>&ensp;{"(" + item.action_count + ")"}</span>
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
    </div>
  )
}
