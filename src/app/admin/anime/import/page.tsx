import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { ExternalAnimeImporter } from '@/components/external-anime-importer'

export const metadata = {
  title: 'Import Anime | Admin | WAKA-WAKA',
}

export default async function AdminAnimeImportPage() {
  const session = await getServerSession()

  if (!session?.user?.email) {
    redirect('/auth/signin')
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })

  if (user?.role !== 'ADMIN') {
    redirect('/')
  }

  return (
    <div className="min-h-screen pt-20 pb-10 px-4">
      <div className="container max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold neon-text-magenta mb-2">
            External API Integration
          </h1>
          <p className="text-cyan-300">
            Import anime data from MyAnimeList and AniList to enrich your catalog
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="cyber-card p-4 border-cyan-500/30 rounded">
            <h3 className="font-bold text-magenta-300 mb-2">MyAnimeList</h3>
            <p className="text-sm text-gray-300 mb-3">
              Fetch anime from the world's largest anime database with detailed information.
            </p>
            <ul className="text-xs text-cyan-300 space-y-1">
              <li>✓ High quality images</li>
              <li>✓ Detailed descriptions</li>
              <li>✓ User ratings & popularity</li>
              <li>✓ Studio information</li>
            </ul>
          </div>

          <div className="cyber-card p-4 border-cyan-500/30 rounded">
            <h3 className="font-bold text-magenta-300 mb-2">AniList</h3>
            <p className="text-sm text-gray-300 mb-3">
              Import anime using AniList's comprehensive GraphQL API.
            </p>
            <ul className="text-xs text-cyan-300 space-y-1">
              <li>✓ Rich metadata</li>
              <li>✓ Recommendations</li>
              <li>✓ Seasonal data</li>
              <li>✓ Real-time updates</li>
            </ul>
          </div>

          <div className="cyber-card p-4 border-cyan-500/30 rounded">
            <h3 className="font-bold text-magenta-300 mb-2">Features</h3>
            <p className="text-sm text-gray-300 mb-3">
              Smart import system with deduplication.
            </p>
            <ul className="text-xs text-cyan-300 space-y-1">
              <li>✓ Search & find anime</li>
              <li>✓ One-click import</li>
              <li>✓ Bulk sync popular</li>
              <li>✓ Duplicate detection</li>
            </ul>
          </div>
        </div>

        <ExternalAnimeImporter />

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="cyber-card p-6 border-cyan-500/30 rounded">
            <h3 className="text-lg font-bold text-cyan-300 mb-4">📋 How to Use</h3>
            <ol className="text-sm text-gray-300 space-y-3">
              <li>
                <span className="text-magenta-300 font-bold">1.</span> Select a source (MAL or AniList)
              </li>
              <li>
                <span className="text-magenta-300 font-bold">2.</span> Search for anime or click "Sync Popular"
              </li>
              <li>
                <span className="text-magenta-300 font-bold">3.</span> Review the results
              </li>
              <li>
                <span className="text-magenta-300 font-bold">4.</span> Click "Import" to add to your catalog
              </li>
              <li>
                <span className="text-magenta-300 font-bold">5.</span> Duplicates are automatically detected
              </li>
            </ol>
          </div>

          <div className="cyber-card p-6 border-cyan-500/30 rounded">
            <h3 className="text-lg font-bold text-cyan-300 mb-4">⚡ Tips & Tricks</h3>
            <ul className="text-sm text-gray-300 space-y-3">
              <li>
                <span className="text-green-300">•</span> Use "Sync Popular" to get trending anime
              </li>
              <li>
                <span className="text-green-300">•</span> Search with partial titles to find variations
              </li>
              <li>
                <span className="text-green-300">•</span> Already existing anime won't be duplicated
              </li>
              <li>
                <span className="text-green-300">•</span> Image URLs are cached for fast loading
              </li>
              <li>
                <span className="text-green-300">•</span> API calls have built-in rate limit handling
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 cyber-card p-6 border-magenta-500/30 rounded">
          <h3 className="text-lg font-bold text-magenta-300 mb-4">📊 API Rate Limits</h3>
          <p className="text-sm text-gray-300 mb-4">
            Both APIs have built-in rate limiting. The import system handles this automatically:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="text-cyan-300 font-bold mb-2">MyAnimeList (Jikan API)</h4>
              <ul className="text-gray-400 space-y-1">
                <li>• 60 requests per minute</li>
                <li>• Auto-retry on rate limit</li>
                <li>• Exponential backoff</li>
              </ul>
            </div>
            <div>
              <h4 className="text-cyan-300 font-bold mb-2">AniList (GraphQL)</h4>
              <ul className="text-gray-400 space-y-1">
                <li>• 90 requests per minute</li>
                <li>• Auto-retry on rate limit</li>
                <li>• Smart request batching</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
