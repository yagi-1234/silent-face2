'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { ArrowLeft, AtSign, ChevronsUp, ChevronsDown, Disc3, FileText, History, Music, Plus, Star, Search } from 'lucide-react'

import { fetchArtists } from '@/actions/music/artist-action'
import { Breadcrumb } from '@/components/Breadcrumb'
import ConfirmModal from '@/components/ConfirmModal'
import HiddenPanel from '@/components/HiddenPanel'
import MessageBanner from '@/components/MessageBanner'
import { ToggleButton } from '@/components/ToggleButton'
import { useHistory } from '@/contexts/HistoryContext'
import { useMessage } from '@/contexts/MessageContext'
import { checkUser } from '@/contexts/RooterContext'
import { Artist, ArtistCondition, initialArtistCondition } from '@/types/music/artist-types'
import { CodeArtistType, CodeArtistGrade } from '@/utils/codeUtils'
import { formatDateTime } from '@/utils/dateFormat'
import { useCustomBack } from '@/utils/navigationUtils'

const Page = () => {
  return (
    <Suspense fallback={<div>Loading artist list...</div>}>
      <ArtistList />
    </Suspense>
  )
}
export default Page

const ArtistList = () => {
  
  const { handleBack } = useCustomBack()
  const { addToHistory } = useHistory()
  const { message, setMessage, messageType, errors } = useMessage()
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [artists, setArtists] = useState<Artist[]>([])
  const [condition, setCondition] = useState<ArtistCondition>(initialArtistCondition)
  const [hiddenPanelOpen, setHiddenPanelOpen] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = event.target
    setCondition(prev => ({
      ...prev, 
      [name]: type === 'checkbox' ? (event.target as HTMLInputElement).checked : value
    }))
  }

  const handleShowForm = (artistId: string) => {
    addToHistory({ title: 'artistList', path: `${pathname}?${searchParams.toString()}`})
    if (artistId) router.push(`/music/artists/artistForm?artist_id=${artistId}`);
    else router.push("/music/artists/artistForm")
  }
  const handleShowAlbums = (artistId: string, artistName: string) => {
    addToHistory({ title: 'artistList', path: `${pathname}?${searchParams.toString()}`})
    router.push(`/music/albums/albumList?artist_id=${artistId}&artist_name=${artistName}`);
  }
  const handleShowTracks = (artistId: string, artistName: string) => {
    addToHistory({ title: 'artistList', path: `${pathname}?${searchParams.toString()}`})
    router.push(`/music/tracks/trackList?artist_id=${artistId}&artist_name=${artistName}`);
  }

  const handleSearch = async () => {
    const query = new URLSearchParams()
    if (condition.artist_id) query.append('artist_id', condition.artist_id)
    if (condition.artist_name) query.append('artist_name', condition.artist_name)
    if (condition.artist_name_exact_match) query.append('artist_name_exact_match', 'true')
    if (condition.grade_from) query.append('grade_from', condition.grade_from)
    if (condition.grade_to) query.append('grade_to', condition.grade_to)
    if (condition.random_count) query.append('random_count', condition.random_count.toString())
    router.push(`/music/artists/artistList?${query.toString()}`)
    const fetchData = await fetchArtists(condition)
    setArtists(fetchData)
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
        grade_from: searchParams.get('grade_from') ?? '',
        grade_to: searchParams.get('grade_to') ?? '',
        random_count: searchParams.get('random_count') ? Number(searchParams.get('random_count')) : null,
      }
      setCondition(condition1)
      const fetchData = await fetchArtists(condition1)
      setArtists(fetchData)
    }
    if (searchParams.size > 0) loadData()
    const handler = (e: WindowEventMap['keydown']) => {
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
      <h2 className="header-title">Artist List</h2>
      <div>
        <div className="hidden sm:block">
          <div>
            <label htmlFor="artist_name" className="input-label">Artist Name</label>
            <div className="div-row-between">
              <input type="text"
                  id="artist_name"
                  name="artist_name"
                  placeholder="Artist Name"
                  className="w-full"
                  value={condition.artist_name}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSearch()
                  }}
                  onChange={handleSearchChange} />
              <div className="w-50">
                <ToggleButton
                    name="artist_name_exact_match"
                    title="Exact Match"
                    checked={condition.artist_name_exact_match}
                    onChange={handleSearchChange} />
              </div>
            </div>
          </div>
        </div>
        <div className="block sm:hidden">
          <div className="mb-2">
            <label htmlFor="artist_name" className="input-label">Artist Name</label>
            <input type="text"
                id="artist_name"
                name="artist_name"
                placeholder="Artist Name"
                className="w-full"
                value={condition.artist_name}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSearch()
                }}
                onChange={handleSearchChange} />
          </div>
          <div className="div-row-right">
            <ToggleButton
                name="artist_name_exact_match"
                title="Exact Match"
                checked={condition.artist_name_exact_match}
                onChange={handleSearchChange} />
          </div>
        </div>
        <div className="div-row-left">
          <span className="span-accordion">Advanced Search</span>
          <button
              onClick={() => setShowAdvanced(!showAdvanced)}>
            {showAdvanced ? <ChevronsUp size={16} /> : <ChevronsDown size={16} />}
          </button>
        </div>
        {showAdvanced && (
          <>
            <div className="mb-2">
              <label htmlFor="grade_from" className="input-label">Grade</label>
              <select
                  id="grade_from"
                  name="grade_from"
                  className="w-30"
                  value={condition.grade_from}
                  onChange={handleSearchChange} >
                <option key="" value=""></option>
                {Object.entries(CodeArtistGrade)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([key, label]) => (<option key={key} value={key}>{label}</option>
                ))}
              </select>
              <span>　～　</span>
              <select
                  id="grade_to"
                  name="grade_to"
                  className="w-30"
                  value={condition.grade_to}
                  onChange={handleSearchChange} >
                <option key="" value=""></option>
                {Object.entries(CodeArtistGrade)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([key, label]) => (<option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="random_count" className="input-label">Random Search</label>
              <input type="number"
                  id="random_count"
                  name="random_count"
                  className="numeric-field w-30"
                  placeholder="Random Search"
                  value={condition.random_count ?? ''}
                  onChange={handleSearchChange} />
            </div>
          </>
        )}
        <div className="div-row-right">
          <button className="button-search button-md"
              onClick={handleSearch}>
            <Search size={16} />
          </button>
        </div>
      </div>
      <div className="hidden sm:block">
        <table>
          <thead>
            <tr>
              <th>Artist Name</th>
              <th>Type</th>
              <th>Origin</th>
              <th>Albums</th>
              <th>Tracks</th>
              <th>Years Active</th>
              <th>Grade</th>
              <th>Last Listened At</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {artists.map(artist => (
              <tr key={artist.artist_id}>
                <td>{artist.artist_name_1}</td>
                <td>{CodeArtistType[artist.artist_type ?? '']}</td>
                <td>{artist.country_name_1}</td>
                <td className="numeric-field">
                  <button
                      className="button-link"
                      onClick={() => handleShowAlbums(artist.artist_id ?? '', artist.artist_name_1)}>
                    {artist.owned_count} / {artist.album_count}
                  </button>
                </td>
                <td className="numeric-field">
                  <button
                      className="button-link"
                      onClick={() => handleShowTracks(artist.artist_id ?? '', artist.artist_name_1)}>
                    {artist.track_count} 
                  </button>
                </td>
                <td>{artist.years_active}</td>
                <td>{CodeArtistGrade[artist.grade ?? '']}</td>
                <td>{formatDateTime(artist.last_listened_at, "yyyy/MM/dd")}</td>
                <td>
                  <button
                      className="button-page"
                      onClick={() => handleShowForm(artist.artist_id ?? '')} >
                    <FileText className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="block sm:hidden">
        <div className="div-card-area">
          {artists.map(artist => (
            <div key={artist.artist_id}
                className="div-card">
              <div>
                <button
                    className="button-link card-title"
                    onClick={() => handleShowForm(artist.artist_id ?? '')}>
                  {artist.artist_name_1}
                </button>
              </div>
              {artist.country_name_1 && (
                <div className="div-card-row">
                  <AtSign size={14} />
                  {artist.country_name_1}
                </div>
              )}
              <div className="div-card-row">
                <Disc3 size={14} />
                <button
                    className="button-link"
                    onClick={() => handleShowAlbums(artist.artist_id ?? '', artist.artist_name_1)}>
                  {artist.owned_count} / {artist.album_count}
                </button>
                <span>&ensp;</span>
                <Music size={14} />
                <button
                    className="button-link"
                    onClick={() => handleShowTracks(artist.artist_id ?? '', artist.artist_name_1)}>
                  {artist.track_count}
                </button>
              </div>
              <div className="div-card-row">
                <Star size={14} />
                {CodeArtistGrade[artist.grade ?? '']}
                <span>&ensp;</span>
                <History size={14} />
                {formatDateTime(artist.last_listened_at, "yyyy/MM/dd")}
              </div>
            </div>
          ))}
        </div>
      </div>
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
