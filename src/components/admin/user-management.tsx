'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Search,
  Users,
  Ban,
  Shield,
  UserCheck,
  Mail,
  Calendar,
  Activity
} from 'lucide-react'

interface User {
  id: number
  username: string
  email: string
  role: 'USER' | 'ADMIN'
  createdAt: string
  _count?: {
    ratings: number
    comments: number
    animeStatuses: number
  }
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    const filtered = users.filter(user =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredUsers(filtered)
  }, [users, searchTerm])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      console.error('Ошибка загрузки пользователей:', error)
    }
  }

  const toggleUserRole = async (userId: number, currentRole: string) => {
    if (!confirm('Изменить роль пользователя?')) return

    setLoading(true)
    try {
      const newRole = currentRole === 'USER' ? 'ADMIN' : 'USER'
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      })

      if (response.ok) {
        await fetchUsers()
      } else {
        alert('Ошибка изменения роли')
      }
    } catch (error) {
      console.error('Ошибка изменения роли:', error)
      alert('Ошибка изменения роли')
    } finally {
      setLoading(false)
    }
  }

  const deleteUser = async (userId: number) => {
    if (!confirm('Удалить пользователя? Это действие нельзя отменить.')) return

    setLoading(true)
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchUsers()
      } else {
        alert('Ошибка удаления пользователя')
      }
    } catch (error) {
      console.error('Ошибка удаления пользователя:', error)
      alert('Ошибка удаления пользователя')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Управление пользователями ({users.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Поиск */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск по имени, email или роли..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">
                Всего пользователей: {users.length}
              </span>
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-green-800">
                Администраторов: {users.filter(u => u.role === 'ADMIN').length}
              </span>
            </div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-800">
                Активных: {users.filter(u => u._count && u._count.ratings > 0).length}
              </span>
            </div>
          </div>
        </div>

        {/* Список пользователей */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold">{user.username}</h3>
                  <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>
                    {user.role === 'ADMIN' ? 'Админ' : 'Пользователь'}
                  </Badge>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {user.email}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Регистрация: {formatDate(user.createdAt)}
                  </span>
                </div>

                {user._count && (
                  <div className="flex gap-3 mt-2">
                    <Badge variant="outline">
                      {user._count.ratings} оценок
                    </Badge>
                    <Badge variant="outline">
                      {user._count.comments} комментариев
                    </Badge>
                    <Badge variant="outline">
                      {user._count.animeStatuses} в списках
                    </Badge>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toggleUserRole(user.id, user.role)}
                  disabled={loading}
                  className="flex items-center gap-1"
                >
                  <Shield className="h-3 w-3" />
                  {user.role === 'ADMIN' ? 'Снять админа' : 'Сделать админом'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => deleteUser(user.id)}
                  disabled={loading}
                  className="text-red-600 hover:bg-red-50"
                >
                  <Ban className="h-3 w-3" />
                  Удалить
                </Button>
              </div>
            </div>
          ))}

          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? 'Ничего не найдено' : 'Нет пользователей'}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
