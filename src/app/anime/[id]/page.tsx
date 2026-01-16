import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Building, Eye, User } from 'lucide-react'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { AnimeRating } from '@/components/anime-rating'
import { CommentsBox } from '@/components/comments-box'
import { StatusSelector } from '@/components/status-selector'
import { AnimeVideoPlayer } from '@/components/anime-video-player'

async function getAnimeById(id: number) {
  const anime = await prisma.anime.findUnique({
    where: { id },
    include: {
      ratings: {
        include: {
          user: {
            select: {
              username: true,
              avatar: true
            }
          }
        }
      },
      comments: {
        include: {
          user: {
            select: {
              username: true,
              avatar: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      },
      userStatuses: {
        include: {
          user: {
            select: {
              username: true
            }
          }
        }
      },
      creator: {
        select: {
          username: true
        }
      }
    }
  })

  if (!anime) return null

  const averageRating = anime.ratings.length > 0
    ? anime.ratings.reduce((acc, rating) => acc + rating.overallRating, 0) / anime.ratings.length
    : 0

  const averageRatings = {
    story: anime.ratings.length > 0
      ? anime.ratings.reduce((acc, rating) => acc + rating.storyRating, 0) / anime.ratings.length
      : 0,
    art: anime.ratings.length > 0
      ? anime.ratings.reduce((acc, rating) => acc + rating.artRating, 0) / anime.ratings.length
      : 0,
    characters: anime.ratings.length > 0
      ? anime.ratings.reduce((acc, rating) => acc + rating.charactersRating, 0) / anime.ratings.length
      : 0,
    sound: anime.ratings.length > 0
      ? anime.ratings.reduce((acc, rating) => acc + rating.soundRating, 0) / anime.ratings.length
      : 0,
  }

  return {
    ...anime,
    averageRating,
    averageRatings
  }
}

interface Props {
  params: Promise<{ id: string }>
}

export default async function AnimeDetailPage({ params }: Props) {
  const { id: idStr } = await params
  const id = parseInt(idStr)
  if (isNaN(id)) notFound()

  const anime = await getAnimeById(id)
  if (!anime) notFound()

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header with Title */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-magenta-500 bg-clip-text text-transparent">
            {anime.title}
          </h1>

          {anime.genre && (
            <div className="flex flex-wrap gap-2 mb-4">
              {anime.genre.split(', ').map((genre, index) => (
                <Badge key={index} variant="secondary" className="border-cyan-500/50">
                  {genre}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* 2x2 Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Top Left - Poster */}
          <div className="order-1">
            <Card className="overflow-hidden border-cyan-500/30 shadow-[0_0_20px_rgba(0,217,255,0.2)] h-full">
              <div className="relative aspect-[3/4]">
                <Image
                  src={anime.imageUrl || '/placeholder-anime.jpg'}
                  alt={anime.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </Card>
          </div>

          {/* Top Right - Information and Rating */}
          <div className="order-2 space-y-6">
            <Card className="border-cyan-500/30 shadow-[0_0_20px_rgba(0,217,255,0.2)]">
              <CardHeader>
                <CardTitle className="text-cyan-400">Информация</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {anime.year && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-cyan-400" />
                      <span>Год выпуска: {anime.year}</span>
                    </div>
                  )}

                  {anime.studio && (
                    <div className="flex items-center gap-2">
                      <Building className="h-5 w-5 text-cyan-400" />
                      <span>Студия: {anime.studio}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-cyan-400" />
                    <span>Добавил: {anime.creator?.username || 'Неизвестно'}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Eye className="h-5 w-5 text-cyan-400" />
                    <span>Просмотров: {anime.userStatuses.length}</span>
                  </div>
                </div>

                {anime.description && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-cyan-400">Описание</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {anime.description}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Rating Section */}
            <AnimeRating animeId={anime.id} />
          </div>

          {/* Bottom Left - Video Player/Trailer */}
          <div className="order-3">
            {anime.videoUrl ? (
              <AnimeVideoPlayer videoUrl={anime.videoUrl} animeTitle={anime.title} />
            ) : (
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden border border-cyan-500/30 shadow-[0_0_30px_rgba(0,217,255,0.3)] flex items-center justify-center">
                <p className="text-cyan-400">Видео недоступно</p>
              </div>
            )}
          </div>

          {/* Bottom Right - Status Selector */}
          <div className="order-4">
            <StatusSelector animeId={anime.id} />
          </div>
        </div>

        {/* Comments - Full Width Below */}
        <CommentsBox animeId={anime.id} />
      </div>
    </div>
  )
}
