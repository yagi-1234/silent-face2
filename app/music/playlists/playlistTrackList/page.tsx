'use client'

import React from 'react'
import { Suspense, useEffect, useState } from 'react'
import clsx from 'clsx';
import { ArrowLeft, Check, CircleMinus, CirclePlus, CopyPlus, Menu } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

import { fetchPlaylist, copyPlaylist, mergePlaylist, fetchPlaylistTracks, mergePlaylistTracks } from '@/actions/music/playlist-action'
import { Breadcrumb } from '@/components/Breadcrumb'
import ConfirmModal from '@/components/ConfirmModal'
import HiddenPanel from '@/components/HiddenPanel'
import MessageBanner from '@/components/MessageBanner'
import { useConfirmModal } from '@/contexts/ConfirmModalContext'
import { useMessage } from '@/contexts/MessageContext'
import { checkUser } from '@/contexts/RooterContext'
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { PlaylistView, initialPlaylist, PlaylistTrackView, initialPlaylistTrack } from '@/types/music/playlist-types'
import { useCustomBack } from '@/utils/navigationUtils'
import { ellipsis } from '@/utils/viewUtils'

const Page = () => {
  return (
    <Suspense fallback={<div>Loading playlistTrack list...</div>}>
      <PlaylistTrackList />
    </Suspense>
  )
}
export default Page

const PlaylistTrackList = () => {

  const { setIsModalOpen, setModalMessage, setConfirmHandler } = useConfirmModal()
  const { handleBack } = useCustomBack()
  const { message, setMessage, messageType, setMessageType, errors } = useMessage()
  const searchParams = useSearchParams()
  const [hiddenPanelOpen] = useState(false)

  const [playlist, setPlaylist] = useState<PlaylistView>(initialPlaylist)
  const [playlistTracks, setPlaylistTracks] = useState<PlaylistTrackView[]>([])
  const [newPlaylistTrack, setNewPlaylistTrack] = useState<PlaylistTrackView>(initialPlaylistTrack)
  const [deletePlaylistTracks, setDeletePlaylistTracks] = useState<PlaylistTrackView[]>([])

  const inPlaylistId = searchParams.get('playlist_id') ?? ''

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setPlaylist(prev => ({
      ...prev,
      [name]: value ? value : null
    }))
  }

  const handleChangeTrack = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setNewPlaylistTrack(prev => ({
      ...prev,
      [name]: value ? value : null
    }))
  }

  const handleAdd = () => {
    const newData = {
      ...newPlaylistTrack,
      playlist_track_id: 'id' + newPlaylistTrack.album_name_1 + newPlaylistTrack.track_name_1,
      playlist_id: inPlaylistId,
      rank_no: playlistTracks.length - (newPlaylistTrack.play_order ?? 0) + 2,
      edit_mode: 'i',
    }
    setPlaylistTracks(prev => {
      const updated = prev.map(t => {
        if ((newData.play_order ?? 0) <= (t.play_order ?? 0)) {
          return {
            ...t,
            play_order: Number(t.play_order ?? 0) + 1,
            edit_mode: t.edit_mode ? t.edit_mode : 'u'
          }
        }
        if ((newData.rank_no ?? 0) !== (playlistTracks.length - (t.play_order ?? 0) + 2)) {
          return {
            ...t,
            rank_no: playlistTracks.length - (t.play_order ?? 0) + 2,
            edit_mode: t.edit_mode ? t.edit_mode : 'u'
          }
        }
        return t
      })
      updated.push(newData)
      updated.sort((a, b) => (a.play_order ?? Infinity) - (b.play_order ?? Infinity))
      console.log(updated)
      return updated
    })
    setNewPlaylistTrack(initialPlaylistTrack)
  }

  const handleSave = async () => {
    await mergePlaylist(playlist)
    await mergePlaylistTracks(playlistTracks, deletePlaylistTracks)
    await loadData(inPlaylistId)
  }

  const handleCopy = async () => {
    const playlistId = await copyPlaylist(playlist, playlistTracks)
    await loadData(playlistId)
  }

  const handleDelete = (playlistTrackId: string, playOrder :number) => {
    const deletePlaylistTrack = playlistTracks.find(t => t.playlist_track_id === playlistTrackId)
    if (deletePlaylistTrack) setDeletePlaylistTracks(prev => [...prev, deletePlaylistTrack])

    setPlaylistTracks(prev => {
      const filtered = prev.filter(t => t.play_order !== playOrder)
      const updated = filtered.map(t => {
        if (playOrder < (t.play_order ?? 0)) {
          return {
            ...t,
            play_order: (t.play_order ?? 0) -1,
            edit_mode: t.edit_mode ? t.edit_mode : 'u'
          }
        }
        if (playOrder > (t.play_order ?? 0)) {
          return {
            ...t,
            rank_no: playlistTracks.length - (t.play_order ?? 0),
            edit_mode: t.edit_mode ? t.edit_mode : 'u'
          }
        }
        return t
      })
      updated.sort((a, b) => (a.play_order ?? Infinity) - (b.play_order ?? Infinity))
      return updated
    })
  }

  const checkLogin = async () => {
    await checkUser()
  }

  const loadData = async (playlistId: string) => {
    const fetchData = await fetchPlaylist(playlistId)
    setPlaylist(fetchData)
    setPlaylistTracks([])
    const fetchData2 = await fetchPlaylistTracks(playlistId)
    setPlaylistTracks(fetchData2)
  }

  useEffect(() => {
    checkLogin()
    loadData(inPlaylistId)
  }, [])

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (active.id !== over?.id) {
      const oldIndex = playlistTracks.findIndex(playlistTrack => playlistTrack.playlist_track_id === active.id)
      const newIndex = playlistTracks.findIndex(playlistTrack => playlistTrack.playlist_track_id === over?.id)
      const newPlaylistTracks = arrayMove(playlistTracks, oldIndex, newIndex)

      const reordered = newPlaylistTracks.map((playlistTrack, index) => {
        const newPlayOrder = Number(index) + 1
        const newRankNo = playlistTracks.length - index
        const isChanged = (playlistTrack.play_order !== newPlayOrder) || (playlistTrack.rank_no !== newRankNo)
        return {
          ...playlistTrack,
          play_order: newPlayOrder,
          rank_no: newRankNo,
          edit_mode: (!playlistTrack.edit_mode && isChanged) ? 'u' : playlistTrack.edit_mode
        }
      })
      setPlaylistTracks(reordered)
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
      <h2 className="header-title">PlaylistTracks</h2>
      <div>
        <div className="input-form">
          <label htmlFor="playlist_name">
            Playlist Name
          </label>
          <input type="text"
              id="playlist_name"
              name="playlist_name"
              value={playlist.playlist_name ?? ''}
              onChange={handleChange} />
        </div>
      </div>
      <div className="searchPanel">
      </div>
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
            items={playlistTracks.map(playlistTrack => playlistTrack.playlist_track_id ?? "")}
            strategy={verticalListSortingStrategy}>
          <table>
            <thead>
              <tr>
                <th>Play Order</th>
                <th>Artist Name</th>
                <th>Album Name</th>
                <th>Track Name</th>
                <th>Entry</th>
                <th>Rank</th>
                <th>+/-</th>
                <th>Max</th>
                <th></th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {playlistTracks
                  .map((playlistTrack) => (
                <SortableRow
                    key={playlistTrack.playlist_track_id}
                    playlistTrack={playlistTrack} 
                    onDelete={id => handleDelete(id, playlistTrack.play_order ?? 0)} />
              ))}
              <tr>
                <td>
                  <input type="number"
                      name="play_order"
                      className='w-20 numeric-field'
                      value={newPlaylistTrack.play_order ?? ""}
                      onChange={handleChangeTrack} />
                </td>
                <td>
                  <input type="text"
                      name="artist_name_1"
                      value={newPlaylistTrack.artist_name_1 ?? ""}
                      onChange={handleChangeTrack} />
                </td>
                <td>
                  <input type="text"
                      name="album_name_1"
                      value={newPlaylistTrack.album_name_1 ?? ""}
                      onChange={handleChangeTrack} />
                </td>
                <td>
                  <input type="text"
                      name="track_name_1"
                      value={newPlaylistTrack.track_name_1 ?? ""}
                      onChange={handleChangeTrack} />
                </td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td>
                  <button
                      className="button-page"
                      onClick={() => handleAdd()}>
                    <CirclePlus className='w-5 h-5' />
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
          <div className="footer-right">
            <button className="button-second"
                onClick={handleCopy}>
              <CopyPlus size={16} />
            </button>
            <button className="button-save"
                onClick={handleSave}>
              <Check size={16} />
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
  playlistTrack: PlaylistTrackView
  onDelete: (id: string, playOrder: number) => void
}

