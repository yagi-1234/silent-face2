'use client'

import { createContext, useContext, useEffect, useState } from 'react'

import { fetchCodes } from '@/actions/master/master-action'
import { CodeView } from '@/types/master/master-types'

const MasterContext = createContext<CodeView[]>([])

export const MasterProvider = ({ children } : { children: React.ReactNode }) => {

  const [codes, setCodes] = useState<CodeView[]>([])

  useEffect(() => {
    const load = async () => {
      const result = await fetchCodes('ArtistGrade')
      setCodes(result)
    }
    load()
  }, [])
  return (
    <MasterContext.Provider value={codes}>
      {children}
    </MasterContext.Provider>
  )
}

export const useCodes = () => useContext(MasterContext)
