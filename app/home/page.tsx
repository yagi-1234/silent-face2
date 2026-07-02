'use client'

import { useEffect } from 'react'
import type { NextPage } from 'next'
import { AlarmClockCheck, BookImage, BookMarked, BookOpenText, BookText, Calendar, Clapperboard, Database, Disc3, Download, Gamepad2, 
    Hamburger, Info, Music, MicVocal, NotebookPen, SquareLibrary, Tv, ScanHeart, Server, Settings, Users} from 'lucide-react'
import { useRouter } from 'next/navigation'

import HomeIconButton from '@/components/HomeIconButton'
import { checkUser } from '@/contexts/RooterContext'

const Page: NextPage = () => {

  const router = useRouter()

  const checkLogin = async () => {
    await checkUser()
  }

  const handleShowBatchMonitor = () => {
    router.push('/information/batch')
  }
  const handleShowMaster = () => {
    router.push('/master/masterList')
  }
  const handleShowReleases = () => {
    router.push('/information/release')
  }

  useEffect(() => {
    checkLogin()
  }, [])

  return (
    <div className="root-panel">
      <div className="flex">
        <div className="flex-1">
          <h2 className="header-title">This is Home</h2>
        </div>
        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-2">
          <Server size={20} onClick={handleShowBatchMonitor} />
        </div>
        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-2">
          <Settings size={20} onClick={handleShowReleases} />
        </div>
        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-2">
          <Database size={20} onClick={handleShowMaster} />
        </div>
        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
          <Info size={20} onClick={handleShowReleases} />
        </div>
      </div>

      <div className="flex items-center my-6">
        <div className="flex-grow border-t border-gray-300"></div>
        <span className="mx-4 text-gray-500">Task</span>
        <div className="flex-grow border-t border-gray-300"></div>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-10 text-center">
        <HomeIconButton icon={AlarmClockCheck} label="Tasks" path="/tasks/tasks/taskListNew" />
        <HomeIconButton icon={AlarmClockCheck} label="Music Tasks" path="/tasks/music/musicTaskList" />
        <HomeIconButton icon={Calendar} label="Events" path="/tasks/events/eventList" />
        <HomeIconButton icon={NotebookPen} label="Notes" path="/tasks/notes/noteList" />
        <HomeIconButton icon={AlarmClockCheck} label="Tasks (Old)" path="/tasks/tasks/taskList" />
      </div>

      <div className="flex items-center my-6">
        <div className="flex-grow border-t border-gray-300"></div>
        <span className="mx-4 text-gray-500">Music</span>
        <div className="flex-grow border-t border-gray-300"></div>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-10 text-center">
        <HomeIconButton icon={Users} label="Artists" path="/music/artists/artistList" />
        <HomeIconButton icon={Disc3} label="Albums" path="/music/albums/albumList" />
        <HomeIconButton icon={Music} label="Tracks" path="/music/tracks/trackList" />
        <HomeIconButton icon={MicVocal} label="Lives" path="/tasks/events/eventList?event_type=01" />
        <HomeIconButton icon={SquareLibrary} label="Playlists" path="/music/playlists/playlistsList" />
        <div className="hidden sm:block">
          <HomeIconButton icon={Download} label="Track Import" path="/music/tracks/trackImport2" />
        </div>
      </div>

      <div className="flex items-center my-6">
        <div className="flex-grow border-t border-gray-300"></div>
        <span className="mx-4 text-gray-500">Libraries</span>
        <div className="flex-grow border-t border-gray-300"></div>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-10 text-center">
        <HomeIconButton icon={BookText} label="Books" path="/library/libraryList?library_type=02" />
        <HomeIconButton icon={BookImage} label="Comics" path="/library/libraryList?library_type=03" />
        <HomeIconButton icon={Clapperboard} label="Movies" path="/library/libraryList?library_type=04" />
        <HomeIconButton icon={Tv} label="Drama" path="/library/libraryList?library_type=05" />
        <HomeIconButton icon={Gamepad2} label="Games" path="/library/libraryList?library_type=06" />
        <HomeIconButton icon={BookOpenText} label="Magazine" path="/library/libraryList?library_type=07" />
      </div>

      <div className="flex items-center my-6">
        <div className="flex-grow border-t border-gray-300"></div>
        <span className="mx-4 text-gray-500">Others</span>
        <div className="flex-grow border-t border-gray-300"></div>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-10 text-center">
        <HomeIconButton icon={ScanHeart} label="Health" path="/health/healthList" />
        <HomeIconButton icon={Hamburger} label="Eatings" path="/health/eatingList" />
        <HomeIconButton icon={BookMarked} label="IT Studies" path="/study/it/itStudies" />
      </div>
    </div>
  )
}

export default Page