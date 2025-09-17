'use client'

import React, { createContext, useContext, useState } from 'react'

type HistoryItem = {
  title: string
  path: string
}

type HistoryContextType = {
  history: HistoryItem[]
  addToHistory: (item: HistoryItem) => void
  removeLastHistory: (index: number) => void
  clearHistory: () => void
}

const HistoryContext = createContext<HistoryContextType | undefined>(undefined)

export const HistoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [history, setHistory] = useState<HistoryItem[]>([])

  const addToHistory = (item: HistoryItem) => {
    setHistory(prev => [...prev, item])
  }
  const removeLastHistory = (index: number) => {
    setHistory(prev => prev.slice(0, index))
  }
  const clearHistory = () => {
    setHistory([])
  }

  return (
    <HistoryContext.Provider value={{ history, addToHistory, removeLastHistory, clearHistory }}>
      {children}
    </HistoryContext.Provider>
  )
}

export const useHistory = () => {
  const context = useContext(HistoryContext)
  if (!context) throw new Error ('useHistory must be used within a HistoryProvider')
  return context
}