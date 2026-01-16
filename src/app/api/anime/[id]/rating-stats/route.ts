import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const animeId = parseInt(params.id)

    const ratings = await prisma.rating.findMany({
      where: { animeId },
      select: {
        overallRating: true,
        storyRating: true,
        artRating: true,
        charactersRating: true,
        soundRating: true
      }
    })

    if (ratings.length === 0) {
      return NextResponse.json({
        overall: 0,
        story: 0,
        art: 0,
        characters: 0,
        sound: 0,
        count: 0,
        distribution: {}
      })
    }

    // Вычисляем средние значения
    const overall = ratings.reduce((sum, r) => sum + r.overallRating, 0) / ratings.length
    const story = ratings.reduce((sum, r) => sum + r.storyRating, 0) / ratings.length
    const art = ratings.reduce((sum, r) => sum + r.artRating, 0) / ratings.length
    const characters = ratings.reduce((sum, r) => sum + r.charactersRating, 0) / ratings.length
    const sound = ratings.reduce((sum, r) => sum + r.soundRating, 0) / ratings.length

    // Вычисляем распределение оценок
    const distribution: { [key: number]: number } = {}
    for (let i = 1; i <= 10; i++) {
      distribution[i] = ratings.filter(r => Math.floor(r.overallRating) === i).length
    }

    return NextResponse.json({
      overall,
      story,
      art,
      characters,
      sound,
      count: ratings.length,
      distribution
    })
  } catch (error) {
    console.error('Failed to fetch rating stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch rating stats' },
      { status: 500 }
    )
  }
}
