import { NextResponse } from 'next/server'

import { supabase } from '@/lib/supabase'

export async function GET() {
  console.log('testtesttest')
  copyArtist()
  return NextResponse.json({ ok: true })
}

async function copyArtist() {

}