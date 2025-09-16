'use client'

import type { NextPage } from 'next'

import { AlarmClockCheck, BookImage, BookOpenText, BookText, Clapperboard, Download, Gamepad2, Users, FileAudio, Music, MicVocal, SquareLibrary, Tv } from 'lucide-react'

import HomeIconButton from '@/components/HomeIconButton'

const Page: NextPage = () => {

  return (
    <div className="root-panel">
      <div className="bg-white rounded-2xl w-240 p-6">
        <h2 className="text-xl font-semibold mb-4">This is Home</h2>
      </div>

      <div className='flex items-center my-6'>
        <div className='flex-grow border-t border-gray-300'></div>
        <span className='mx-4 text-gray-500'>Task</span>
        <div className='flex-grow border-t border-gray-300'></div>
      </div>

      <div className='grid grid-cols-6 gap-10 text-center'>
        <HomeIconButton icon={AlarmClockCheck} label="Task List (New)" path="/tasks/tasks/taskList" />
      </div>
    </div>
  )
}

export default Page