'use client'

import { useRouter } from 'next/navigation'

import { logout } from '@/actions/user/user-action'
import { useConfirmModal } from '@/contexts/ConfirmModalContext'
import { useHistory } from '@/contexts/HistoryContext'

export const useCustomBack = () => {
  const router = useRouter()
  const { history, removeLastHistory } = useHistory()
  
  const { setIsModalOpen, setModalMessage, setConfirmHandler } = useConfirmModal()

  const handleBack = (isEdited: boolean) => {
    if (history.length === 0) {
      router.push('/home')
      return
    }
    const lastHistory = history[history.length - 1]
    if (isEdited) {
        setModalMessage('You have unsaved changes. Are you sure you want to leave this page?')
        setConfirmHandler(() => {
          removeLastHistory(-1)
          router.push(lastHistory.path)
        })
        setIsModalOpen(true)
    } else {
        removeLastHistory(-1)
        router.push(lastHistory.path)
    }
  }

  return { handleBack }
}

export const useLogoff = () => {
  const { setIsModalOpen, setModalMessage, setConfirmHandler } = useConfirmModal()
  const router = useRouter()

  const handleLogoff = () => {
    setModalMessage('Are you sure you want to logoff?')
    setConfirmHandler(async () => {
      await logout()
      router.push('/login')
    })
    setIsModalOpen(true)
  }
  return { handleLogoff }
}