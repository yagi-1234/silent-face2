import { supabase } from '@/lib/supabase'

import { NoteRow, NoteView } from '@/types/tasks/note-typtes'

export const fetchNote = async (noteId: string): Promise<NoteView> => {
  let query = supabase
      .from('tt04_notes')
      .select('*')
      .eq('note_id', noteId)
      .single()
  const { data: result, error } = await query
  if (error) {
    console.error('Error fetchNote:', error)
    throw error
  }
  return result
}

export const fetchNotes = async (): Promise<NoteView[]> => {
  let query = supabase
      .from('tt04_notes')
      .select('*')
  query = query.order('updated_at' , { ascending: false })
  query = query.limit(1000)
  const { data: result, error } = await query
  if (error) {
    console.error('Error fetchNotes:', error)
    return []
  }
  return result
}

export const mergeNote = async (newData: NoteView): Promise<NoteView> => {
  if (newData.note_id) {
    const result = await updateNote(newData)
    return fetchNote(result.note_id || '')
  } else {
    const result = await insertNote(newData)
    return fetchNote(result.note_id || '')
  }
}

const insertNote = async (newData: NoteView): Promise<NoteRow> => {
  const insertData = copyViewToRecord(newData, 'i')
  console.log('insertData:', insertData)
  const { data: result, error } = await supabase
      .from('tt04_notes')
      .insert(insertData)
      .select()
      .single()
  if (error || !result) {
    console.error('Error insertNote:', error)
    throw(error)
  }
  console.log('insertNote Complete Result:', result)
  return result
}

const updateNote = async (newData: NoteView): Promise<NoteRow> => {
  const updateData = copyViewToRecord(newData, 'u')
  console.log('updateData:', updateData)
  const { data: result, error } = await supabase
      .from('tt04_notes')
      .update(updateData)
      .eq('note_id', newData.note_id)
      .select()
      .single()
  if (error || !result) {
    console.error('Error updateNote:', error)
    throw(error)
  }
  console.log("updateNote Complete Result:", result)
  return result
}
export const deleteNote = async (deleteData: NoteView) => {
  console.log('deleteData:', deleteData)
  const { data: result, error } = await supabase
      .from('tt04_notes')
      .delete()
      .eq('note_id', deleteData.note_id)
  if (error) {
    console.error('Error deleteNote:', error)
    throw(error)
  }
  console.log('deleteNote Complete Result:')
}

const copyViewToRecord = (view: NoteView, processType: string): Partial<NoteRow> => {
  const nowDate = new Date()
  const {
    ...row
  } = view
  switch (processType) {
    case "i": {
      const { note_id, ...insertData } = {
        ...row,
        created_at: nowDate,
        updated_at: nowDate,
      }
      return insertData
    }
    case "u": {
      return {
        ...row,
        updated_at: nowDate,
        updated_count: Number(row.updated_count ?? 0) + 1
      }
    }
  }
  return row
}