import { isLoggedIn } from '@/actions/user/user-action'
import { redirect } from 'next/navigation'

export const checkUser = async () => {
  const result = await isLoggedIn()
  if (!result) redirect('/login')
}