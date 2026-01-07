import { NextResponse } from 'next/server'

import { supabase } from '@/lib/supabaseAdmin'

export async function GET() {
  console.log('start backup')
  await copyArtist()
  console.log('end backup')
  return NextResponse.json({ ok: true })
}

async function copyArtist() {
  console.log('start copyArtist')
  const { data, error } = await supabase.rpc('backup_mt11_artist');
  if (error) console.log('copyArtist failed')
  else console.log(data)
  console.log('end copyArtist')
}
