import { NextResponse } from 'next/server'

import { supabase } from '@/lib/supabase'

export async function GET() {
  console.log('start backup')
  await copyArtist()
  console.log('end backup')
  return NextResponse.json({ ok: true })
}

async function copyArtist() {
  console.log('start copyArtist')
  const { error } = await supabase.rpc('mt11_artists_bk');
  if (error) console.log('copyArtist failed')
  else console.log('copyArtist success')
  console.log('end copyArtist')
}
