import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { artist_name, country_name } = await request.json()
    if (!artist_name) {
      return NextResponse.json(
        { error: 'artist_name is required' },
        { status: 400 }
      )
    }
    console.log(artist_name)
    const wikiUrl = country_name === 'Japan' ? 'https://ja.wikipedia.org/api/rest_v1/page/summary' : 'https://en.wikipedia.org/api/rest_v1/page/summary'
    const title = encodeURIComponent(artist_name.trim())
    const response = await fetch(
      `${wikiUrl}/${title}`,
      { headers: { 'User-Agent': 'YourMusicDB/1.0' } }
    )
    if (!response.ok) {
      return NextResponse.json(
        { error: 'Wikipedia article not found' },
        { status: response.status }
      )
    }
    const data = await response.json()
    return NextResponse.json({
      title: data.title,
      overview: data.extract ?? '',
      wikipediaUrl: data.content_urls?.desktop?.page ?? '',
      thumbnail: data.thumbnail?.source ?? null
    })
  } catch (error) {
    console.error('Wikipedia error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}