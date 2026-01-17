'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Bell, Lock, Eye, Share2, Mail, Zap, Save } from 'lucide-react'

interface UserPreferences {
  notificationsEnabled: boolean
  emailNotifications: boolean
  friendRequests: boolean
  profilePublic: boolean
  showActivity: boolean
  allowSharing: boolean
  emailDigest: 'daily' | 'weekly' | 'never'
  dataCollection: boolean
}

interface UserPreferencesProps {
  userId: number
  onSave?: (preferences: UserPreferences) => void
}

export function UserPreferencesPanel({ userId, onSave }: UserPreferencesProps) {
  const [preferences, setPreferences] = useState<UserPreferences>({
    notificationsEnabled: true,
    emailNotifications: false,
    friendRequests: true,
    profilePublic: true,
    showActivity: true,
    allowSharing: true,
    emailDigest: 'weekly',
    dataCollection: false,
  })

  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  // Load preferences from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(`prefs_${userId}`)
    if (stored) {
      setPreferences(JSON.parse(stored))
    }
  }, [userId])

  const handleToggle = (key: keyof UserPreferences) => {
    setPreferences(prev => ({
      ...prev,
      [key]: typeof prev[key] === 'boolean' ? !prev[key] : prev[key]
    }))
    setSaved(false)
  }

  const handleEmailDigestChange = (value: 'daily' | 'weekly' | 'never') => {
    setPreferences(prev => ({
      ...prev,
      emailDigest: value
    }))
    setSaved(false)
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      localStorage.setItem(`prefs_${userId}`, JSON.stringify(preferences))
      setSaved(true)
      onSave?.(preferences)
      
      // Auto-hide success message
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      console.error('Failed to save preferences:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Notifications Section */}
      <Card className="cyber-card">
        <CardHeader className="border-b border-cyan-500/20">
          <CardTitle className="text-cyan-400 flex items-center gap-2">
            <Bell className="h-5 w-5" />
            УВЕДОМЛЕНИЯ
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-cyan-500/20 hover:border-cyan-400 transition-colors">
            <div className="flex items-center gap-3">
              <Zap className="h-4 w-4 text-cyan-400" />
              <div>
                <p className="font-mono font-bold text-sm text-cyan-300">Включить уведомления</p>
                <p className="text-xs text-muted-foreground">Получайте обновления в реальном времени</p>
              </div>
            </div>
            <button
              onClick={() => handleToggle('notificationsEnabled')}
              className={`w-12 h-6 rounded-full transition-all ${
                preferences.notificationsEnabled
                  ? 'bg-green-500 shadow-lg shadow-green-500/50'
                  : 'bg-muted-foreground/30'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  preferences.notificationsEnabled ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-cyan-500/20 hover:border-cyan-400 transition-colors">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-cyan-400" />
              <div>
                <p className="font-mono font-bold text-sm text-cyan-300">Email уведомления</p>
                <p className="text-xs text-muted-foreground">Получайте важные обновления по почте</p>
              </div>
            </div>
            <button
              onClick={() => handleToggle('emailNotifications')}
              className={`w-12 h-6 rounded-full transition-all ${
                preferences.emailNotifications
                  ? 'bg-green-500 shadow-lg shadow-green-500/50'
                  : 'bg-muted-foreground/30'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  preferences.emailNotifications ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-cyan-500/20 hover:border-cyan-400 transition-colors">
            <div className="flex items-center gap-3">
              <Zap className="h-4 w-4 text-cyan-400" />
              <div>
                <p className="font-mono font-bold text-sm text-cyan-300">Запросы в друзья</p>
                <p className="text-xs text-muted-foreground">Получайте уведомления о новых запросах</p>
              </div>
            </div>
            <button
              onClick={() => handleToggle('friendRequests')}
              className={`w-12 h-6 rounded-full transition-all ${
                preferences.friendRequests
                  ? 'bg-green-500 shadow-lg shadow-green-500/50'
                  : 'bg-muted-foreground/30'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  preferences.friendRequests ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {/* Email Digest */}
          <div className="p-3 rounded-lg bg-background/50 border border-cyan-500/20">
            <p className="font-mono font-bold text-sm text-cyan-300 mb-3">Почтовая рассылка</p>
            <div className="flex gap-2 flex-wrap">
              {['daily', 'weekly', 'never'].map(option => (
                <button
                  key={option}
                  onClick={() => handleEmailDigestChange(option as 'daily' | 'weekly' | 'never')}
                  className={`px-3 py-1 rounded text-xs font-mono transition-all ${
                    preferences.emailDigest === option
                      ? 'bg-cyan-500/30 border border-cyan-400 text-cyan-300'
                      : 'bg-background border border-cyan-500/20 text-muted-foreground hover:border-cyan-400'
                  }`}
                >
                  {option === 'daily' ? 'Ежедневно' : option === 'weekly' ? 'Еженедельно' : 'Отключить'}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Section */}
      <Card className="cyber-card">
        <CardHeader className="border-b border-cyan-500/20">
          <CardTitle className="text-cyan-400 flex items-center gap-2">
            <Lock className="h-5 w-5" />
            ПРИВАТНОСТЬ
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-cyan-500/20 hover:border-cyan-400 transition-colors">
            <div className="flex items-center gap-3">
              <Eye className="h-4 w-4 text-cyan-400" />
              <div>
                <p className="font-mono font-bold text-sm text-cyan-300">Публичный профиль</p>
                <p className="text-xs text-muted-foreground">Разрешить другим видеть ваш профиль</p>
              </div>
            </div>
            <button
              onClick={() => handleToggle('profilePublic')}
              className={`w-12 h-6 rounded-full transition-all ${
                preferences.profilePublic
                  ? 'bg-green-500 shadow-lg shadow-green-500/50'
                  : 'bg-muted-foreground/30'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  preferences.profilePublic ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-cyan-500/20 hover:border-cyan-400 transition-colors">
            <div className="flex items-center gap-3">
              <Zap className="h-4 w-4 text-cyan-400" />
              <div>
                <p className="font-mono font-bold text-sm text-cyan-300">Показывать активность</p>
                <p className="text-xs text-muted-foreground">Отображать вашу активность друзьям</p>
              </div>
            </div>
            <button
              onClick={() => handleToggle('showActivity')}
              className={`w-12 h-6 rounded-full transition-all ${
                preferences.showActivity
                  ? 'bg-green-500 shadow-lg shadow-green-500/50'
                  : 'bg-muted-foreground/30'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  preferences.showActivity ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-cyan-500/20 hover:border-cyan-400 transition-colors">
            <div className="flex items-center gap-3">
              <Share2 className="h-4 w-4 text-cyan-400" />
              <div>
                <p className="font-mono font-bold text-sm text-cyan-300">Разрешить поделиться</p>
                <p className="text-xs text-muted-foreground">Позволить делиться вашим контентом</p>
              </div>
            </div>
            <button
              onClick={() => handleToggle('allowSharing')}
              className={`w-12 h-6 rounded-full transition-all ${
                preferences.allowSharing
                  ? 'bg-green-500 shadow-lg shadow-green-500/50'
                  : 'bg-muted-foreground/30'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  preferences.allowSharing ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Data Section */}
      <Card className="cyber-card">
        <CardHeader className="border-b border-cyan-500/20">
          <CardTitle className="text-cyan-400 flex items-center gap-2">
            <Lock className="h-5 w-5" />
            ДАННЫЕ И АНАЛИТИКА
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-cyan-500/20 hover:border-cyan-400 transition-colors">
            <div className="flex items-center gap-3">
              <Zap className="h-4 w-4 text-cyan-400" />
              <div>
                <p className="font-mono font-bold text-sm text-cyan-300">Сбор аналитики</p>
                <p className="text-xs text-muted-foreground">Помогайте нам улучшать платформу</p>
              </div>
            </div>
            <button
              onClick={() => handleToggle('dataCollection')}
              className={`w-12 h-6 rounded-full transition-all ${
                preferences.dataCollection
                  ? 'bg-green-500 shadow-lg shadow-green-500/50'
                  : 'bg-muted-foreground/30'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  preferences.dataCollection ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex gap-4 justify-end pt-4">
        <Button
          onClick={handleSave}
          disabled={loading || saved}
          className="cyber-button bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-cyan-500/50 text-cyan-300 hover:border-cyan-400 flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {saved ? 'Сохранено!' : 'Сохранить настройки'}
        </Button>

        {saved && (
          <Badge className="bg-green-500/20 border border-green-500/50 text-green-400 py-2 px-3">
            ✓ Настройки успешно сохранены
          </Badge>
        )}
      </div>
    </div>
  )
}
