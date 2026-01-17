'use client'

import { useState } from 'react'
import { useToast } from '@/components/toast-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface ImportResult {
  id: number
  title: string
  imageUrl: string
  year?: number
  genres: string[]
  synopsis?: string
  score?: number
}

export function ExternalAnimeImporter() {
  const { addToast } = useToast()
  const [activeTab, setActiveTab] = useState<'mal' | 'anilist'>('mal')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<ImportResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isImporting, setIsImporting] = useState<number | null>(null)
  const [importedCount, setImportedCount] = useState(0)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    setIsSearching(true)
    try {
      const response = await fetch(
        `/api/external-sync?action=search&source=${activeTab}&query=${encodeURIComponent(searchQuery)}`
      )
      const data = await response.json()

      if (data.results) {
        setSearchResults(data.results)
        addToast(
          `Found ${data.results.length} results on ${activeTab === 'mal' ? 'MyAnimeList' : 'AniList'}`,
          'success'
        )
      } else {
        addToast('No results found', 'error')
      }
    } catch (error) {
      addToast('Search failed', 'error')
    } finally {
      setIsSearching(false)
    }
  }

  const handleImport = async (result: ImportResult) => {
    setIsImporting(result.id)
    try {
      const response = await fetch(
        `/api/external-sync?action=import&animeId=${result.id}&source=${activeTab}`,
        { method: 'POST' }
      )

      if (!response.ok) {
        throw new Error('Import failed')
      }

      const data = await response.json()
      addToast(data.message || 'Anime imported successfully', 'success')
      setImportedCount(prev => prev + 1)

      // Remove from results
      setSearchResults(searchResults.filter(r => r.id !== result.id))
    } catch (error) {
      addToast('Failed to import anime', 'error')
    } finally {
      setIsImporting(null)
    }
  }

  const handleSyncPopular = async () => {
    if (!window.confirm(`Sync top 20 anime from ${activeTab === 'mal' ? 'MyAnimeList' : 'AniList'}?`)) {
      return
    }

    setIsSearching(true)
    try {
      const response = await fetch(
        `/api/external-sync?action=sync-popular&source=${activeTab}&limit=20`
      )
      const data = await response.json()

      addToast(
        `Imported ${data.imported} new anime (${data.skipped} already existed)`,
        'success'
      )
    } catch (error) {
      addToast('Sync failed', 'error')
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className="cyber-card p-6 border-cyan-500/50 rounded-lg">
      <h2 className="text-2xl font-bold neon-text-magenta mb-6">
        Import Anime from External Sources
      </h2>

      {importedCount > 0 && (
        <div className="mb-4 p-3 bg-green-900/30 border border-green-500/50 rounded text-green-300">
          ✓ Successfully imported {importedCount} anime in this session
        </div>
      )}

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'mal' | 'anilist')}>
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="mal" className="cyber-tab">
            MyAnimeList
          </TabsTrigger>
          <TabsTrigger value="anilist" className="cyber-tab">
            AniList
          </TabsTrigger>
        </TabsList>

        <TabsContent value="mal" className="space-y-4">
          <div className="flex gap-2">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <Input
                placeholder="Search anime on MyAnimeList..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="cyber-input"
              />
              <Button
                type="submit"
                disabled={isSearching}
                className="cyber-button border-cyan-500/50 text-cyan-300"
              >
                {isSearching ? 'Searching...' : 'Search'}
              </Button>
            </form>
            <Button
              onClick={handleSyncPopular}
              disabled={isSearching}
              className="cyber-button border-magenta-500/50 text-magenta-300"
            >
              Sync Popular
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="anilist" className="space-y-4">
          <div className="flex gap-2">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <Input
                placeholder="Search anime on AniList..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="cyber-input"
              />
              <Button
                type="submit"
                disabled={isSearching}
                className="cyber-button border-cyan-500/50 text-cyan-300"
              >
                {isSearching ? 'Searching...' : 'Search'}
              </Button>
            </form>
            <Button
              onClick={handleSyncPopular}
              disabled={isSearching}
              className="cyber-button border-magenta-500/50 text-magenta-300"
            >
              Sync Popular
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {searchResults.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-cyan-300 mb-4">
            Search Results ({searchResults.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {searchResults.map((result) => (
              <div
                key={result.id}
                className="cyber-card p-4 border-cyan-500/30 rounded hover:border-cyan-500/70 transition"
              >
                {result.imageUrl && (
                  <img
                    src={result.imageUrl}
                    alt={result.title}
                    className="w-full h-40 object-cover rounded mb-3"
                  />
                )}
                <h4 className="font-bold text-cyan-300 mb-2 line-clamp-2">
                  {result.title}
                </h4>
                {result.year && (
                  <p className="text-xs text-gray-400 mb-2">Year: {result.year}</p>
                )}
                {result.genres.length > 0 && (
                  <p className="text-xs text-magenta-300 mb-3">
                    {result.genres.slice(0, 3).join(', ')}
                  </p>
                )}
                {result.score && (
                  <p className="text-xs text-green-300 mb-3">★ {result.score}</p>
                )}
                <Button
                  onClick={() => handleImport(result)}
                  disabled={isImporting === result.id}
                  className="w-full cyber-button border-green-500/50 text-green-300 text-sm"
                >
                  {isImporting === result.id ? 'Importing...' : 'Import'}
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {searchResults.length === 0 && !isSearching && (
        <div className="mt-8 p-8 text-center text-gray-400 border border-cyan-500/30 rounded">
          <p>Search for anime or click "Sync Popular" to get started</p>
        </div>
      )}
    </div>
  )
}
