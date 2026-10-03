import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const artist = request.nextUrl.searchParams.get('artist')
  const album = request.nextUrl.searchParams.get('album')
  const mbid = request.nextUrl.searchParams.get('mbid')
  if ((!artist || !album) && !mbid) {
    return NextResponse.json({ error: 'Missing artist or album parameter' }, { status: 400 })
  }
  const apiKey = process.env.LASTFM_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'Missing Last.fm API key' }, { status: 500 })
  const params = new URLSearchParams({
    method: 'album.getInfo',
    api_key: apiKey,
    format: 'json',
    autocorrect: '1'
  })
  if (mbid) { params.set('mbid', mbid) }
  else {
    params.set('artist', artist!)
    params.set('album', album!)
  }
  try {
    const response = await fetch(`https://ws.audioscrobbler.com/2.0/?${params.toString()}`)
    const data = await response.json()
    if (!response.ok || data.error) {
      return NextResponse.json(
        { error: `Last.fm API error: ${data.message || response.status}` },
        { status: response.status | 500 }
      )
    }
    const albumData = data.album
    const tracks = albumData?.tracks?.track?.map((track: any, index: number) => ({
      trackNumber: track['@attr']?.rank ?? index + 1,
      title: track.name,
      duration: track.duration ?? 0,
      mbid: track.mbid ?? '',
      url: track.url ?? '',
    })) ?? []
    return NextResponse.json({
      artist: albumData?.artist ?? '',
      album: albumData?.name ?? '',
      mbid: albumData?.mbid ?? '',
      listeners: albumData?.listeners ?? 0,
      playcount: albumData?.playcount ?? 0,
      tracks
    })
  } catch (error) {
    console.error('Last.fm error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
