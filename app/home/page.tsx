'use client'

import type { NextPage } from 'next'

import { AlarmClockCheck, BookImage, BookOpenText, BookText, Clapperboard, Download, Gamepad2, Users, FileAudio, Music, MicVocal, SquareLibrary, Tv } from 'lucide-react'

import HomeIconButton from '@/components/HomeIconButton'

const Page: NextPage = () => {

  return (
    <div className="root-panel">
      <h2 className="header-title">This is Home</h2>

      <div className='flex items-center my-6'>
        <div className='flex-grow border-t border-gray-300'></div>
        <span className='mx-4 text-gray-500'>Task</span>
        <div className='flex-grow border-t border-gray-300'></div>
      </div>

      <div className='grid grid-cols-6 gap-10 text-center'>
        <HomeIconButton icon={AlarmClockCheck} label="Task List" path="/tasks/tasks/taskList" />
        <HomeIconButton icon={AlarmClockCheck} label="Music Task" path="/tasks/music/musicTaskList" />
      </div>

      <div className='flex items-center my-6'>
        <div className='flex-grow border-t border-gray-300'></div>
        <span className='mx-4 text-gray-500'>Musica</span>
        <div className='flex-grow border-t border-gray-300'></div>
      </div>

      <div className='grid grid-cols-6 gap-10 text-center'>
        <HomeIconButton icon={Users} label="Artists" path="/music/artists/artistList" />
        <HomeIconButton icon={FileAudio} label="Discography" path="/music/albums/albumList" />
        <HomeIconButton icon={Music} label="Tracks" path="/music/tracks/trackList" />
        <HomeIconButton icon={MicVocal} label="Lives" path="" />
        <HomeIconButton icon={SquareLibrary} label="Playlists" path="" />
        <HomeIconButton icon={Download} label="Track Import" path="/music/tracks/trackImport" />
      </div>

      <div className='flex items-center my-6'>
        <div className='flex-grow border-t border-gray-300'></div>
        <span className='mx-4 text-gray-500'>Libraries</span>
        <div className='flex-grow border-t border-gray-300'></div>
      </div>
      <div className='grid grid-cols-6 gap-10 text-center'>
        <HomeIconButton icon={BookText} label="Books" path="/library/libraryList?library_type=02" />
        <HomeIconButton icon={BookImage} label="Comics" path="/library/libraryList?library_type=03" />
        <HomeIconButton icon={Clapperboard} label="Movies" path="/library/libraryList?library_type=04" />
        <HomeIconButton icon={Tv} label="Drama" path="/library/libraryList?library_type=05" />
        <HomeIconButton icon={Gamepad2} label="Games" path="/library/libraryList?library_type=06" />
        <HomeIconButton icon={BookOpenText} label="Magazine" path="/library/libraryList?library_type=07" />
      </div>
    </div>
  )
}

export default Page