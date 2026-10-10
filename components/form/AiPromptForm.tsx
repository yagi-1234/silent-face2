'use client'

import { useEffect, useState } from 'react'
import { Check } from 'lucide-react'

import { fetchAiPrompt, mergeAiPrompt } from '@/actions/common/ai-action'
import { AiPrompt, initialAiPrompt } from '@/types/common/common-types'

interface AiPromptFormProps {
  promptId: string
  onSave: (promptText: string) => void
}

export function AiPromptForm({ promptId, onSave }: AiPromptFormProps) {

  // const codes = useCodes('ExerciseType')
  const [aiPrompt, setAiPrompt] = useState<AiPrompt>(initialAiPrompt)

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = event.target
    setAiPrompt(prev => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    await mergeAiPrompt(aiPrompt)
    onSave(aiPrompt.prompt_text || '')
  }

  const loadData = async () => {
    if (promptId) {
      const fetchData = await fetchAiPrompt(promptId)
      setAiPrompt(fetchData)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  return (
    <div className="w-80 md:w-168">
      <div className="div-input-row">
        <label htmlFor="prompt_text" className="input-label">Prompt</label>
        <textarea id="prompt_text"
            name="prompt_text"
            rows={10}
            value={aiPrompt.prompt_text ?? ''}
            onChange={handleChange} >
        </textarea>
      </div>
      <div className="flex justify-end items-center">
        <button className="button-save" onClick={handleSave}>
          <Check size={16}/>
        </button>
      </div>
    </div>
  )
}
