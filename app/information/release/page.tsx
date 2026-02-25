'use client'

import { Suspense, useEffect, useState } from 'react'
import { ArrowLeft, Calendar, Clock, FileText, History, Plus, Search, OctagonX, Star } from 'lucide-react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'

import { fetchReleases } from '@/actions/information/information-action'
import { Breadcrumb } from '@/components/Breadcrumb'
import ConfirmModal from '@/components/ConfirmModal'
import HiddenPanel from '@/components/HiddenPanel'
import { useHistory } from '@/contexts/HistoryContext'
import MessageBanner from '@/components/MessageBanner'
import { ToggleButton } from '@/components/ToggleButton'
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { useMessage } from '@/contexts/MessageContext'
import { checkUser } from '@/contexts/RooterContext'
import { ReleaseView } from '@/types/information/information-types'
import { formatDateTime } from '@/utils/dateFormat'
import { useCustomBack } from '@/utils/navigationUtils'
import { ellipsis, isEllipsed } from '@/utils/viewUtils'

const Page = () => {
  return (
    <Suspense fallback={<div>Loading release list...</div>}>
      <ReleaseList />
    </Suspense>
  )
}
export default Page

const ReleaseList = () => {

  const [releases, setReleases] = useState<ReleaseView[]>([])

  const checkLogin = async () => {
    await checkUser()
  }

  const loadData = async () => {
    const fetchData = await fetchReleases()
    setReleases(fetchData)
  }

  useEffect(() => {
    checkLogin()
    loadData()
  }, [])

  return (
    <div className="root-panel">
      <Breadcrumb />
      <h2 className="header-title">Release List</h2>
      <div className="border-y divide-y">
        {releases.map(release => (
          <div key={release.release_id} className="p-2">
            <div className="p-0.5">
              <div>
                {formatDateTime(release.release_date, "yyyy/MM/dd")}
              </div>
            </div>
            <div className="grid grid-cols-[80px_1fr] p-0.5">
              <div>{"ver. " + release.version}</div>
              <div>{release.release_comment}</div>
            </div>
            {/* <div className="grid grid-cols-[120px_120px_1fr] p-0.5">
              <div>{"ver. " + release.version}</div>
              <div>{release.release_comment}</div>
              <div>{release.release_comment}</div>
            </div> */}
          </div>
        ))}
      </div>
    </div>
  )
}
//grid grid-cols-2 gap-4 p-2"
// rounded-lg border p-3 shadow-sm