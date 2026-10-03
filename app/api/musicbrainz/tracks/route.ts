import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  type MusicBrainzTrack = {
    position: number
    title: string
    length: number
    recording?: { id: string }
  }
  type MusicBrainzRelease = {
    tracks?: MusicBrainzTrack[]
  }
  const mbid = request.nextUrl.searchParams.get('mbid')
  if (!mbid) {
    return NextResponse.json({ error: 'Missing mbid parameter' }, { status: 400 })
  }
  const url =
      `https://musicbrainz.org/ws/2/release-group/${mbid}` +
      `?inc=releases+artist-credits` +
      `&fmt=json`
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'silent-face2/1.0 (yagi69874521@gmail.com)'
      }
    })
    if (!response.ok) {
      return NextResponse.json(
        { error: `MusicBrainz API error: ${response.status}` },
        { status: response.status }
      )
    }
    const data = await response.json()
    const releases = data.releases ?? []
    if (releases.length === 0) {
      return NextResponse.json([])
    }
    const release = releases[0]
    const trackResponse = await fetch(
      `https://musicbrainz.org/ws/2/release/${release.id}?inc=recordings&fmt=json`,
      {
        headers: {
          'User-Agent': 'silent-face2/1.0 (yagi69874521@gmail.com)'
        }
      }
    )
    if (!trackResponse.ok) {
      return NextResponse.json(
        { error: `MusicBrainz API error: ${trackResponse.status}` },
        { status: trackResponse.status }
      )
    }
    const trackData = await trackResponse.json()
    const tracks =
      trackData.media?.flatMap((media: MusicBrainzRelease) =>
        media.tracks?.map((track: MusicBrainzTrack) => ({
          trackNumber: track.position,
          title: track.title,
          length: track.length,
          recordingMbid: track.recording?.id ?? ''
        })) ?? []
      ) ?? []
    return NextResponse.json({
      releaseMbid: release.id,
      releaseTitle: release.title,
      country: release.country ?? '',
      date: release.date ?? '',
      tracks
    })
  } catch (error) {
    console.error('MusicBrainz error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
