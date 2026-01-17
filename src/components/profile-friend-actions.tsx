'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { UserPlus, UserX } from 'lucide-react'
import { useToast } from './toast-provider'
import { ConfirmDialog } from './confirm-dialog'

interface FriendStatus {
  id: number
  status: string
  senderId: number
  receiverId: number
}

interface ProfileFriendActionsProps {
  userId: number
  currentUserId: number | null
  friendStatus: FriendStatus | null
}

export const ProfileFriendActions = React.memo(function ProfileFriendActions({
  userId,
  currentUserId,
  friendStatus
}: ProfileFriendActionsProps) {
  const { addToast } = useToast()
  const [showConfirm, setShowConfirm] = useState(false)
  const [action, setAction] = useState<'delete' | null>(null)

  if (!currentUserId) return null

  const handleAddFriend = async () => {
    try {
      const response = await fetch('/api/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId: userId })
      })
      if (response.ok) {
        addToast('Запрос отправлен!', 'success')
        setTimeout(() => window.location.reload(), 500)
      } else {
        const error = await response.json()
        addToast(error.error || 'Ошибка при добавлении в друзья', 'error')
      }
    } catch (err) {
      console.error('Ошибка:', err)
      addToast('Ошибка при добавлении в друзья', 'error')
    }
  }

  const handleRemoveFriend = async () => {
    if (!friendStatus) return
    try {
      const response = await fetch(`/api/friends/${friendStatus.id}`, { 
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      })
      if (response.ok) {
        addToast('Удалено из друзей', 'success')
        setTimeout(() => window.location.reload(), 500)
      } else {
        addToast('Ошибка при удалении из друзей', 'error')
      }
    } catch (err) {
      console.error('Ошибка:', err)
      addToast('Ошибка при удалении из друзей', 'error')
    } finally {
      setShowConfirm(false)
      setAction(null)
    }
  }

  const handleAcceptRequest = async () => {
    if (!friendStatus) return
    try {
      const response = await fetch(`/api/friends/${friendStatus.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'accept' })
      })
      if (response.ok) {
        addToast('Запрос принят!', 'success')
        setTimeout(() => window.location.reload(), 500)
      } else {
        addToast('Ошибка при принятии запроса', 'error')
      }
    } catch (err) {
      console.error('Ошибка:', err)
      addToast('Ошибка при принятии запроса', 'error')
    }
  }

  const handleRejectRequest = async () => {
    if (!friendStatus) return
    try {
      const response = await fetch(`/api/friends/${friendStatus.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject' })
      })
      if (response.ok) {
        addToast('Запрос отклонен', 'success')
        setTimeout(() => window.location.reload(), 500)
      } else {
        addToast('Ошибка при отклонении запроса', 'error')
      }
    } catch (err) {
      console.error('Ошибка:', err)
      addToast('Ошибка при отклонении запроса', 'error')
    }
  }

  if (friendStatus?.status === 'ACCEPTED') {
    return (
      <>
        <Badge className="cyber-badge bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/50 text-green-400">
          ✓ В ДРУЗЬЯХ
        </Badge>
        <Button
          variant="outline"
          size="sm"
          className="cyber-button border-red-500/50 text-red-400 hover:border-red-400"
          onClick={() => {
            setAction('delete')
            setShowConfirm(true)
          }}
        >
          <UserX className="h-4 w-4" />
        </Button>
        <ConfirmDialog
          isOpen={showConfirm && action === 'delete'}
          title="Удалить из друзей?"
          description="Вы больше не сможете видеть активность этого пользователя в списке друзей."
          confirmText="Удалить"
          cancelText="Отмена"
          isDangerous={true}
          onConfirm={handleRemoveFriend}
          onCancel={() => setShowConfirm(false)}
        />
      </>
    )
  }

  if (friendStatus?.senderId === currentUserId) {
    return (
      <Badge className="cyber-badge bg-gradient-to-r from-orange-500/20 to-yellow-500/20 border-orange-500/50 text-orange-400">
        ⏳ ЗАПРОС ОТПРАВЛЕН
      </Badge>
    )
  }

  if (friendStatus?.receiverId === currentUserId) {
    return (
      <div className="flex gap-2">
        <Button
          size="sm"
          className="cyber-button border-green-500/50 text-green-400 hover:border-green-400"
          onClick={handleAcceptRequest}
        >
          Принять
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="cyber-button border-red-500/50 text-red-400 hover:border-red-400"
          onClick={handleRejectRequest}
        >
          Отклонить
        </Button>
      </div>
    )
  }

  return (
    <Button
      className="cyber-button border-cyan-500/50 text-cyan-400 hover:border-cyan-400"
      onClick={handleAddFriend}
    >
      <UserPlus className="h-4 w-4 mr-2" />
      Добавить в друзья
    </Button>
  )
})
