'use client'

import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'

export function ThemeSwitcher() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Get theme from localStorage or system preference
    const saved = localStorage.getItem('theme') as 'light' | 'dark' | null
    const preferred = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    const initial = saved || preferred
    setTheme(initial)
    applyTheme(initial)
  }, [])

  const applyTheme = (newTheme: 'light' | 'dark') => {
    const html = document.documentElement
    if (newTheme === 'dark') {
      html.classList.add('dark')
      html.classList.remove('light')
    } else {
      html.classList.add('light')
      html.classList.remove('dark')
    }
    localStorage.setItem('theme', newTheme)
  }

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    applyTheme(newTheme)
  }

  if (!mounted) return null

  return (
    <button
      onClick={toggleTheme}
      className="relative p-2 hover:bg-card/50 rounded-lg transition-all group"
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <div className="relative w-5 h-5">
        {theme === 'dark' ? (
          <Moon className="absolute inset-0 h-5 w-5 text-yellow-400 rotate-0 transition-all group-hover:rotate-12" />
        ) : (
          <Sun className="absolute inset-0 h-5 w-5 text-yellow-400 rotate-180 transition-all group-hover:-rotate-12" />
        )}
      </div>
      
      {/* Tooltip */}
      <div className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-card border border-cyan-500/30 rounded text-xs text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
        {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
      </div>
    </button>
  )
}
