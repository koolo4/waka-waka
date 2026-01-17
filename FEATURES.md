# WakaWaka New Features Documentation

## Overview
This document describes the new interactive features added to the WakaWaka anime platform, designed to enhance user discovery and engagement.

---

## 1. AnimePreviewModal

**Location:** `src/components/anime-preview-modal.tsx`

**Purpose:** Display anime details in a modal without navigating away from current page

### Features
- **Quick Preview:** Shows anime title, rating, genres, studio, year, and description
- **Watchlist Integration:** Add anime directly to watchlist from preview
- **Responsive Design:** Works on desktop and mobile
- **Loading States:** Indicates while fetching data
- **Error Handling:** Graceful error messages via toast notifications

### Usage
```tsx
import { AnimePreviewModal } from '@/components/anime-preview-modal'

export function MyComponent() {
  const [animeId, setAnimeId] = useState<number | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button onClick={() => { setAnimeId(123); setIsOpen(true) }}>
        Preview
      </button>
      <AnimePreviewModal 
        isOpen={isOpen} 
        animeId={animeId || 0} 
        onClose={() => setIsOpen(false)} 
      />
    </>
  )
}
```

### Props
| Prop | Type | Description |
|------|------|-------------|
| `isOpen` | boolean | Control modal visibility |
| `animeId` | number | Anime ID to display |
| `onClose` | () => void | Callback when modal closes |

### API Endpoints Used
- `GET /api/anime/{id}` - Fetch anime details
- `GET /api/anime/{id}/status` - Check if in watchlist
- `PUT /api/anime/{id}/watchlist` - Add to watchlist

---

## 2. AnimeQuickPreview

**Location:** `src/components/anime-quick-preview.tsx`

**Purpose:** Eye icon overlay for anime cards that opens preview modal

### Features
- **Hover Effect:** Eye icon appears on hover
- **Click Handler:** Opens AnimePreviewModal
- **No Navigation:** Prevents default link behavior
- **Seamless Integration:** Works within anime card group

### Usage
```tsx
import { AnimeQuickPreview } from '@/components/anime-quick-preview'

export function AnimeCard({ animeId }: { animeId: number }) {
  return (
    <div className="group">
      {/* Card content */}
      <AnimeQuickPreview animeId={animeId} />
    </div>
  )
}
```

### Props
| Prop | Type | Description |
|------|------|-------------|
| `animeId` | number | Anime ID to preview |

---

## 3. UserQuickView

**Location:** `src/components/user-quick-view.tsx`

**Purpose:** Display user profile summary in a modal popup

### Features
- **User Avatar:** Profile picture with rank emoji
- **Rank Badge:** Tier badge (Legendary, Master, Expert, Contributor, Member)
- **Stats Grid:** Ratings, Comments, Anime Viewed, Friends, Activity Score
- **Activity Score Visualization:** Progress bar showing user activity level
- **Profile Link:** Button to view full profile
- **Responsive:** Works on all screen sizes

### Rank Tiers
| Tier | Score Range | Emoji |
|------|-------------|-------|
| Legendary | 1000+ | 🌟 |
| Master | 500-999 | ⭐ |
| Expert | 200-499 | ✨ |
| Contributor | 50-199 | 🎯 |
| Member | <50 | 👤 |

### Usage
```tsx
import { UserQuickView } from '@/components/user-quick-view'

export function UserCard({ userId }: { userId: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button onClick={() => setIsOpen(true)}>View Profile</button>
      <UserQuickView 
        isOpen={isOpen} 
        userId={userId} 
        onClose={() => setIsOpen(false)} 
      />
    </>
  )
}
```

### Props
| Prop | Type | Description |
|------|------|-------------|
| `isOpen` | boolean | Control modal visibility |
| `userId` | string | User ID to display |
| `onClose` | () => void | Callback when modal closes |

### API Endpoints Used
- `GET /api/user/{id}` - Fetch user data with stats

---

## 4. LeaderboardCard

**Location:** `src/components/leaderboard-card.tsx`

**Purpose:** Individual leaderboard entry with quick view capability

### Features
- **Position Medal:** 🥇🥈🥉 for top 3, #4+ for others
- **User Info:** Avatar, username, rank badge
- **Stats Display:** Ratings, Comments, Anime, Friends, Score
- **Quick View:** Eye icon to preview user
- **Responsive Layout:** Full stats on desktop, compact on mobile
- **Hover Effects:** Interactive transitions

### Usage
```tsx
import { LeaderboardCard } from '@/components/leaderboard-card'

export function RankingsList({ users }: { users: User[] }) {
  return (
    <div className="grid gap-4">
      {users.map((user, index) => (
        <LeaderboardCard
          key={user.id}
          userId={user.id}
          username={user.username}
          avatar={user.avatar}
          position={index}
          ratingsCount={user.stats.ratingsCount}
          commentsCount={user.stats.commentsCount}
          animesViewed={user.stats.animesViewed}
          friendsCount={user.stats.friendsCount}
          activityScore={user.stats.activityScore}
        />
      ))}
    </div>
  )
}
```

### Props
| Prop | Type | Description |
|------|------|-------------|
| `userId` | string | User ID |
| `username` | string | Display username |
| `avatar` | string \| null | Avatar URL |
| `position` | number | Leaderboard position (0-indexed) |
| `ratingsCount` | number | Total ratings given |
| `commentsCount` | number | Total comments posted |
| `animesViewed` | number | Number of anime viewed |
| `friendsCount` | number | Number of friends |
| `activityScore` | number | Activity score value |

---

## 5. SearchBar Updates

**Location:** `src/components/search-bar.tsx`

**Purpose:** Enhanced search with anime quick preview

