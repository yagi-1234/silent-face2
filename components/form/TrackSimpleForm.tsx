'use client'

import { useEffect, useState } from 'react'
import { Check, CircleCheck } from 'lucide-react'

import { fetchArtistAlbumTracks } from '@/actions/music/track-action'
import { SimpleTrackView } from '@/types/music/track-types'

interface TrackSimpleFormProps {
  track: SimpleTrackView
  onSave: (result: SimpleTrackView) => void
}

export function TrackSimpleForm({ track, onSave }: TrackSimpleFormProps) {

  const [simpleTrack, setSimpleTrack] = useState<SimpleTrackView>(track)
  const [showTrackCandidates, setShowTrackCandidates] = useState(false)
  const [trackCandidates, setTrackCandidates] = useState<SimpleTrackView[]>([])

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setSimpleTrack(prev => {
      return {
        ...prev,
        [name]: value,
        [name.replace('_name', '_id')]: null
      }
    })
  }
  
  const loadTrackData = async () => {
    const result = await fetchArtistAlbumTracks(simpleTrack)
    if (result.length === 1) {
      setSimpleTrack(result[0])
    } else if (result.length > 1) {
      setTrackCandidates(result)
      setShowTrackCandidates(true)
    }
  }

  const handleSetTrack = (track: SimpleTrackView) => {
    // skipCandidate.current = true
    setSimpleTrack(prev => ({
      ...prev,
      artist_id: track.artist_id,
      artist_name: track.artist_name,
      album_id: track.album_id,
      album_name: track.album_name,
      track_id: track.track_id,
      track_name: track.track_name
    }))
    setTrackCandidates([])
    setShowTrackCandidates(false)
  }

  const handleSave = () => {
    onSave(simpleTrack)
  }

  useEffect(() => {
    loadTrackData()
  }, [])

  useEffect(() => {
    if (!!!simpleTrack.artist_name && !!!simpleTrack.album_name && !!!simpleTrack.track_name) return
    const timer = setTimeout(async () => {
      loadTrackData()
    }, 400)
    return () => clearTimeout(timer)
  }, [simpleTrack.artist_name, simpleTrack.album_name, simpleTrack.track_name])

  return (
    <div className="w-80 md:w-168">
      <div className="div-input-row">
        
      </div>
      <div className="div-input-row">
        <label htmlFor="artist_name" className="input-label">Artist</label>
        <div className="div-row-left">
          <input type="text"
              id="artist_name"
              name="artist_name"
              className="w-full sm:w-140  mr-2"
              value={simpleTrack.artist_name ?? ''}
              onChange={handleChange} />
          {simpleTrack.artist_id && (
            <button className="text-bold text-green-600">
              <CircleCheck className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
      <div className="div-input-row">
        <label htmlFor="album_name" className="input-label">Album</label>
        <div className="div-row-left">
          <input type="text"
              id="album_name"
              name="album_name"
              className="w-full sm:w-140 mr-2"
              value={simpleTrack.album_name ?? ''}
              onChange={handleChange} />
            {simpleTrack.album_id && (
              <button className="text-bold text-green-600">
                <CircleCheck className="h-5 w-5" />
              </button>
            )}
        </div>
      </div>
      <div className="div-input-row">
        <label htmlFor="track_name" className="input-label">Track</label>
        <div className="div-row-left">
          <input type="text"
              id="track_name"
              name="track_name"
            className="w-full sm:w-140 mr-2"
            value={simpleTrack.track_name ?? ''}
            onChange={handleChange} />
          {simpleTrack.track_id && (
            <button className="text-bold text-green-600">
              <CircleCheck className="h-5 w-5" />
            </button>
          )}
          {showTrackCandidates && (
            <div className="absolute left-0 right-0 top-full w-122 z-50 mt-1 overflow-hidden rounded-md border bg-white show-lg">
              {trackCandidates.length > 0 ? (
                <>
                  {trackCandidates.map(candidate => (
                    <button key={candidate.track_id}
                        className="block w-full px-3 py-2 text-left hover:bg-gray-100"
                        onClick={() => handleSetTrack(candidate)}>
                      {candidate.track_name ?? ''}
                    </button>
                  ))}
                </>
              ) : null}
            </div>
          )}
        </div>
      </div>
      <div className="flex justify-end items-center">
        <button className="button-save" onClick={handleSave}>
          <Check size={16}/>
        </button>
      </div>
    </div>
  )
}
