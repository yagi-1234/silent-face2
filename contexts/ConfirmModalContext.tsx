'use client'

import React, { createContext, useContext, useRef, useState } from 'react'

type ConfirmModalType = {
  modalName: string
  setModalName: (modalName: string) => void
  isModalOpen: boolean
  setIsModalOpen: (isOpen: boolean) => void
  modalMessage: string
  setModalMessage: (message: string) => void
  onModalConfirm: () => void
  onModalCancel: () => void
  setConfirmHandler: (fn: () => void) => void
}

const ConfirmModalContext = createContext<ConfirmModalType | undefined>(undefined)

export const ConfirmModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [modalName, setModalName] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMessage, setModalMessage] = useState('')

  const confirmHandlerRef = useRef<() => void>(() => {})
  const setConfirmHandler = (fn: () => void) => {
    confirmHandlerRef.current = fn
  }

  const onModalConfirm = () => {
    confirmHandlerRef.current?.()
    setIsModalOpen(false)
  }
  const onModalCancel = () => {
    setIsModalOpen(false)
  }

  return (
    <ConfirmModalContext.Provider
        value={{ modalName, setModalName, isModalOpen, setIsModalOpen, modalMessage, setModalMessage, onModalConfirm, onModalCancel, setConfirmHandler }}>
      {children}
    </ConfirmModalContext.Provider>
  )
}


export const useConfirmModal = (): ConfirmModalType => {
  const context = useContext(ConfirmModalContext)
  if (!context)
    throw new Error('useConfirmModal must be used within a ConfirmModalProvider')
  return context
}