import React from 'react'
import { useRouter } from 'next/navigation'
import { ChevronRight, House } from 'lucide-react'

import { useConfirmModal } from '@/contexts/ConfirmModalContext'
import { useHistory } from '@/contexts/HistoryContext'

interface BreadcrumbProps {
  edited?: boolean
}

export const Breadcrumb = ({ edited }: BreadcrumbProps) => {
  const router = useRouter();
  const { history, removeLastHistory } = useHistory()

  const { setIsModalOpen, setModalMessage, setConfirmHandler } = useConfirmModal()
  const handleClick = (index: number, path: string) => {
    if (edited) {
      setModalMessage('You have unsaved changes. Are you sure you want to leave this page?')
      setConfirmHandler(() => {
        removeLastHistory(index)
        router.push(path);
      })
      setIsModalOpen(true)
    } else {
      removeLastHistory(index)
      router.push(path)
    }
  }

  return (
    <nav className="text-sm text-gray-600" aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center space-x-1">
        <li key="0" className="flex items-center">
          <button
              className="button-link"
              onClick={() => handleClick(0, "/home")}>
            <House className="w-4 h-4 mr-2" />
          </button>
        </li>
        <ChevronRight className="w-4 h-4 mx-1" />
        {history.map((item, index) => {
          const isLast = index === history.length - 1;
          return (
            <li key={index} className="flex items-center">
              {index > 0 && <ChevronRight className="w-4 h-4 mx-1" />}
              <button
                className="button-link"
                onClick={() => handleClick(index, item.path)}>
                {item.title}
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
