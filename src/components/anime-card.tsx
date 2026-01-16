'use client'

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Star, Calendar, Eye, MessageCircle, Zap, Play, Film, Sparkles } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

interface AnimeData {
  id: number
  title: string
  description?: string | null
  genre?: string | null
  year?: number | null
  studio?: string | null
  imageUrl?: string | null
  averageRating?: number
  ratingsCount?: number
  commentsCount?: number
  viewsCount?: number
  creator?: { username: string } | null
}

interface AnimeCardProps {
  // Поддержка нового формата с объектом anime
  anime?: AnimeData
  // Поддержка старого формата с отдельными пропсами
  id?: number
  title?: string
  description?: string | null
  genre?: string | null
  year?: number | null
  studio?: string | null
  imageUrl?: string | null
  averageRating?: number
  ratingsCount?: number
  commentsCount?: number
  viewsCount?: number
  // Новый prop для режима отображения
  viewMode?: 'grid' | 'list'
}

// Киберпанк градиенты для резервных изображений
const cyberpunkGradients = [
  'bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-700',
  'bg-gradient-to-br from-magenta-500 via-purple-600 to-pink-700',
  'bg-gradient-to-br from-green-500 via-teal-600 to-cyan-700',
  'bg-gradient-to-br from-orange-500 via-red-600 to-pink-700',
  'bg-gradient-to-br from-violet-500 via-purple-600 to-indigo-700',
  'bg-gradient-to-br from-emerald-500 via-green-600 to-teal-700'
]

const getGradientForAnime = (id: number) => {
  return cyberpunkGradients[id % cyberpunkGradients.length]
}