### New Features
- **Anime Preview:** Click suggestion to open AnimePreviewModal
- **Modal Integration:** Smooth transition from search to preview
- **History Support:** Recent searches saved to database
- **Autocomplete:** Real-time anime suggestions

### Integration Changes
```tsx
// Now includes AnimePreviewModal
const [selectedAnimeId, setSelectedAnimeId] = useState<number | null>(null)
const [isPreviewOpen, setIsPreviewOpen] = useState(false)

// Click handlers updated
const handleSelectSuggestion = (animeId: number) => {
  setSelectedAnimeId(animeId)
  setIsPreviewOpen(true)
  setIsOpen(false)
}
```

---

## 6. AnimeCard Updates

**Location:** `src/components/anime-card.tsx`

**Purpose:** Added quick preview capability to anime cards

### New Features
- **Quick Preview Icon:** Eye icon appears on hover
- **Modal Integration:** AnimeQuickPreview component added
- **No Breaking Changes:** Backward compatible with existing props

### Implementation
```tsx
import { AnimeQuickPreview } from './anime-quick-preview'

export function AnimeCard(props: AnimeCardProps) {
  // ... existing code ...
  
  return (
    <Card className="cyber-card group">
      {/* Card content */}
      <AnimeQuickPreview animeId={id} />
    </Card>
  )
}
```

---

## 7. Rankings Page Updates

**Location:** `src/app/rankings/page.tsx`

**Purpose:** Refactored to use LeaderboardCard component

### Changes
- **Component Extraction:** Individual card logic moved to LeaderboardCard
- **Quick View Integration:** User preview modal available from leaderboard
- **Cleaner Code:** Reduced page complexity
- **URL Fix:** Fixed localhost port from 3000 to 3001

### Data Flow
```
RankingsPage (async)
├─ Fetch /api/rankings
└─ Render LeaderboardCard components
    ├─ Link to profile
    ├─ User quick view modal
    └─ Stats display
```

---

## Database Models

### UserStats (if not already created)
```prisma
model UserStats {
  id              String    @id @default(cuid())
  userId          String    @unique
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  ratingsCount    Int       @default(0)
  commentsCount   Int       @default(0)
  animesViewed    Int       @default(0)
  friendsCount    Int       @default(0)
  activityScore   Float     @default(0)
  
  updatedAt       DateTime  @updatedAt
  
  @@index([activityScore])
}
```

---

## API Endpoints

### GET /api/anime/{id}
Fetch anime details for modal preview
```json
{
  "id": 1,
  "title": "Example Anime",
  "description": "...",
  "genre": "Action, Adventure",
  "year": 2024,
  "studio": "Studio Name",
  "imageUrl": "...",
  "videoUrl": "...",
  "averageRating": 8.5,
  "ratingsCount": 150,
  "commentsCount": 42
}
```

### GET /api/user/{id}
Fetch user data with stats for quick view
```json
{
  "id": "user123",
  "username": "username",
  "avatar": "...",
  "stats": {
    "ratingsCount": 50,
    "commentsCount": 25,
    "animesViewed": 100,
    "friendsCount": 10,
    "activityScore": 450
  }
}
```

### GET /api/rankings?limit=100
Fetch leaderboard data
```json
{
  "users": [
    {
      "userId": "user1",
      "user": {
        "username": "TopUser",
        "avatar": "..."
      },
      "ratingsCount": 200,
      "commentsCount": 150,
      "animesViewed": 500,
      "friendsCount": 100,
      "activityScore": 1250
    }
  ],
  "total": 542
}
```

---

## Styling

All new components use the existing cyberpunk theme:
- **Primary Color:** Cyan (`text-cyan-400`, `border-cyan-500`)
- **Accent Colors:** Magenta, Yellow, Green, Purple
- **Card Style:** `cyber-card` class with borders and glows
- **Modal:** Semi-transparent backdrop with blur

### Example Classes
```tsx
className="cyber-card hover:border-cyan-400 transition-all"
className="bg-cyan-500/10 border-cyan-500/30"
className="text-gradient bg-gradient-to-r from-cyan-400 to-yellow-400"
```

---

## Performance Considerations

1. **Modal Lazy Loading:** Data fetched only when modal opens
2. **Callback Optimization:** useCallback used for event handlers
3. **Selective Fetching:** Only required data fetched from API
4. **Caching:** Server-side rankings page uses `cache: 'no-store'`
5. **Image Optimization:** Next.js Image component for optimal loading

---

## Future Enhancements

1. **Prefetching:** Prefetch user/anime data on hover
2. **Batch Requests:** Load multiple user/anime data in single request
3. **Real-time Updates:** WebSocket for live leaderboard updates
4. **Filtering:** Add genre/year filters to quick preview
5. **Comparing:** Compare stats between two users
6. **Achievements:** Show user badges/achievements in quick view

---

## Troubleshooting

### Modal Not Opening
- Check if `isOpen` prop is correctly set to `true`
- Verify API endpoints are responding (check Network tab)
- Check console for errors

### Missing Stats
- Verify UserStats record exists for user
- Check if `/api/user/{id}` returns stats object
- May need to run migration if model is new

### Image Not Loading
- Check image URL is valid
- Verify `next.config.js` includes image domain
- Check Network tab for 404 errors

---

## Migration Notes

If migrating from older version:

1. Run `prisma migrate deploy` to apply UserStats model
2. Create initial UserStats records:
   ```sql
   INSERT INTO UserStats (id, userId, createdAt, updatedAt)
   SELECT concat('stats_', id), id, NOW(), NOW() FROM User;
   ```
3. Update activity score calculation based on user actions
4. Test modal functionality before production deployment

---

## Support

For issues or questions about these features:
1. Check the troubleshooting section above
2. Review API response in browser DevTools
3. Check server console for detailed error logs
4. Verify all required fields are present in database records
