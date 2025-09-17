'use client'

import { Suspense, useEffect, useState } from 'react'
import type { NextPage } from 'next'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { ArrowLeft, ChevronsUp, ChevronsDown, FileText, Plus, Search } from 'lucide-react'

import { useHistory } from '@/contexts/HistoryContext'
import { Artist, ArtistCondition, initialArtistCondition } from '@/types/music/artist-types'
import { CodeArtistType, CodeArtistGrade } from '@/utils/codeUtils'
import { formatDateTime } from '@/utils/dateFormat'

const Page = () => {
  return (
    <Suspense fallback={<div>Loading artist list...</div>}>
      <ArtistList />
    </Suspense>
  )
}

export default Page

const ArtistList = () => {
  
  const { addToHistory } = useHistory()
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [artists, setArtists] = useState<Artist[]>([])

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

  useEffect(() => {
  }, [])

  return (
    <div className="root-panel">
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
    </div>
  )
}
