# 🎌 External API Integration Guide

## Overview

WakaWaka now supports seamless integration with MyAnimeList and AniList APIs to enrich your anime catalog with high-quality data, images, and metadata.

## Features

✅ **Search Integration**
- Search for anime on MyAnimeList or AniList
- View metadata before importing
- One-click import to your database

✅ **Bulk Sync**
- Sync top/popular anime from external sources
- Automatic deduplication
- Batch operations with rate limiting

✅ **Data Tracking**
- Track anime sources (MAL/AniList IDs)
- Monitor external ratings & popularity
- Track last sync timestamp

✅ **Smart Import**
- Avoids duplicate entries
- Updates existing anime with better data
- Preserves your custom descriptions

---

## Usage

### Admin Dashboard

Navigate to: **Admin Panel → Import Anime**

#### Search & Import
1. Select source (MyAnimeList or AniList)
2. Search for anime by title
3. Review search results with images & metadata
4. Click "Import" to add to your catalog

#### Sync Popular
1. Click "Sync Popular" button
2. Confirm bulk sync operation
3. System will import top anime (avoiding duplicates)
4. See import stats (new/updated/skipped)

### API Endpoints

#### Search Anime
```bash
GET /api/external-sync?action=search&source=mal&query=naruto

# Response
{
  "source": "myanimelist",
  "results": [
    {
      "id": 20,
      "title": "Naruto",
      "imageUrl": "...",
      "year": 2002,
      "genres": ["Action", "Adventure"],
      "score": 7.97
    }
  ]
}
```

#### Import Anime
```bash
POST /api/external-sync?action=import&animeId=20&source=mal

# Response
{
  "success": true,
  "anime": { /* anime object */ },
  "message": "New anime imported"
}
```

#### Sync Popular
```bash
GET /api/external-sync?action=sync-popular&source=anilist&limit=20

# Response
{
  "success": true,
  "imported": 15,
  "skipped": 5,
  "animes": [/* array of imported animes */]
}
```

---

## Data Sources

### MyAnimeList (Jikan API)

**Pros:**
- Largest anime database
- High-quality images
- Detailed information
- Well-established data

**API Rate Limits:**
- 60 requests per minute
- Built-in retry logic

**Data Mapped:**
- Title → title
- Description → synopsis
- Genres → genres
- Studio → studios
- Year → year
- Image → coverImage
- Score → rating

### AniList (GraphQL API)

**Pros:**
- Modern GraphQL API
- Real-time data updates
- Recommendation system
- Good metadata quality

**API Rate Limits:**
- 90 requests per minute
- Built-in retry logic

**Data Mapped:**
- Title → romaji/english
- Description → description
- Genres → genres
- Studio → studios
- Year → startDate.year
- Image → coverImage
- Score → score

---

## Technical Details

### Database Schema

New fields added to `Anime` model:

```prisma
model Anime {
  // ... existing fields ...
  
  // External source tracking
  malId           Int?     // MyAnimeList ID
  anilistId       Int?     // AniList ID
  externalSource  String?  // 'myanimelist' or 'anilist'
  externalRating  Float?   // Score from external source
  externalPopularity Int? // Popularity rank
  lastSyncedAt    DateTime? // When last synced
}
```

### File Structure

```
src/
├── lib/
│   ├── external-apis/
│   │   ├── mal.ts              # MyAnimeList integration
│   │   └── anilist.ts          # AniList integration
│   └── anime-sync.ts           # Sync utilities
├── components/
│   └── external-anime-importer.tsx  # Import UI component
└── app/
    ├── api/
    │   └── external-sync/
    │       └── route.ts        # API endpoints
    └── admin/
        └── anime/
            └── import/
                └── page.tsx    # Admin import page
```

---

## Rate Limiting & Error Handling

### Automatic Retry Logic

Both API integrations include automatic retry with exponential backoff:

```typescript
// Retries up to 3 times
// Backoff: 1s → 2s → 4s
// Respects Retry-After headers
```

### Batch Operations

When importing multiple anime:
- 300-500ms delay between requests
- Prevents rate limiting
- Shows progress
- Handles partial failures

### Error Tracking

All errors are logged and returned:
```json
{
  "imported": 10,
  "skipped": 5,
  "errors": [
    {
      "query": "Anime Title",
      "error": "Anime not found"
    }
  ]
}
```

---

## Use Cases

### 1. Initial Catalog Population
```bash
# Sync top anime from both sources
GET /api/external-sync?action=sync-popular&source=mal&limit=50
GET /api/external-sync?action=sync-popular&source=anilist&limit=50
```

### 2. Search User Requests
```bash
# User searches for anime on your site
# Admin can import from external source if not found
GET /api/external-sync?action=search&source=mal&query=user_search
```

### 3. Update Existing Anime
```bash
# Import to update anime with better image/description
POST /api/external-sync?action=import&animeId=123&source=mal
```

### 4. Seasonal Updates
```bash
# Run periodically to get new seasonal anime
# Setup cron job to sync popular weekly
```

---

## Best Practices

1. **Use Deduplication**
   - System checks by title to avoid duplicates
   - Consider adding alternative titles in future

2. **Prioritize Image Quality**
   - Only import images if not present
   - Use larger image URLs when available

3. **Batch Operations**
   - Use "Sync Popular" for efficiency
   - Avoid searching same anime multiple times

4. **Monitor Sync Status**
   - Track imported/skipped/error counts
   - Review errors and address duplicates

5. **Schedule Updates**
   - Set up cron jobs for weekly popular syncs
   - Keep catalog fresh with new releases

---

## Troubleshooting

### "Anime not found"
- Try partial title search
- Check spelling in source database
- Try alternative source (MAL vs AniList)

### Rate Limited
- Built-in retry will handle automatically
- Wait 60+ seconds before retrying
- Batch operations spread out requests

### Duplicate Anime
- System checks by title to prevent
- If still duplicated, manually merge in database
- Consider adding external IDs to deduplication

### No Images Importing
- Verify external API has images
- Check image URL format
- May be rate limited by CDN

### API Errors
- Check network connection
- Verify external API is online
- Check request format

---

## Future Enhancements

- [ ] Scheduled sync jobs (cron)
- [ ] Anime merging UI for duplicates
- [ ] Alternative title support
- [ ] Review synchronization (user reviews → external ratings)
- [ ] Recommendation engine using external data
- [ ] Advanced metadata (voice actors, studios)
- [ ] Automatic data updates

---

## API Documentation Links

- **MyAnimeList (Jikan)**: https://docs.api.jikan.moe/
- **AniList GraphQL**: https://anilist.gitbook.io/anilist-graphql-api/

---

**Last Updated**: January 17, 2026  
**Status**: Production Ready
