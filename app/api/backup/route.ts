import { NextResponse } from 'next/server'

import { supabase } from '@/lib/supabaseAdmin'

export async function GET() {
  console.log('start::backup')
  await backupTable('mt11_artists')
  await backupTable('mt21_albums')
  await backupTable('mt31_tracks')
  await backupTable('ct01_tasks')
  console.log('end::backup')
  return NextResponse.json({ ok: true })
}

async function backupTable(tableName: string) {
  console.log('start:::backupTable:::' + tableName)
  const { data, error } = await supabase.rpc('backup_' + tableName);
  if (error) console.log('backupTable failed:::' + tableName)
  else console.log('end:::backupTable:::' + tableName + '>>', data, 'data copied.')
}
