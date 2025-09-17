'use client'

import React, { createContext, useContext, useState } from 'react'

import { ValidationErrors } from '@/types/common/common-types'

type MessageType = 'success' | 'error' | 'warn' | 'info'

type MessageContextType = {
  message: string
  setMessage: (message: string) => void
  messageType: MessageType
  setMessageType: (messageType: MessageType) => void
  errors: ValidationErrors
  setErrors: (errors: ValidationErrors) => void
  isOpen: boolean
  setIsOpen: (onClose: boolean)=> void
}

const MessageContext = createContext<MessageContextType | undefined>(undefined)

export const MessageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<MessageType>('info')
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [isOpen, setIsOpen] = useState(true)

  return (
    <MessageContext.Provider
        value={{ message, setMessage, messageType, setMessageType, errors, setErrors, isOpen, setIsOpen }}>
      {children}
    </MessageContext.Provider>
  )
}

export const useMessage = (): MessageContextType => {
  const context = useContext(MessageContext)
  if (!context)
    throw new Error('useMessage must be used within a MessageProvider')
  return context
}