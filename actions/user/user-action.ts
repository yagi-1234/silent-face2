import { supabase } from '@/lib/supabase'
import { createServerActionClient } from '@supabase/auth-helpers-nextjs'

import type { ValidationErrors } from '@/types/common/common-types'

export const login = async (userName: string, password: string): Promise<string> => {

  const { data, error } = await supabase.auth.signInWithPassword({
    email: userName,
    password: password
  })
  if (error) console.error('login error:', error.message)
  return data.user ? data.user.id : ''
}

export const logout = async () => {
  await supabase.auth.signOut()
  console.log('Logout Completed.')
}

export const makeUser = async (userName: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email: userName,
    password: password
  })
  if (error) console.error('makeUser error:', error.message)
}

export const isLoggedIn = async (): Promise<boolean> => {
  const { data: { session } } = await supabase.auth.getSession()
  console.log('isLoggedIn:', session?.user.id ? 'Yes' : 'No')
  if (session?.user.id) return true
  return false
}

export const getUserId = async (): Promise<string> => {
  const { data: { user } } = await supabase.auth.getUser()
  return user ? user.id : ''
}

export const validateUser = (userName: string, password: string): ValidationErrors => {
  const errors: ValidationErrors = {}
  if (!userName.trim()) errors.userName = 'User Name is required.'
  if (!password.trim()) errors.password = 'Password is required.'
  return errors
}