'use client'

import { Suspense, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogIn } from 'lucide-react'

import { login, logout, makeUser, validateUser } from '@/actions/user/user-action'
import MessageBanner from '@/components/MessageBanner'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { useMessage } from '@/contexts/MessageContext'
import { User } from '@/types/user/user-types'

const Page = () => {
  return (
    <Suspense fallback={<div>Loading login...</div>}>
      <LoginForm />
    </Suspense>
  )
}
export default Page

const LoginForm = () => {

  const { message, setMessage, messageType, setMessageType, errors, setErrors } = useMessage()
  const router = useRouter()

  const [userData, setUserData] = useState<User>({
    user_id: '',
    user_name: '',
    password: '',
  })

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setUserData(prev => ({
      ...prev, [name]: value
    }))
  }

  const handleLogin = async () => {
    const validationErrors = validateUser(userData.user_name, userData.password)
    if (0 < Object.keys(validationErrors).length) {
      setMessage('Enter User Name and Password')
      setMessageType('error')
      setErrors(validationErrors)
      return
    }
    // await makeUser(userData.user_name, userData.password)
    // await logout()

    const result = await login(userData.user_name, userData.password)
    if (result) {
      router.push(`/home`)
    } else {
      setMessage('Login denied')
      setMessageType('error')
    }
  }

  return (
    <div className="root-panel">
      <MessageBanner
          message={message}
          type={messageType}
          errors={errors}
          onClose={() => setMessage('')} />
      <h2 className="header-title">Login</h2>
      <Card className="w-[500px]">
        <CardContent className="space-y-4">
          <div className="input-form">
            <label htmlFor="user_name">User Name</label>
            <input type="text"
                id="user_name"
                name="user_name"
                value={userData?.user_name}
                onChange={handleChange} />
          </div>
          <div className="input-form">
            <label htmlFor="password">Password</label>
            <input type="password"
                id="password"
                name="password"
                value={userData?.password}
                onChange={handleChange} />
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full"
              onClick={handleLogin}>
            Login
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
