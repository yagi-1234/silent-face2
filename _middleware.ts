import { NextRequest, NextResponse } from 'next/server'

import { checkUser } from '@/actions/user/user-action'

export async function middleware(request: NextRequest) {

  if (request.nextUrl.pathname === '/login') {
    return NextResponse.next()
  }

  const isLoggedIn = await checkUser()
  if (isLoggedIn)
    return NextResponse.redirect(new URL('/login', request.url))
  
  return NextResponse.next()
}