const SortableRow = ({ playlistTrack, onDelete }: Props) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: playlistTrack.playlist_track_id ?? '',
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const setPrevRankCell = (rankNo: number | null, prevRankNo: number | null) => {
    let content = null
    if (prevRankNo && rankNo) {
      content = prevRankNo - rankNo
      if (content > 0) content = '+' + content
      if (content === 0) content = '±' + content
    }
    return content
  }

  return (
    <tr
        className={clsx(
          playlistTrack.edit_mode === "i" ? "text-red-400" : "",
          playlistTrack.edit_mode === "u" ? "text-blue-500" : "",
          playlistTrack.edit_mode === "d" ? "bg-gray-300" : ""
        )}
        ref={setNodeRef}
        style={style}>
      <td className="numeric-field">{playlistTrack.play_order}</td>
      <td>{ellipsis(playlistTrack.artist_name_1, 24)}</td>
      <td>{ellipsis(playlistTrack.album_name_1, 24)}</td>
      <td>{ellipsis(playlistTrack.track_name_1, 24)}</td>
      <td className="numeric-field">{playlistTrack.entry_count}</td>
      <td className="numeric-field">{playlistTrack.rank_no}</td>
      <td className="numeric-field">{setPrevRankCell(playlistTrack.rank_no, playlistTrack.prev_rank_no)}</td>
      <td className="numeric-field">
        {playlistTrack.max_rank_no}
        {playlistTrack.max_rank_count && playlistTrack.max_rank_count > 4 && (
          " (" + playlistTrack.max_rank_count + ")"
        )}
      </td>
      <td style={{ cursor: "grab" }}>
        {playlistTrack.edit_mode !== "d" && (
          <span {...attributes} {...listeners}>
            <Menu size={16} />
          </span>
        )}
      </td>
      <td>
        <button
            className="button-page"
            onClick={() => onDelete(playlistTrack.playlist_track_id ?? "", playlistTrack.play_order ?? 0)}>
          <CircleMinus className='w-5 h-5' />
        </button>
      </td>
    </tr>
  )
}
