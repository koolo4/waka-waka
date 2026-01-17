'use client'

import { useState, useCallback } from 'react'
import { Eye } from 'lucide-react'
import { AnimePreviewModal } from './anime-preview-modal'

interface AnimeQuickPreviewProps {
  animeId: number
}

export function AnimeQuickPreview({ animeId }: AnimeQuickPreviewProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  const handlePreviewClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsPreviewOpen(true)
  }, [])

  return (
    <>
      <button
        onClick={handlePreviewClick}
        className="absolute top-3 right-3 p-2 bg-cyan-500/20 hover:bg-cyan-500/40 border border-cyan-500/50 rounded-lg backdrop-blur-sm transition-all duration-200 z-20 hover:scale-110"
        title="Quick Preview"
      >
        <Eye className="h-5 w-5 text-cyan-400" />
      </button>

      <AnimePreviewModal
        isOpen={isPreviewOpen}
        animeId={animeId}
        onClose={() => setIsPreviewOpen(false)}
      />
    </>
  )
}
