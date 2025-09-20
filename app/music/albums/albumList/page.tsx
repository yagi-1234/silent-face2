'use client'

import { Suspense, useEffect, useState } from 'react'
import { ArrowLeft, ChevronsUp, ChevronsDown, FileText, Plus, Search, OctagonX } from 'lucide-react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'

import { fetchAlbums, formatAlbumTypeOrNo } from '@/actions/music/album-action'
import { Breadcrumb } from '@/components/Breadcrumb'
import ConfirmModal from '@/components/ConfirmModal'
import HiddenPanel from '@/components/HiddenPanel'
import { useHistory } from '@/contexts/HistoryContext'
import MessageBanner from '@/components/MessageBanner'
import { useMessage } from '@/contexts/MessageContext'
import { checkUser } from '@/contexts/RooterContext'
import { Album, AlbumCondition, initialAlbumCondition } from '@/types/music/album-types'
import { CodeOwnedFlag } from '@/utils/codeUtils'
import { formatDateTime } from '@/utils/dateFormat'
import { useCustomBack } from '@/utils/navigationUtils'

const Page = () => {
  return (
    <Suspense fallback={<div>Loading artist list...</div>}>
      <AlbumList />
    </Suspense>
  )
}
export default Page

const AlbumList = () => {

  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const { message, setMessage, messageType, errors } = useMessage()
  const [hiddenPanelOpen, setHiddenPanelOpen] = useState(false)
  const { addToHistory } = useHistory()
  const { handleBack } = useCustomBack()
  const [showAdvanced, setShowAdvanced] = useState(false)

  const [albums, setAlbums] = useState<Album[]>([])
  const [condition, setCondition] = useState<AlbumCondition>(initialAlbumCondition)

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked, type } = event.target
    setCondition(prev => ({
      ...prev, 
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSearch = async () => {
    const query = new URLSearchParams()
    if (condition.artist_id) query.append('artist_id', condition.artist_id)
    if (condition.artist_name) query.append('artist_name', condition.artist_name)
    if (condition.artist_name_exact_match) query.append('artist_name_exact_match', 'true')
    if (condition.album_id) query.append('artist_id', condition.album_id)
    if (condition.album_name) query.append('artist_id', condition.album_name)
    if (condition.album_name_exact_match) query.append('album_name_exact_match', 'true')
    if (condition.album_type) query.append('album_type', 'true')
    if (condition.owned_flag) query.append('owned_flag', 'true')
    if (condition.random_count) query.append('random_count', condition.random_count.toString())
    router.push(`/music/albums/albumList?${query.toString()}`)
    const fetchData = await fetchAlbums(condition)
    setAlbums(fetchData)
  }

  const handleClear = () => {
    setCondition(initialAlbumCondition)
    setAlbums([])
  }

  const handleShowForm = (albumId: string) => {
    addToHistory({ title: 'albumList', path: `${pathname}?${searchParams.toString()}`})
    if (albumId)
      router.push(`/music/albums/albumForm?album_id=${albumId}`)
    else if (condition.artist_id)
      router.push(`/music/albums/albumForm?artist_id=${condition.artist_id}`)
    else if (albums[0].artist_id)
      router.push(`/music/albums/albumForm?artist_id=${albums[0].artist_id}`)
    else
      router.push("/music/albums/albumForm")
  }

  const handleShowTracks = (artistId: string, artistName: string, albumId: string, albumName: string) => {
    addToHistory({ title: 'albumList', path: `${pathname}?${searchParams.toString()}`})
    router.push(`/music/tracks/trackList?artist_id=${artistId}&artist_name=${artistName}&album_id=${albumId}&album_name=${albumName}`)
  }

  const checkLogin = async () => {
    await checkUser()
  }
  useEffect(() => {
    checkLogin()
    const loadData = async () => {
      const condition1 = {
        ...condition,
        artist_id: searchParams.get('artist_id') ?? '',
        artist_name: searchParams.get('artist_name') ?? '',
        artist_name_exact_match: searchParams.get('artist_name_exact_match') ? true : false,
        album_id: searchParams.get('album_id') ?? '',
        album_name: searchParams.get('album_name') ?? '',
        album_name_exact_match: searchParams.get('album_name_exact_match') ? true : false,
        album_type: searchParams.get('album_type') ? true : false,
        owned_flag: searchParams.get('owned_flag') ? true : false,
        random_count: searchParams.get('random_count') ? Number(searchParams.get('random_count')) : null,
      }
      setCondition(condition1)
      const fetchData = await fetchAlbums(condition1)
      setAlbums(fetchData)
    }
    loadData()

    const handler = (e: WindowEventMap["keydown"]) => {
      if (e.ctrlKey && e.altKey && e.key === 'd')
        setHiddenPanelOpen(prev => !prev)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])
  
  return (
    <div className="root-panel">
      <MessageBanner
          message={message}
          type={messageType}
          errors={errors}
          onClose={() => setMessage('')} />
      <Breadcrumb />
      <h2 className="header-title">Album List</h2>
      <div className="searchPanel">
        <div className="input-form">
          <label htmlFor="artist_name"
              className={condition.artist_id ? "label-fixed" : ""}>
            Artist Name
          </label>
          <input type="text"
              id="artist_name"
              name="artist_name"
              value={condition.artist_name}
              className={condition.artist_id ? "input-fixed" : ""}
              readOnly={!!condition.artist_id}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSearch()
              }}
              onChange={handleSearchChange} />
          <label className="input-check-label">
            <input type="checkbox"
                id="artist_name_exact_match"
                name="artist_name_exact_match"
                checked={condition.artist_name_exact_match}
                onChange={handleSearchChange} />
            <span>Exact Match</span>
          </label>
        </div>
        <div className="input-form">
          <label htmlFor="album_name">Album Name</label>
          <input type="text"
              id="album_name"
              name="album_name"
              value={condition.album_name}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSearch()
              }}
              onChange={handleSearchChange} />
          <label className="input-check-label">
            <input type="checkbox"
                id="album_name_exact_match"
                name="album_name_exact_match"
                checked={condition.album_name_exact_match}
                onChange={handleSearchChange} />
            <span>Exact Match</span>
          </label>
          <button className="w-10 h-10 absolute left-215"
              onClick={() => setShowAdvanced(!showAdvanced)}>
            {showAdvanced ? 
                <ChevronsUp size={16} />
              :
                <ChevronsDown size={16} />
            }
          </button>
          {!showAdvanced && (
            <>
              <button className="button-search w-20 absolute left-224"
                  onClick={handleSearch}>
                <Search size={16} />
              </button>
              <button className="button-normal absolute left-246"
                  onClick={handleClear}>
                <OctagonX size={16} />
              </button>
            </>
          )}
        </div>
        {showAdvanced && (
          <>
            <div className="input-form">
              <label htmlFor="album_type">Album Type</label>
              <label className="input-check-label">
                <input type="checkbox"
                    name="album_type"
                    checked={condition.album_type}
                    onChange={handleSearchChange} />
                <span>Studio Album</span>
              </label>
              <label htmlFor="owned_flag" className="w-20">Owned</label>
              <label className="input-check-label w-10">
                <input type="checkbox"
                    name="owned_flag"
                    checked={condition.owned_flag}
                    onChange={handleSearchChange} />
              </label>
              <label htmlFor="randomFlag">Random Search</label>
              <input type="number"
                  id="random_count"
                  name="random_count"
                  className="numeric-field w-30"
                  value={condition.random_count ?? ''}
                  onChange={handleSearchChange} />
              <button className="button-search w-20 absolute left-224"
                  onClick={handleSearch}>
                <Search size={16} />
              </button>
              <button className="button-normal absolute left-246"
                  onClick={handleClear}>
                <OctagonX size={16} />
              </button>
            </div>
          </>
        )}
      </div>
      <table>
        <thead>
          <tr>
            <th>Artist Name</th>
            <th>Album No</th>
            <th>Released</th>
            <th>Album Name</th>
            <th>Owned</th>
            <th>Tracks</th>
            <th>Length</th>
            <th>Score</th>
            <th>Last Listened At</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {albums.map((album) => (
            <tr key={album.album_id}>
              <td>{album.artist_name_1}</td>
              <td>{formatAlbumTypeOrNo(album.album_type, album.album_no)}</td>
              <td>{formatDateTime(album.released, "yyyy/MM/dd")}</td>
              <td>{album.album_name_1}</td>
              <td className="text-center">{CodeOwnedFlag[album.owned_flag]}</td>
              <td className="numeric-field">
                <button
                    className="button-link"
                    onClick={() => handleShowTracks(album.artist_id, album.artist_name_1, album.album_id, album.album_name_1)}>
                  {album.track_count}
                </button>
              </td>
              <td>{album.track_length}</td>
              <td>{album.album_point ? album.album_point.toFixed(2) : ""}</td>
              <td>{formatDateTime(album.last_listened_at, "yyyy/MM/dd")}</td>
              <td>
                <button
                    className="button-page"
                    onClick={() => handleShowForm(album.album_id)} >
                  <FileText className="w-5 h-5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="footer-area">
        <div className="footer-area-sub">
          <div className="footer-left">
            <button className="button-back"
                onClick={() => handleBack(false)}>
              <ArrowLeft size={16} />
            </button>
          </div>
          <div>
            <button className="button-save"
                onClick={() => handleShowForm("")}>
              <Plus size={16} />
            </button>
          </div>
        </div>
      </div>
      <ConfirmModal />
      <HiddenPanel
          isOpen={hiddenPanelOpen}
          content={
              <>
                condition:<br /> {JSON.stringify(condition)}<br />
              </>
          } />
    </div>
  )
}
