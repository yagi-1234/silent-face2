'use client'

import { createContext, useContext, useEffect, useState } from 'react'

import { fetchCodes } from '@/actions/master/master-action'
import { CodeView } from '@/types/master/master-types'

type CodesMap = Record<string, CodeView[]>

const MasterContext = createContext<CodesMap>({})

export const MasterProvider = ({ children } : { children: React.ReactNode }) => {

  const [codes, setCodes] = useState<CodesMap>({})

  useEffect(() => {
    const load = async () => {
      const codeTypes = ['ArtistType', 'ArtistGrade', 'ExerciseType']
      const results = await Promise.all(
        codeTypes.map(async (codeType) => {
          const result = await fetchCodes(codeType)
          return { codeType, result }}
        )
      )
      const newCodes: CodesMap = {}
      results.forEach(({ codeType, result }) => {
        newCodes[codeType] = result
      })
      setCodes(newCodes)
    }
    load()
  }, [])
  return (
    <MasterContext.Provider value={codes}>
      {children}
    </MasterContext.Provider>
  )
}

export const useCodes = (codeType: string): CodeView[] => {
  const codes = useContext(MasterContext)
  return codes[codeType] ?? []
}
