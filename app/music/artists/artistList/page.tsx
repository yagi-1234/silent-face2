'use client'

import { Suspense, useEffect, useState } from 'react'
import type { NextPage } from 'next'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { ArrowLeft, ChevronsUp, ChevronsDown, FileText, Plus, Search } from 'lucide-react'

import { Breadcrumb } from '@/components/Breadcrumb'
import ConfirmModal from '@/components/ConfirmModal'
import HiddenPanel from '@/components/HiddenPanel'
import MessageBanner from '@/components/MessageBanner'
import { useHistory } from '@/contexts/HistoryContext'
import { useMessage } from '@/contexts/MessageContext'
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
    // const query = new URLSearchParams()
    // if (condition.artist_id) query.append('artist_id', condition.artist_id)
    // if (condition.artist_name) query.append('artist_name', condition.artist_name)
    // if (condition.artist_name_exact_match) query.append('artist_name_exact_match', 'true')
    // if (condition.grade_from) query.append('grade_from', condition.grade_from)
    // if (condition.grade_to) query.append('grade_to', condition.grade_to)
    // if (condition.random_count) query.append('random_count', condition.random_count.toString())
    // router.push(`/music/artists/artistList?${query.toString()}`)
    // const fetchData = await fetchArtists(condition)
    // setArtists(fetchData)
  }

  useEffect(() => {
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
      <div className="searchPanel">
        <div className="input-form">
          <label htmlFor="artist_name">Artist Name</label>
          <input type="text"
              id="artist_name"
              name="artist_name"
              value={condition.artist_name}
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
          <button className="w-10 h-10"
              onClick={() => setShowAdvanced(!showAdvanced)}>
            {showAdvanced ? 
                <ChevronsUp size={16} />
              :
                <ChevronsDown size={16} />
            }
          </button>
          {!showAdvanced && (
            <button className="button-search w-20 absolute left-300"
                onClick={handleSearch}>
              <Search size={16} />
            </button>
          )}
        </div>

        {showAdvanced && (
          <>
            <div className="input-form">
              <label htmlFor="grade">Grade</label>
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
            <div className="input-form">
              <label htmlFor="randomFlag">Random Search</label>
              <input type="number"
                  id="random_count"
                  name="random_count"
                  className="numeric-field w-30"
                  value={condition.random_count ?? ''}
                  onChange={handleSearchChange} />
            <button className="button-search w-20 absolute left-220"
                  onClick={handleSearch}>
                <Search size={16} />
              </button>
            </div>
          </>
        )}
      </div>
      <table>
        <thead>
          <tr>
            <th>Artist Name</th>
            <th>Type</th>
            <th>Origin</th>
            <th>Albums</th>
            <th>Tracks</th>
            <th>Grade</th>
            <th>Last Listened At</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {artists.map((artist) => (
            <tr key={artist.artist_id}>
              <td>{artist.artist_name_1}</td>
              <td>{CodeArtistType[artist.artist_type]}</td>
              <td>{artist.origin_country}</td>
              <td className="numeric-field">
                <button
                    className="button-link"
                    onClick={() => handleShowAlbums(artist.artist_id, artist.artist_name_1)}>
                  {artist.owned_count} / {artist.album_count}
                </button>
              </td>
              <td className="numeric-field">
                <button
                    className="button-link"
                    onClick={() => handleShowTracks(artist.artist_id, artist.artist_name_1)}>
                  {artist.track_count} 
                </button>
              </td>
              <td>{CodeArtistGrade[artist.grade]}</td>
              <td>{formatDateTime(artist.last_listened_at, "yyyy/MM/dd")}</td>
              <td>
                <button
                    className="button-page"
                    onClick={() => handleShowForm(artist.artist_id)} >
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
