import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Heart, Users, Zap } from 'lucide-react'
import { RecommendationsClient } from '@/components/recommendations-client'

export default async function RecommendationsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  return (
    <div className="min-h-screen relative">
      {/* Background effects */}
      <div className="matrix-rain"></div>
      <div className="digital-particles"></div>

      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="mb-12 text-center">
            <div className="inline-flex items-center gap-3 cyber-badge mb-4">
              <Sparkles className="h-4 w-4" />
              <span>NEURAL RECOMMENDATION ENGINE</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-black mb-4 neon-text-magenta">
              ПЕРСОНАЛЬНЫЕ РЕКОМЕНДАЦИИ
            </h1>

            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Наш алгоритм анализирует твои оценки, предпочтения жанров и 
              <span className="neon-text"> рекомендации от друзей</span> 
              чтобы найти идеальное аниме для тебя
            </p>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="cyber-stat-card cyan">
              <CardContent className="p-6 text-center">
                <Heart className="h-10 w-10 neon-text mx-auto mb-3" />
                <div className="text-sm text-muted-foreground uppercase tracking-wider">
                  На основе твоих оценок
                </div>
              </CardContent>
            </Card>

            <Card className="cyber-stat-card magenta">
              <CardContent className="p-6 text-center">
                <Users className="h-10 w-10 text-magenta-400 mx-auto mb-3" />
                <div className="text-sm text-muted-foreground uppercase tracking-wider">
                  Рекомендации друзей
                </div>
              </CardContent>
            </Card>

            <Card className="cyber-stat-card green">
              <CardContent className="p-6 text-center">
                <Zap className="h-10 w-10 text-green-400 mx-auto mb-3" />
                <div className="text-sm text-muted-foreground uppercase tracking-wider">
                  Похожие жанры
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Recommendations Section */}
      <section className="py-16 px-4 relative">
        <div className="container mx-auto max-w-7xl relative z-10">
          <RecommendationsClient />
        </div>
      </section>
    </div>
  )
}
