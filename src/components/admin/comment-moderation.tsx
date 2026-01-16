'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Search,
  MessageCircle,
  Trash2,
  Eye,
  Calendar,
  User,
  Film
} from 'lucide-react'

interface Comment {
  id: number
  comment: string
  createdAt: string
  user: {
    username: string
    role: string
  }
  anime: {
    title: string
    id: number
  }
  _count?: {
    likes: number
  }
}

export function CommentModeration() {
  const [comments, setComments] = useState<Comment[]>([])
  const [filteredComments, setFilteredComments] = useState<Comment[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchComments()
  }, [])

  useEffect(() => {
    const filtered = comments.filter(comment =>
      comment.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comment.user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comment.anime.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredComments(filtered)
  }, [comments, searchTerm])

  const fetchComments = async () => {
    try {
      const response = await fetch('/api/admin/comments')
      if (response.ok) {
        const data = await response.json()
        setComments(data)
      }
    } catch (error) {
      console.error('Ошибка загрузки комментариев:', error)
    }
  }

  const deleteComment = async (commentId: number) => {
    if (!confirm('Удалить этот комментарий?')) return

    setLoading(true)
    try {
      const response = await fetch(`/api/admin/comments/${commentId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchComments()
      } else {
        alert('Ошибка удаления комментария')
      }
    } catch (error) {
      console.error('Ошибка удаления комментария:', error)
      alert('Ошибка удаления комментария')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Модерация комментариев ({comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Поиск */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск по тексту, автору или аниме..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">
                Всего комментариев: {comments.length}
              </span>
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-green-800">
                Сегодня: {comments.filter(c => {
                  const today = new Date().toDateString()
                  return new Date(c.createdAt).toDateString() === today
                }).length}
              </span>
            </div>
          </div>
        </div>

        {/* Список комментариев */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredComments.map((comment) => (
            <div
              key={comment.id}
              className="p-4 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Badge variant={comment.user.role === 'ADMIN' ? 'default' : 'secondary'}>
                    <User className="h-3 w-3 mr-1" />
                    {comment.user.username}
                  </Badge>
                  <Badge variant="outline">
                    <Film className="h-3 w-3 mr-1" />
                    {comment.anime.title}
                  </Badge>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => deleteComment(comment.id)}
                  disabled={loading}
                  className="text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>

              <p className="text-sm mb-3 bg-muted/50 p-3 rounded">
                {comment.comment}
              </p>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(comment.createdAt)}
                </span>
                {comment._count && (
                  <span className="flex items-center gap-1">
                    ❤️ {comment._count.likes} лайков
                  </span>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => window.open(`/anime/${comment.anime.id}`, '_blank')}
                >
                  <Eye className="h-3 w-3" />
                  Перейти к аниме
                </Button>
              </div>
            </div>
          ))}

          {filteredComments.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? 'Ничего не найдено' : 'Нет комментариев'}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
