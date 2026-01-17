# 🚀 External API Integration - Quick Start

## What's New?

You now have full integration with **MyAnimeList** and **AniList** APIs! This allows you to:

- 🔍 Search for anime on external databases
- ⬇️ Import anime data directly to your catalog
- 📊 Sync popular/trending anime automatically
- 🖼️ Get high-quality images and metadata
- ✨ Enrich existing anime with better data

---

## How to Use

### 1. Access Admin Panel

Go to: **http://localhost:3000/admin**
Click: **"Import Anime"** button (top right)

### 2. Search for Anime

**Method A: Manual Search**
- Choose source (MyAnimeList or AniList)
- Search for anime by title
- Review results with images
- Click "Import" on any anime

**Method B: Sync Popular**
- Click "Sync Popular" button
- System will import top 20 trending anime
- Avoids duplicates automatically

### 3. What Gets Imported?

✅ Anime title  
✅ Description/Synopsis  
✅ Genre tags  
✅ Year released  
✅ Studio name  
✅ High-quality cover image  
✅ External ratings & popularity scores  

---

## Files Added/Modified

### New Files
```
src/lib/external-apis/
├── mal.ts                    # MyAnimeList API
└── anilist.ts               # AniList API

src/lib/anime-sync.ts         # Sync utilities

src/app/api/external-sync/    # API endpoint

src/components/
└── external-anime-importer.tsx  # UI Component

src/app/admin/anime/import/   # Admin page

prisma/schema.prisma          # Updated with external IDs
prisma/migrations/            # New migration
```

### Modified Files
```
src/app/admin/page.tsx        # Added import button
```

---

## Database Changes

Added to `Anime` table:
- `malId` - MyAnimeList ID
- `anilistId` - AniList ID
- `externalSource` - which source was used
- `externalRating` - score from external API
- `externalPopularity` - popularity rank
- `lastSyncedAt` - when last synced

---

## API Endpoints

### Search Anime
```bash
GET /api/external-sync?action=search&source=mal&query=naruto
```

### Import Anime
```bash
POST /api/external-sync?action=import&animeId=20&source=mal
```

### Sync Popular
```bash
GET /api/external-sync?action=sync-popular&source=anilist&limit=20
```

---

## Rate Limiting

✓ **Built-in retry logic**  
- Automatic retries on rate limit
- Exponential backoff (1s, 2s, 4s)
- Respects API headers

✓ **Safe batch operations**
- 300-500ms between requests
- Prevents hitting limits
- Shows partial failure errors

---

## Features

### 🔄 Smart Deduplication
- Checks if anime already exists by title
- Won't create duplicates
- Updates with better data if needed

### 🖼️ Image Handling
- Only imports if no image exists
- Uses high-quality versions
- Falls back gracefully

### 📋 Error Handling
- Logs all errors
- Shows what failed & why
- Returns detailed stats

### ⚡ Performance
- Batch operations
- Built-in caching
- Optimized API calls

---

## Use Cases

**Initial Setup**
```bash
# Populate your catalog with popular anime
GET /api/external-sync?action=sync-popular&source=mal&limit=50
GET /api/external-sync?action=sync-popular&source=anilist&limit=50
```

**User Requests**
```bash
# User searches for anime not in your DB
# Admin imports from external source
GET /api/external-sync?action=search&source=mal&query=user_search
```

**Seasonal Updates**
```bash
# Set up cron job to run weekly
# Keeps catalog fresh with new releases
GET /api/external-sync?action=sync-popular&source=mal
```

---

## Example Workflow

1. **Admin visits import page**
   - Sees search interface for MAL and AniList

2. **Admin searches for anime**
   ```
   Source: MyAnimeList
   Query: "Attack on Titan"
   → Results: 10 anime with images
   ```

3. **Admin clicks Import**
   - System checks if exists
   - Creates new anime or updates existing
   - Toast notification shows success

4. **Anime appears in catalog**
   - With image, description, genres
   - Searchable and rateable
   - External metadata tracked

---

## Next Steps

Possible enhancements:

- [ ] Schedule automatic syncs (weekly)
- [ ] Merge duplicate anime UI
- [ ] Alternative title support
- [ ] Voice actor data import
- [ ] Recommendation sync
- [ ] User review synchronization

---

## Troubleshooting

**Q: Anime not found?**
A: Try partial title or check source database directly

**Q: Getting rate limited?**
A: System will auto-retry. Wait 60+ seconds before manual retry

**Q: Duplicates appearing?**
A: System checks by title. If still appearing, check for alternate titles

**Q: No images importing?**
A: Check external API has images; may be CDN rate limited

---

## Documentation

Full docs available in: `EXTERNAL_API_GUIDE.md`

---

**Status**: ✅ Production Ready  
**Last Updated**: January 17, 2026