export function AnimeCard(props: AnimeCardProps) {
  const [imageError, setImageError] = useState(false)

  // Если передан объект anime, используем его, иначе используем отдельные пропсы
  const anime = props.anime || {
    id: props.id!,
    title: props.title!,
    description: props.description,
    genre: props.genre,
    year: props.year,
    studio: props.studio,
    imageUrl: props.imageUrl,
    averageRating: props.averageRating,
    ratingsCount: props.ratingsCount,
    commentsCount: props.commentsCount,
    viewsCount: props.viewsCount
  }

  const {
    id,
    title,
    description,
    genre,
    year,
    studio,
    imageUrl,
    averageRating = 0,
    ratingsCount = 0,
    commentsCount = 0,
    viewsCount = 0,
    creator
  } = anime

  const viewMode = props.viewMode || 'grid'
  const gradientClass = getGradientForAnime(id)

  // Если это list view, возвращаем горизонтальную карточку
  if (viewMode === 'list') {
    return (
      <Link href={`/anime/${id}`}>
        <Card className="cyber-card group overflow-hidden relative transform hover:scale-[1.02] transition-all duration-300 border-2 border-transparent hover:border-cyan-500/50">
          <div className="flex gap-4 p-4">
            {/* Изображение */}
            <div className="relative w-24 h-32 flex-shrink-0 rounded-lg overflow-hidden">
              {imageUrl && !imageError ? (
                <Image
                  src={imageUrl}
                  alt={title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                  sizes="96px"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className={`w-full h-full ${gradientClass} flex items-center justify-center`}>
                  <Film className="w-8 h-8 text-white/80" />
                </div>
              )}

              {/* Углы */}
              <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-cyan-500/70"></div>
              <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-cyan-500/70"></div>
              <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-cyan-500/70"></div>
              <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-cyan-500/70"></div>
            </div>

            {/* Контент */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-xl mb-2 group-hover:text-cyan-400 transition-colors font-mono truncate">
                    {title}
                  </h3>

                  {description && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {description}
                    </p>
                  )}

                  {/* Метаданные */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-3">
                    {year && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span className="font-mono">{year}</span>
                      </div>
                    )}
                    {studio && (
                      <div className="flex items-center gap-1">
                        <span className="text-cyan-400">STUDIO:</span>
                        <span className="font-mono">{studio}</span>
                      </div>
                    )}
                    {creator && (
                      <div className="flex items-center gap-1">
                        <span className="text-magenta-400">BY:</span>
                        <span className="font-mono">{creator.username}</span>
                      </div>
                    )}
                  </div>

                  {/* Жанры */}
                  {genre && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {genre.split(',').slice(0, 3).map((g, index) => (
                        <Badge
                          key={index}
                          className="cyber-badge text-xs bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/50 text-green-400"
                        >
                          {g.trim()}
                        </Badge>
                      ))}
                      {genre.split(',').length > 3 && (
                        <Badge className="cyber-badge text-xs bg-gradient-to-r from-purple-500/20 to-violet-500/20 border-purple-500/50 text-purple-400">
                          +{genre.split(',').length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>

                {/* Статистика справа */}
                <div className="flex flex-col items-end gap-2 text-xs">
                  {averageRating > 0 && (
                    <Badge className="cyber-badge bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/50 text-yellow-400">
                      <Star className="w-3 h-3 mr-1 fill-yellow-400" />
                      {averageRating.toFixed(1)}
                    </Badge>
                  )}

                  <div className="flex items-center gap-3 text-muted-foreground">
                    {ratingsCount > 0 && (
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        <span className="font-mono">{ratingsCount}</span>
                      </div>
                    )}
                    {commentsCount > 0 && (
                      <div className="flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" />
                        <span className="font-mono">{commentsCount}</span>
                      </div>
                    )}
                    {viewsCount > 0 && (
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        <span className="font-mono">{viewsCount}</span>
                      </div>
                    )}
                  </div>

                  {/* Кнопка Play */}
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500/20 to-magenta-500/20 border border-cyan-500/50 flex items-center justify-center group-hover:bg-gradient-to-r group-hover:from-cyan-500/40 group-hover:to-magenta-500/40 transition-all duration-300">
                    <Play className="w-4 h-4 text-cyan-400 ml-0.5" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </Link>
    )
  }

  // Grid view (оригинальный код)
  return (
    <Link href={`/anime/${id}`}>
      <Card className="cyber-card group h-full flex flex-col overflow-hidden relative transform hover:scale-105 transition-all duration-500 border-2 border-transparent hover:border-cyan-500/50">
        {/* Энергетический эффект */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-magenta-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 pointer-events-none"></div>

        {/* Сканирующие линии */}
        <div className="absolute inset-0 opacity-20 z-20 pointer-events-none">
          <div className="h-full w-full bg-gradient-to-b from-transparent via-cyan-500/10 to-transparent bg-[length:100%_4px]"></div>
        </div>

        <CardHeader className="p-0 relative flex-shrink-0">
          <div className="aspect-[3/4] relative overflow-hidden rounded-t-lg border-b border-cyan-500/20">
            {imageUrl && !imageError ? (
              <Image
                src={imageUrl}
                alt={title}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-700 filter group-hover:brightness-110 group-hover:contrast-110"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className={`w-full h-full ${gradientClass} flex items-center justify-center relative overflow-hidden`}>
                {/* Киберпанк паттерн */}
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-4 left-4 w-8 h-8 border border-white/30 rotate-45"></div>
                  <div className="absolute top-8 right-8 w-6 h-6 border border-white/20 rotate-12"></div>
                  <div className="absolute bottom-6 left-8 w-4 h-4 border border-white/25 -rotate-45"></div>
                  <div className="absolute bottom-4 right-4 w-10 h-10 border border-white/15 rotate-30"></div>
                </div>

                {/* Центральная иконка */}
                <div className="relative z-10 text-center">
                  <Film className="w-16 h-16 text-white/80 mx-auto mb-2" />
                  <div className="text-xs text-white/60 font-mono uppercase tracking-wider">
                    {genre?.split(',')[0]?.trim() || 'Anime'}
                  </div>
                </div>

                {/* Декоративные частицы */}
                <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-white/40 rounded-full"></div>
                <div className="absolute top-3/4 right-1/3 w-1 h-1 bg-white/30 rounded-full"></div>
                <div className="absolute bottom-1/4 left-2/3 w-1 h-1 bg-white/50 rounded-full"></div>
              </div>
            )}

            {/* Голографические углы */}
            <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-cyan-500/70 group-hover:border-cyan-400 transition-colors duration-300"></div>
            <div className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 border-cyan-500/70 group-hover:border-cyan-400 transition-colors duration-300"></div>
            <div className="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2 border-cyan-500/70 group-hover:border-cyan-400 transition-colors duration-300"></div>
            <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-cyan-500/70 group-hover:border-cyan-400 transition-colors duration-300"></div>

            {/* Кнопка воспроизведения */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/30 backdrop-blur-sm">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-cyan-500 to-magenta-500 flex items-center justify-center shadow-lg shadow-cyan-500/50 group-hover:scale-110 transition-transform duration-300">
                <Play className="w-8 h-8 text-black fill-black ml-1" />
              </div>
            </div>

            {/* Рейтинг */}
            {averageRating > 0 && (
              <div className="absolute top-3 right-3">
                <Badge className="cyber-badge bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/50 text-yellow-400 backdrop-blur-sm shadow-lg shadow-yellow-500/20">
                  <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
                  {averageRating.toFixed(1)}
                </Badge>
              </div>
            )}

            {/* Год */}
            {year && (
              <div className="absolute top-3 left-3">
                <Badge className="cyber-badge bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-cyan-500/50 text-cyan-400 backdrop-blur-sm font-mono shadow-lg shadow-cyan-500/20">
                  {year}
                </Badge>
              </div>
            )}

            {/* Новинка */}
            {year && year >= 2020 && (
              <div className="absolute bottom-3 left-3">
                <Badge className="cyber-badge bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/50 text-green-400 backdrop-blur-sm shadow-lg shadow-green-500/20">
                  <Sparkles className="w-3 h-3 mr-1" />
                  NEW
                </Badge>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-4 flex-1 flex flex-col relative z-30">
          <h3 className="font-black text-lg mb-2 line-clamp-2 group-hover:text-cyan-400 transition-all duration-300 font-mono tracking-wide min-h-[3.5rem]">
            {title}
          </h3>

          <div className="min-h-[4.5rem] mb-3">
            {description && (
              <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                {description}
              </p>
            )}
          </div>

          <div className="min-h-[2rem] mb-3">
            {genre && (
              <div className="flex flex-wrap gap-2">
                {genre.split(',').slice(0, 2).map((g, index) => (
                  <Badge
                    key={index}
                    className="cyber-badge text-xs bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/50 text-green-400 hover:border-green-400 transition-colors duration-300"
                  >
                    {g.trim()}
                  </Badge>
                ))}
                {genre.split(',').length > 2 && (
                  <Badge className="cyber-badge text-xs bg-gradient-to-r from-purple-500/20 to-violet-500/20 border-purple-500/50 text-purple-400">
                    +{genre.split(',').length - 2}
                  </Badge>
                )}
              </div>
            )}
          </div>

          <div className="mt-auto space-y-2">
            {studio && (
              <p className="text-xs text-muted-foreground font-mono">
                <span className="text-cyan-400">STUDIO:</span> {studio}
              </p>
            )}

            {creator && (
              <p className="text-xs text-muted-foreground font-mono">
                <span className="text-magenta-400">ADDED_BY:</span> {creator.username}
              </p>
            )}
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-3 border-t border-cyan-500/20 relative z-30 bg-gradient-to-r from-card/80 to-card backdrop-blur-sm flex-shrink-0">
          <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              {ratingsCount > 0 && (
                <div className="flex items-center gap-1 hover:text-yellow-400 transition-colors cursor-pointer">
                  <Star className="w-3 h-3" />
                  <span className="font-mono">{ratingsCount}</span>
                </div>
              )}

              {commentsCount > 0 && (
                <div className="flex items-center gap-1 hover:text-cyan-400 transition-colors cursor-pointer">
                  <MessageCircle className="w-3 h-3" />
                  <span className="font-mono">{commentsCount}</span>
                </div>
              )}

              {viewsCount > 0 && (
                <div className="flex items-center gap-1 hover:text-green-400 transition-colors cursor-pointer">
                  <Eye className="w-3 h-3" />
                  <span className="font-mono">{viewsCount}</span>
                </div>
              )}
            </div>

            {/* Статус онлайн */}
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full shadow-sm shadow-green-500/50"></div>
              <span className="font-mono text-green-400 text-xs">ONLINE</span>
            </div>
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
}
