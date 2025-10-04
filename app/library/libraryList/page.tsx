'use client'

import { Suspense, useEffect, useState } from 'react'
import type { NextPage } from 'next'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { ArrowLeft, FileText, Plus } from 'lucide-react'

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
import { LibraryItem, LibraryItemMst } from '@/types/library/library-types'

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

  const loadMst = async () => {
    const fetchData = await fetchItemMst(inLibraryType)
    setItemMst(fetchData)
  }

  const loadData = async () => {
    const fetchData = await fetchItems(inLibraryType)
    setItems(fetchData)
  }

  const handleShowForm = (itemId: string) => {
    addToHistory({ title: CodeTaskType[inLibraryType] + ' List', path: `${pathname}?${searchParams.toString()}`})
    if (itemId) router.push(`/library/libraryForm?library_type=${inLibraryType}&item_id=${itemId}`)
    else router.push(`/library/libraryForm?library_type=${inLibraryType}`)
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

      </div>
      <table>
        <thead>
          <tr>
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
              <td>{item.item_name_1}</td>
              {itemMst?.item_name_2 && <td>{item.item_name_2}</td> }
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
              <td>{CodeTaskStatus[item.task_status]}</td>
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
