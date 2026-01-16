'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Save,
  X,
  Calendar,
  Star,
  Users
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface Anime {
  id: number
  title: string
  description: string | null
  genre: string | null
  year: number | null
  studio: string | null
  imageUrl: string | null
  _count?: {
    ratings: number
    comments: number
    userStatuses: number
  }
  creator?: {
    username: string
  }
}

interface AnimeFormData {
  title: string
  description: string
  genre: string
  year: string
  studio: string
  imageUrl: string
}

const initialFormData: AnimeFormData = {
  title: '',
  description: '',
  genre: '',
  year: '',
  studio: '',
  imageUrl: ''
}

export function AnimeManagement() {
  const [animeList, setAnimeList] = useState<Anime[]>([])
  const [filteredAnime, setFilteredAnime] = useState<Anime[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [editingAnime, setEditingAnime] = useState<Anime | null>(null)
  const [formData, setFormData] = useState<AnimeFormData>(initialFormData)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('list')

  useEffect(() => {
    fetchAnime()
  }, [])

  useEffect(() => {
    const filtered = animeList.filter(anime =>
      anime.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      anime.genre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      anime.studio?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredAnime(filtered)
  }, [animeList, searchTerm])

  const fetchAnime = async () => {
    try {
      const response = await fetch('/api/admin/anime')
      if (response.ok) {
        const data = await response.json()
        setAnimeList(data)
      }
    } catch (error) {
      console.error('Ошибка загрузки аниме:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = editingAnime ? `/api/admin/anime/${editingAnime.id}` : '/api/admin/anime'
      const method = editingAnime ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          year: formData.year ? parseInt(formData.year) : null
        })
      })

      if (response.ok) {
        await fetchAnime()
        resetForm()
        setActiveTab('list')
      } else {
        const error = await response.json()
        alert(`Ошибка: ${error.error}`)
      }
    } catch (error) {
      console.error('Ошибка сохранения:', error)
      alert('Ошибка сохранения')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (anime: Anime) => {
    setEditingAnime(anime)
    setFormData({
      title: anime.title,
      description: anime.description || '',
      genre: anime.genre || '',
      year: anime.year?.toString() || '',
      studio: anime.studio || '',
      imageUrl: anime.imageUrl || ''
    })
    setActiveTab('form')
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить это аниме?')) return

    try {
      const response = await fetch(`/api/admin/anime/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchAnime()
      } else {
        alert('Ошибка удаления')
      }
    } catch (error) {
      console.error('Ошибка удаления:', error)
      alert('Ошибка удаления')
    }
  }

  const resetForm = () => {
    setFormData(initialFormData)
    setEditingAnime(null)
    setActiveTab('list')
  }

  const handleAddNew = () => {
    setEditingAnime(null)
    setFormData(initialFormData)
    setActiveTab('form')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Управление аниме
          </span>
          <Button
            onClick={handleAddNew}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Добавить аниме
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="list">Список аниме ({animeList.length})</TabsTrigger>
            <TabsTrigger value="form">
              {editingAnime ? 'Редактирование' : 'Добавление'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-4">
            {/* Поиск */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск по названию, жанру или студии..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Список аниме */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredAnime.map((anime) => (
                <div
                  key={anime.id}
                  className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
                >
                  {anime.imageUrl && (
                    <img
                      src={anime.imageUrl}
                      alt={anime.title}
                      className="w-16 h-24 object-cover rounded"
                    />
                  )}

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg">{anime.title}</h3>
                    {anime.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {anime.description}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-2 mt-2">
                      {anime.year && (
                        <Badge variant="outline">
                          <Calendar className="w-3 h-3 mr-1" />
                          {anime.year}
                        </Badge>
                      )}
                      {anime.studio && (
                        <Badge variant="outline">{anime.studio}</Badge>
                      )}
                      {anime.genre && (
                        <Badge variant="secondary">{anime.genre}</Badge>
                      )}
                      {anime._count && (
                        <Badge variant="secondary">
                          <Star className="w-3 h-3 mr-1" />
                          {anime._count.ratings} оценок
                        </Badge>
                      )}
                    </div>

                    {anime.creator && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Добавил: {anime.creator.username}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(anime)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(anime.id)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}

              {filteredAnime.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  {searchTerm ? 'Ничего не найдено' : 'Нет аниме в базе данных'}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="form" className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  {editingAnime ? 'Редактировать аниме' : 'Добавить новое аниме'}
                </h3>
                <Button type="button" variant="ghost" onClick={resetForm}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Название *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    required
                    placeholder="Название аниме"
                  />
                </div>

                <div>
                  <Label htmlFor="year">Год выпуска</Label>
                  <Input
                    id="year"
                    type="number"
                    min="1900"
                    max="2030"
                    value={formData.year}
                    onChange={(e) => setFormData(prev => ({ ...prev, year: e.target.value }))}
                    placeholder="2024"
                  />
                </div>

                <div>
                  <Label htmlFor="studio">Студия</Label>
                  <Input
                    id="studio"
                    value={formData.studio}
                    onChange={(e) => setFormData(prev => ({ ...prev, studio: e.target.value }))}
                    placeholder="Mappa, Toei Animation..."
                  />
                </div>

                <div>
                  <Label htmlFor="genre">Жанры (через запятую)</Label>
                  <Input
                    id="genre"
                    placeholder="Экшен, Драма, Комедия"
                    value={formData.genre}
                    onChange={(e) => setFormData(prev => ({ ...prev, genre: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="imageUrl">URL постера</Label>
                <Input
                  id="imageUrl"
                  type="url"
                  placeholder="https://example.com/poster.jpg"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                />
                {formData.imageUrl && (
                  <div className="mt-2">
                    <img
                      src={formData.imageUrl}
                      alt="Предварительный просмотр"
                      className="w-24 h-32 object-cover rounded border"
                    />
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="description">Описание</Label>
                <textarea
                  id="description"
                  className="w-full min-h-[100px] p-3 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Описание сюжета аниме..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Сохранение...' : (editingAnime ? 'Обновить' : 'Добавить')}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Отмена
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
