'use client'

import { useEffect, useState } from 'react'
import { Bell } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export function FriendRequestNotifier() {
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    const fetchPendingRequests = async () => {
      try {
        const res = await fetch('/api/friends?type=pending')
        const data = await res.json()
        const pending = data.filter((f: any) => f.receiverId === parseInt(localStorage.getItem('userId') || '0'))
        setPendingCount(pending.length)
      } catch (error) {
        console.error('Failed to fetch pending requests:', error)
      }
    }

    fetchPendingRequests()
    const interval = setInterval(fetchPendingRequests, 30000) // Проверяем каждые 30 сек

    return () => clearInterval(interval)
  }, [])

  if (pendingCount === 0) return null

  return (
    <div className="relative">
      <Bell className="h-5 w-5 text-cyan-400" />
      <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs font-bold rounded-full">
        {pendingCount}
      </Badge>
    </div>
  )
}
