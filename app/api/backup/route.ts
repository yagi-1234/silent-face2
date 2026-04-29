import { NextResponse } from 'next/server'

import { supabase } from '@/lib/supabaseAdmin'

export async function GET() {
  console.log('start::backup')
  await backupTable('mt11_artists')
  await backupTable('mt21_albums')
  await backupTable('mt31_tracks')
  await backupTable('ct01_tasks')
  await backupTable('ct02_music_tasks')
  await backupTable('tt03_events')
  console.log('end::backup')
  return NextResponse.json({ ok: true })
}

async function backupTable(tableName: string) {
  console.log('start:::backupTable:::' + tableName)
  const { data, error } = await supabase.rpc('backup_' + tableName);
  if (error) {
    console.log('backupTable failed:::' + tableName)
    await insertBackupResult(tableName, -100, 'backupTable failed...')
  }
  else {
    console.log('end:::backupTable:::' + tableName + '>>', data, 'data copied.')
    await insertBackupResult(tableName, 100, 'backupTable success >> ' + data + 'data copied.')
  }
}

async function insertBackupResult(tableName: string, jobStatus: number, jobMessage: string) {
  const { data, error } = await supabase.from('ct02_batch_logs').insert({
    job_id: 'backupTables',
    job_sub_id: tableName,
    job_executed_at: new Date(),
    job_status: jobStatus,
    job_message: jobMessage,
    created_at: new Date(),
    updated_at: new Date(),
    updated_count: 0
  })
  if (error) console.error('Error insertBackupResult:', error)
}
