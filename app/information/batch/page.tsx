'use client'

import { Suspense, useEffect, useState } from 'react'

import { fetchBatchLogs } from '@/actions/information/batch-actions'
import { Breadcrumb } from '@/components/Breadcrumb'
import { checkUser } from '@/contexts/RooterContext'
import type { BatchLogsView } from '@/types/information/batch-types'
import { formatDateTime } from '@/utils/dateFormat'

const Page = () => {
  return (
    <Suspense fallback={<div>Loading batch monitor...</div>}>
      <BatchMonitor />
    </Suspense>
  )
}
export default Page

const BatchMonitor = () => {

  const [batchLogs, setBatchLogs] = useState<BatchLogsView[]>([])

  const checkLogin = async () => {
    await checkUser()
  }

  const loadData = async () => {
    const fetchData = await fetchBatchLogs()
    setBatchLogs(fetchData)
  }

  useEffect(() => {
    checkLogin()
    loadData()
  }, [])

  return (
    <div className="root-panel">
      <Breadcrumb />
      <h2 className="header-title">Batch Monitor</h2>
      <div className="border-y divide-y">
        {batchLogs.map((batchLog, index) => (
          <div key={index}
              className={(batchLog.job_status ?? 0) > 0 ? "flex flex-col gap-1 border-b py-1" : "flex flex-col gap-1 border-b py-1 text-red-600"}>
            <div className="flex items-center gap-4">
              <span className="w-40">{formatDateTime(batchLog.job_executed_at, "yyyy/MM/dd HH:mm:ss")}</span>
              <span className="w-120">{batchLog.job_id}::{batchLog.job_sub_id}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="w-40">{batchLog.job_status}</span>
              <span className="flex-1">{batchLog.job_message}</span>
            </div>
          </div>
          // <div key={(batchLog.job_id  ?? "") + (batchLog.job_sub_id ?? "")}
          //     className="flex flex-col gap-1 border-b py-2">
          //   <div className="flex items-center gap-4">
          //     <span>{formatDateTime(batchLog.job_executed_at, "yyyy/MM/dd HH:mm")}</span>
          //     <span>{batchLog.job_id}</span>
          //     <span>{batchLog.job_sub_id}</span>
          //   </div>
          //   <div className="flex items-center gap-4">
          //     <span>{batchLog.job_status}</span>
          //     <span>{batchLog.job_message}</span>
          //   </div>
          // </div>
        ))}
      </div>
    </div>
  )
}
