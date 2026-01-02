import { NextResponse } from 'next/server'

export async function GET() {
  console.log('testtesttest')
  return NextResponse.json({ ok: true })
}
