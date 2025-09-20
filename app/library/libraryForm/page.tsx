'use client'

import { Suspense, useEffect, useState } from 'react'
import type { NextPage } from 'next'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { ArrowLeft, ArrowRight, Check, Clock, Plus } from 'lucide-react'

import { fetchItem, mergeItem, fetchItemMst } from '@/actions/library/library-action'
import { Breadcrumb } from '@/components/Breadcrumb'
import ConfirmModal from '@/components/ConfirmModal'
import HiddenPanel from '@/components/HiddenPanel'
import MessageBanner from '@/components/MessageBanner'
import PartialDateInput from '@/components/PartialDateInput'
import { useConfirmModal } from '@/contexts/ConfirmModalContext'
import { useHistory } from '@/contexts/HistoryContext'
import { useMessage } from '@/contexts/MessageContext'
import { checkUser } from '@/contexts/RooterContext'
import { CodeOwnedFlag, CodeLibraryGrade, CodeTaskType } from '@/utils/codeUtils'
import { formatDateTime } from '@/utils/dateFormat'
import { useCustomBack } from '@/utils/navigationUtils'
import { LibraryItem, initialLibraryItem, LibraryItemMst } from '@/types/library/library-types'

const Page = () => {
  return (
    <Suspense fallback={<div>Loading library form...</div>}>
      <LibraryForm />
    </Suspense>
  )
}
export default Page

