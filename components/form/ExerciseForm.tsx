'use client'

import { useEffect, useState } from 'react'
import { Check } from 'lucide-react'

import { fetchExercise, mergeExercise } from '@/actions/health/exercise-action'
import PartialDateInput from '@/components/PartialDateInput'
import { useCodes } from '@/contexts/MasterContext'
import { ExerciseView, initialExercise } from '@/types/health/exercise-types'
import { formatDateTime } from '@/utils/dateFormat'

interface ExerciseFormProps {
  exerciseId: string
  onSave: (exerciseId: string) => void
}

export function ExerciseForm({ exerciseId, onSave }: ExerciseFormProps) {

  const codes = useCodes('ExerciseType')
  const [exercise, setExercise] = useState<ExerciseView>(initialExercise)

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target
    setExercise(prev => ({ ...prev, [name]: value }))
  }
  const handleChangeDate = (value: string, name: string) => {
    setExercise(prev => ({
      ...prev, [name]: value
    }))
  }
  const handleSave = async () => {
    await mergeExercise(exercise)
    onSave(exerciseId)
  }

  const loadData = async () => {
    if (exerciseId && exerciseId !== 'new') {
      const fetchData = await fetchExercise(exerciseId)
      setExercise(fetchData)
    } else {
      setExercise(prev => ({
        ...prev,
        exercise_date: new Date()
      }))
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  return (
    <div className="w-80 md:w-168">
      <div className="div-input-row">
        <label htmlFor="exercise_date" className="input-label">Date</label>
        <div className="div-input-left">
          <PartialDateInput
              name="exercise_date"
              value={formatDateTime(exercise.exercise_date, "yyyy-MM-dd")}
              onChange={handleChangeDate} />
        </div>
      </div>
      <div className="div-input-row">
        <label htmlFor="exercise_content" className="input-label">Content</label>
        <select
            id="exercise_content"
            name="exercise_content"
            className="w-48"
            value={exercise.exercise_content ?? ""}
            onChange={handleChange}>
          <option value=""></option>
          {codes.map(row => (
            <option key={row.code_key} value={row.code_key ?? ""}>{row.code_value}</option>
          ))}
        </select>
      </div>
      <div className="div-input-row">
        <label htmlFor="exercise_content" className="input-label">Length</label>
        <input type="number"
            id="exercise_length"
            name="exercise_length"
            className="w-24 mr-2 numeric-field"
            value={exercise.exercise_length ?? ""}
            onChange={handleChange} />
        m
      </div>
      <div className="div-input-row">
        <label htmlFor="exercise_place" className="input-label">Place</label>
        <input type="text"
            id="exercise_place"
            name="exercise_place"
            className="w-80"
            value={exercise.exercise_place ?? ""}
            onChange={handleChange} />
      </div>
      <div className="flex justify-end items-center">
        <button className="button-save" onClick={handleSave}>
          <Check size={16}/>
        </button>
      </div>
    </div>
  )
}
