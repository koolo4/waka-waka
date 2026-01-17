import { Card, CardContent } from '@/components/ui/card'
import { Trophy } from 'lucide-react'
import { LeaderboardCard } from '@/components/leaderboard-card'

async function getTopUsers() {
  try {
    // Use relative URL for server-side fetches
    const res = await fetch(`http://localhost:3000/api/rankings?limit=100`, {
      cache: 'no-store'
    })
    if (!res.ok) throw new Error(`Failed to fetch rankings: ${res.status}`)
    return res.json()
  } catch (error) {
    console.error('Failed to get top users:', error)
    return { users: [], total: 0 }
  }
}

export default async function RankingsPage() {
  const data = await getTopUsers()
  const users = data.users || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Trophy className="h-8 w-8 text-yellow-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-yellow-400 bg-clip-text text-transparent">
              User Rankings
            </h1>
          </div>
          <p className="text-muted-foreground">
            Top contributors based on activity and engagement
          </p>
        </div>

        {/* Rankings Grid */}
        {users.length > 0 ? (
          <div className="grid gap-4">
            {users.map((item: any, index: number) => (
              <LeaderboardCard
                key={item.userId}
                userId={item.userId}
                username={item.user.username}
                avatar={item.user.avatar}
                position={index}
                ratingsCount={item.ratingsCount}
                commentsCount={item.commentsCount}
                animesViewed={item.animesViewed}
                friendsCount={item.friendsCount}
                activityScore={item.activityScore}
              />
            ))}
          </div>
        ) : (
          <Card className="cyber-card">
            <CardContent className="p-8 text-center">
              <Trophy className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground">No users ranked yet</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