const LibraryForm = () => {

  const { handleBack } = useCustomBack()
  const { setIsModalOpen, setModalMessage, setConfirmHandler } = useConfirmModal()
  const { addToHistory } = useHistory()
  const { message, setMessage, messageType, setMessageType, errors } = useMessage()
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const inItemId = searchParams.get('item_id') ?? ''
  const inLibraryType = searchParams.get('library_type') ?? ''

  const [itemMst, setItemMst] = useState<LibraryItemMst>()
  const [item, setItem] = useState<LibraryItem>(initialLibraryItem)
  const [originalItem, setOriginalItem] = useState<LibraryItem>(initialLibraryItem)
  const [hiddenPanelOpen, setHiddenPanelOpen] = useState(false)

  const loadMst = async () => {
    const fetchData = await fetchItemMst(inLibraryType)
    setItemMst(fetchData)
  }

  const loadItem = async () => {
    if (inItemId) {
      const fetchData = await fetchItem(inItemId)
      setItem(fetchData)
      setOriginalItem(fetchData)
    }
    setItem(prev => ({
      ...prev, library_type: inLibraryType
    }))
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target
    setItem(prev => ({
      ...prev, [name]: value
    }))
  }
  const handleChangeDate = (value: string, name: string) => {
    setItem(prev => ({
      ...prev, [name]: value
    }))
  }

  const handlePlus = () => {
    setItem(prev => ({
      ...prev,
      action_count: prev.action_count == null ? 1 : Number(prev.action_count) + 1,
      last_actioned_at: new Date(),
    }))
  }

  const handleAddTask = () => {
    addToHistory({ title: CodeTaskType[item.library_type] + ' Form', path: `${pathname}?${searchParams.toString()}`})
    const queryPrams = new URLSearchParams()
    queryPrams.append('item_id', item.item_id)
    router.push(`/tasks/tasks/taskForm/?${queryPrams.toString()}`)
  }

  const handleSave = () => {
    setModalMessage('Do you want to continue with this registration?')
    setConfirmHandler(async () => {
      const result = await mergeItem(item)
      setItem(result)
      setOriginalItem(item)
      setMessage('Saved Successfully!')
      setMessageType('info')
    })
    setIsModalOpen(true)
  }

  const checkLogin = async () => {
    await checkUser()
  }

  useEffect(() => {
    checkLogin()
    loadMst()
    loadItem()
  }, [])

  return (
    <div className="root-panel">
      <MessageBanner
          message={message}
          type={messageType}
          errors={errors}
          onClose={() => setMessage('')} />
      <Breadcrumb />
      <h2 className="header-title">{CodeTaskType[item.library_type]} Form</h2>
      <p className="timestamp">{item.item_id ? "last updated at: " + formatDateTime(item.updated_at, 'yyyy/MM/dd HH:mm') + " (" + item.updated_count + ")" : '(Not registered)'}</p>
      <div className="input-form">
        <label htmlFor="item_name_1">{itemMst?.item_name}</label>
        <input type="text"
            id="item_name_1"
            name="item_name_1"
            value={item.item_name_1 ?? ''}
            onChange={handleChange} />
      </div>
      {itemMst?.item_name_2 &&
        <div className="input-form">
          <label htmlFor="item_name_2"></label>
          <input type="text"
              id="item_name_2"
              name="item_name_2"
              value={item.item_name_2 ?? ''}
              onChange={handleChange} />
        </div>
      }
      {itemMst?.author_name && 
        <div className="input-form">
          <label htmlFor="author_name_1">{itemMst?.author_name}</label>
          <input type="text"
              id="author_name_1"
              name="author_name_1"
              value={item.author_name_1 ?? ''}
              onChange={handleChange} />
        </div>
      }
      {itemMst?.author_name_2 && 
        <div className="input-form">
          <label htmlFor="author_name_2">{itemMst?.author_name_2}</label>
          <input type="text"
              id="author_name_2"
              name="author_name_2"
              value={item.author_name_2 ?? ''}
              onChange={handleChange} />
        </div>
      }
      {itemMst?.owner_name &&
        <div className="input-form">
          <label htmlFor="owner_name">{itemMst?.owner_name}</label>
          <input type="text"
              id="owner_name"
              name="owner_name"
              value={item.owner_name ?? ''}
              onChange={handleChange} />
        </div>
      }
      {itemMst?.source_name && 
        <div className="input-form">
          <label htmlFor="source_name">{itemMst?.source_name}</label>
          <input type="text"
              id="source_name"
              name="source_name"
              value={item.source_name ?? ''}
              onChange={handleChange} />
        </div>
      }
      {itemMst?.actors_1 && 
        <div className="input-form">
          <label htmlFor="actors_1">{itemMst?.actors_1}</label>
          <input type="text"
              id="actors_1"
              name="actors_1"
              value={item.actors_1 ?? ''}
              onChange={handleChange} />
        </div>
      }
      {itemMst?.actors_2 && 
        <div className="input-form">
          <label htmlFor="actors_2">{itemMst?.actors_2}</label>
          <input type="text"
              id="actors_2"
              name="actors_2"
              value={item.actors_2 ?? ''}
              onChange={handleChange} />
        </div>
      }
      {itemMst?.music && 
        <div className="input-form">
          <label htmlFor="music">{itemMst?.music}</label>
          <input type="text"
              id="music"
              name="music"
              value={item.music ?? ''}
              onChange={handleChange} />
        </div>
      }
      <div className="input-form">
        <label htmlFor="released">{itemMst?.released}</label>
        <PartialDateInput
            name="released"
            value={item.released ?? ''}
            onChange={handleChangeDate}
            mode="flexible" />
      </div>
      {itemMst?.volumes &&
        <div className="input-form">
          <label htmlFor="volumes">{itemMst?.volumes}</label>
          <input type="number"
              id="volumes"
              name="volumes"
              className="numeric-field text-sm"
              value={item.volumes ?? ''}
              onChange={handleChange} />
          {itemMst?.completed_flag &&
            <div>
              <label htmlFor="completed_flag">Completed</label>
              <input type="checkbox"
                  id="completed_flag"
                  name="completed_flag"
                  className="w-5"
                  checked={item.completed_flag === '1'}
                  value={item.completed_flag}
                  onChange={handleChange} />
            </div>
          }
        </div>
      }
      <div className="input-form">
        <label htmlFor="genre">Genre</label>
        <input type="text"
            id="genre"
            name="genre"
            value={item.genre ?? ''}
            onChange={handleChange} />
      </div>
      {itemMst?.owned_flag && 
        <div className="input-form">
          <label htmlFor="owned_flag">Owned</label>
          <select
              id="owned_flag"
              name="owned_flag"
              className="w-24"
              value={item.owned_flag}
              onChange={handleChange} >
            <option key="" value=""></option>
            {Object.entries(CodeOwnedFlag)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([key, label]) => (<option key={key} value={key}>{label}</option>
            ))}
          </select>
          <PartialDateInput
              name="added_at"
              value={formatDateTime(item.added_at, 'yyyy/MM/dd') ?? ''}
              onChange={handleChangeDate}
              mode="flexible" />
        </div>
      }
      <div className="input-form">
        <label htmlFor="grade">Grade</label>
        <select
            id="grade"
            name="grade"
            className="w-24"
            value={item.grade ?? ""}
            onChange={handleChange} >
          <option key="" value=""></option>
          {Object.entries(CodeLibraryGrade)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([key, label]) => (<option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>
      <div className="input-form">
        <label htmlFor="progress">Progress</label>
        <input type="number"
            id="progress"
            name="progress"
            className="numeric-field text-sm"
            value={item.progress ?? ''}
            onChange={handleChange} />
      </div>
      <div className="input-form">
        <label htmlFor="action_count">{itemMst?.action_count}</label>
        <button
            className="button-plus"
            onClick={handlePlus} >
          <Plus />
        </button>
        <input type="number"
            id="action_count"
            name="action_count"
            className="numeric-field text-sm"
            value={item.action_count ?? ''}
            onChange={handleChange} />
        <PartialDateInput
            name="last_actioned_at"
            value={formatDateTime(item.last_actioned_at, 'yyyy/MM/dd') ?? ''}
            onChange={handleChangeDate}
            mode="flexible" />
      </div>
      <div className="input-form-full">
        <label htmlFor="item_comment">Comment</label>
        <textarea id="item_comment"
            name="item_comment"
            rows={3}
            value={item.item_comment ?? ''}
            onChange={handleChange} >
        </textarea>
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
            <button className="button-second"
                disabled={!item.item_id}
                onClick={handleAddTask}>
              <ArrowRight size={14} />
              <span>&nbsp;</span>
              <Clock size={16} />
            </button>
            <button className="button-save"
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
              </>
          } />
    </div>
  )
}
