import { GoogleGenAI } from '@google/genai'
import { NextResponse } from 'next/server'

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
})

export const maxDuration = 60

export async function POST(request: Request) {
  console.log('AI info in')
  try {
    //const { artistName } = await request.json()
    const artistName = "Let's Eat Grandma"
    console.log('Target Artist:', artistName)

    const interaction = await ai.interactions.create({
      model: 'gemini-3.6-flash',
      input: `
アーティスト「${artistName}」について調査してください。

以下の条件で回答してください。

- アーティストの概要を日本語で200文字程度に簡潔にまとめる
- 音楽ジャンル、出身国・地域、活動開始時期など、確認できる基本情報を含める
- Wikipedia、公式サイト、レコード会社など信頼性の高い情報を優先する
- 上記3点から情報が取得できない場合、Google検索を利用して最新かつ正確な情報を確認する
- 不確かな情報は推測しない
- 情報が確認できない場合は無理に記載しない
- 回答は概要本文だけにする
      OKとだけ答えてください
      `,
      tools: [
        { type: 'google_search' }
      ]
    })
    const text = interaction.output_text ?? ''
    console.log('Gemini response:', text)
    console.log('AI info end')
    return NextResponse.json({ overview: text })
  } catch (error) {
    console.error('AI info error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}


// import OpenAI from 'openai'
// import { NextResponse } from 'next/server'

// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

// type AIArtistInfo = {
//   overview: string
// }

// export async function POST(request: Request) {
//   console.log('OpenAI POST in')
//   try {
//     const artistName = "Let's Eat Grandma"
//     if (!process.env.OPENAI_API_KEY) {
//       return NextResponse.json(
//         { error: 'OPENAI_API_KEY is not configured' },
//         { status: 500 }
//       )
//     }
//     const response = await openai.responses.create({
//       model: 'gpt-5.6-luna',
//       tools: [
//         { type: 'web_search' }
//       ],
//       input: `
//       アーティスト「${artistName}」について調査してください。
//       以下の情報を日本語で返してください。
//       1. アーティスト概要
//       - 約200文字
//       Wikipedia、公式サイト、レコード会社、信頼できる音楽メディアなど、
//       信頼性の高い情報を優先してください。
//       情報が確認できない場合は無理に埋めないでください。
//       `,
//       text: {
//         format: {
//           type: 'json_schema',
//           name: 'artist_info',
//           strict: true,
//           schema: {
//             type: 'object',
//             properties: {
//               overview: {
//                 type: 'string'
//               }
//             },
//             required: ['overview'],
//             additionalProperties: false
//           }
//         }
//       }
//     })
//     console.log('OpenAI response received')
//     const result = JSON.parse(response.output_text) as AIArtistInfo
//     return NextResponse.json(result)
//   } catch (error) {
//     console.error('OpenAI API error:', error)
//     return NextResponse.json(
//       { error: error instanceof Error ? error.message : String(error) },
//       { status: 500 }
//     )
//   }
//   console.log('OpenAI POST end')
// }
