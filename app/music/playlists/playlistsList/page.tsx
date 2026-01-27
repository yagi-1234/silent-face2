'use client'

import React from 'react'
import { Suspense, useEffect, useState } from 'react'
import { ArrowLeft, FileText, Menu, ListPlus, Plus } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { fetchPlaylists, mergePlaylist, updatePlaylist } from '@/actions/music/playlist-action'
import { Breadcrumb } from '@/components/Breadcrumb'
import ConfirmModal from '@/components/ConfirmModal'
import HiddenPanel from '@/components/HiddenPanel'
import MessageBanner from '@/components/MessageBanner'
import { useConfirmModal } from '@/contexts/ConfirmModalContext'
import { useHistory } from '@/contexts/HistoryContext'
import { useMessage } from '@/contexts/MessageContext'
import { checkUser } from '@/contexts/RooterContext'
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { PlaylistView, initialPlaylist } from '@/types/music/playlist-types'
import { useCustomBack } from '@/utils/navigationUtils'
import { ellipsis } from '@/utils/viewUtils'

const Page = () => {
  return (
    <Suspense fallback={<div>Loading playlist list...</div>}>
      <PlaylistList />
    </Suspense>
  )
}
export default Page

const PlaylistList = () => {

  const { setIsModalOpen, setModalMessage, setConfirmHandler } = useConfirmModal()
  const { handleBack } = useCustomBack()
  const { addToHistory } = useHistory()
  const { message, setMessage, messageType, setMessageType, errors } = useMessage()
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [hiddenPanelOpen] = useState(false)
  const [playlists, setPlaylists] = useState<PlaylistView[]>([])
  const [newPlaylist, setNewPlaylist] = useState<PlaylistView>(initialPlaylist)
  const [newSubPlaylist, setNewSubPlaylist] = useState<PlaylistView>(initialPlaylist)
  const [showFormId, setShowFormId] = useState<string>()

  const checkLogin = async () => {
    await checkUser()
  }

  const loadData = async () => {
    const fetchData = await fetchPlaylists()
    setPlaylists(fetchData)
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setNewPlaylist(prev => ({
      ...prev,
      [name]: value ? value : null
    }))
  }
  
  const handleChangeSub = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setNewSubPlaylist(prev => ({
      ...prev,
      [name]: value ? value : null
    }))
  }

  const handlePlus = (parentPlaylistId: string) => {
    setShowFormId(parentPlaylistId)
  }

  const handleSave = (parentPlaylistId: string, playlistName: string, dispOrder: number) => {
    setModalMessage('Do you want to continue with this registration?')
    setConfirmHandler(async () => {
      const newData = {
        ...newPlaylist,
        playlist_name: playlistName,
        parent_playlist_id: parentPlaylistId ? parentPlaylistId : null,
        disp_order: parentPlaylistId ? dispOrder + 1 : dispOrder + 1000,
      }
      await mergePlaylist(newData)
      loadData()
      setMessage('Saved Successfully!')
      setMessageType('info')
      setShowFormId("")
      setNewPlaylist(prev => ({
        ...prev,
        playlist_name: "",
      }))
    })
    setIsModalOpen(true)
  }

  const handleShowTracks = (playlistId: string) => {
    addToHistory({ title: 'playlistList', path: `${pathname}?${searchParams.toString()}`})
    router.push(`/music/playlists/playlistTrackList?playlist_id=${playlistId}`)
  }

  useEffect(() => {
    checkLogin()
    loadData()
  }, [])

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (active.id !== over?.id) {
      const oldIndex = playlists.findIndex(row => row.playlist_id === active.id)
      const newIndex = playlists.findIndex(row => row.playlist_id === over?.id)
      if (playlists[oldIndex].parent_playlist_id === playlists[newIndex].parent_playlist_id) {
        const minIndex = oldIndex < newIndex ? oldIndex : newIndex
        const maxIndex = oldIndex < newIndex ? newIndex : oldIndex
        const newDispOrder = playlists.at(minIndex)?.disp_order ?? 0
        const newPlaylists = arrayMove(playlists, oldIndex, newIndex)

        const reordered = newPlaylists.map((row, index) => {
          return {
            ...row,
            disp_order: index >= minIndex && index <= maxIndex ? newDispOrder + (index - minIndex) : row.disp_order
          }
        })
        setPlaylists(reordered)
        await Promise.all(
          reordered.filter((row, index) => index >= minIndex && index <= maxIndex).
              map(row => updatePlaylist(row))
        )
      }
    }
  }

  return (
    <div className="root-panel">
      <MessageBanner
          message={message}
          type={messageType}
          errors={errors}
          onClose={() => setMessage('')} />
      <Breadcrumb />
      <h2 className="header-title">Playlists</h2>
      <div className="searchPanel">
      </div>
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
            items={playlists.map(row => row.playlist_id ?? "")}
            strategy={verticalListSortingStrategy}>
          <table>
            <thead>
              <tr>
                <th>Playlist Name</th>
                <th></th>
                <th></th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {playlists.map(playlist => (
                <SortableRow
                    key={playlist.playlist_id}
                    playlist={playlist} 
                    onShowTracks={playlist_id => handleShowTracks(playlist_id)}
                    onPlus={playlist_id => handleShowTracks(playlist_id)} />
              ))}
              <tr>
                <td>
                  <input type="text"
                      name="playlist_name"
                      value={newPlaylist.playlist_name ?? ""}
                      onChange={handleChange} />
                </td>
                <td>
                  <button
                      className="button-page"
                      onClick={() => handleSave("", newPlaylist.playlist_name ?? "", playlists.at(-1)?.disp_order ?? 0)}>
                    <Plus className='w-5 h-5' />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </SortableContext>
      </DndContext>
      <div className="footer-area">
        <div className="footer-area-sub">
          <div className="footer-left">
            <button className="button-back"
                onClick={() => handleBack(true)}>
              <ArrowLeft size={16} />
            </button>
          </div>
        </div>
      </div>
      <ConfirmModal />
      <HiddenPanel
          isOpen={hiddenPanelOpen}
          content={
              <>
              </>
          } />
    </div>
  )
}

type Props = {
  playlist: PlaylistView
  onShowTracks: (playlist_id: string) => void
  onPlus: (playlist_id: string) => void
}

const SortableRow = ({ playlist, onShowTracks, onPlus }: Props) => {

  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: playlist.playlist_id ?? '',
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <tr className="leading-none"
        ref={setNodeRef}
        style={style}>
      <td>
        {playlist.parent_playlist_id && (
          <span>&nbsp;&nbsp;</span>
        )}
        {ellipsis(playlist.playlist_name, 24)}
      </td>
      <td className='flex'>
        <div>
          <button
              className="button-page"
              onClick={() => onShowTracks(playlist.playlist_id ?? '')}>
            <FileText className='w-5 h-5' />
          </button>
        </div>
        <div className="w-8">
          {!playlist.parent_playlist_id && (
            <button
                className="button-page"
                onClick={() => onPlus(playlist.playlist_id ?? '')} >
              <ListPlus className="w-4 h-4" />
            </button>
          )}
        </div>
      </td>
      <td style={{ cursor: "grab" }}>
        <span {...attributes} {...listeners}>
          <Menu size={16} />
        </span>
      </td>
      <td>{playlist.disp_order}</td>
    </tr>
  )
}
