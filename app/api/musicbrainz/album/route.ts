import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {

  type MusicBrainzAlbum = {
    id: string
    title: string
    ['artist-credit']: { name: string }[]
    ['first-release-date']: string
    ['primary-type']: string
    score: number
  }
  const artist = request.nextUrl.searchParams.get('artist')
  const album = request.nextUrl.searchParams.get('album')
  if (!artist || !album) {
    return NextResponse.json({ error: 'Missing artist or album parameter' }, { status: 400 })
  }
  const query = `artistname:"${artist}" AND releasegroup:"${album}"`
  const url =
      `https://musicbrainz.org/ws/2/release-group/` +
      `?query=${encodeURIComponent(query)}` +
      `&fmt=json` +
      `&limit=10`
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
    const albums = data['release-groups']?.map((item: MusicBrainzAlbum) => ({
      mbid: item.id,
      title: item.title,
      artist: item['artist-credit']?.[0]?.name ?? '',
      firstReleaseDate: item['first-release-date'] ?? '',
      primaryType: item['primary-type'] ?? '',
      score: item.score ?? 0
    })) ?? []
    return NextResponse.json(albums)
  } catch (error) {
    console.error('MusicBrainz error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
