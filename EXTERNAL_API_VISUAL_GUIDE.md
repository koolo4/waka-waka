# 🎬 How to Use External API Integration - Visual Guide

## Step 1: Access Admin Panel
```
Home Page
    ↓
Click Profile Icon (top right)
    ↓
Select "Admin Panel"
    ↓
URL: http://localhost:3000/admin
```

## Step 2: Navigate to Import Page
```
┌─────────────────────────────────────┐
│  Admin Panel                        │
│  ─────────────────────────────────  │
│  [Statistics]                       │
│  ├─ Total Anime: 150                │
│  ├─ Total Users: 25                 │
│  ├─ Total Comments: 423             │
│  └─ Total Ratings: 890              │
│                                     │
│  [Buttons at Top]                   │
│  ┌──────────────────────────────┐   │
│  │ [⬇ Import Anime]  [← Back]   │  <- CLICK HERE
│  └──────────────────────────────┘   │
│                                     │
│  [Tabs]                             │
│  ├─ Overview                        │
│  ├─ Anime                           │
│  ├─ Users                           │
│  └─ Comments                        │
└─────────────────────────────────────┘
```

## Step 3: Import Page Interface

```
┌──────────────────────────────────────────────────────┐
│  EXTERNAL API INTEGRATION                           │
│  Import anime from MyAnimeList and AniList          │
├──────────────────────────────────────────────────────┤
│                                                      │
│  ┌─── Source Selection ──────────────────────────┐  │
│  │ [MyAnimeList] [AniList]                        │  │
│  └─────────────────────────────────────────────┘  │
│                                                      │
│  ┌─── Search Interface ──────────────────────────┐  │
│  │ Search Box: [_______________]                 │  │
│  │ [🔍 Search] [⭐ Sync Popular]                 │  │
│  └─────────────────────────────────────────────┘  │
│                                                      │
│  ┌─── Results Grid ──────────────────────────────┐  │
│  │ ┌──────────┐ ┌──────────┐ ┌──────────┐       │  │
│  │ │ [Image]  │ │ [Image]  │ │ [Image]  │       │  │
│  │ │ Title    │ │ Title    │ │ Title    │       │  │
│  │ │ ★ 8.5    │ │ ★ 7.2    │ │ ★ 9.1    │       │  │
│  │ │[Import]  │ │[Import]  │ │[Import]  │       │  │
│  │ └──────────┘ └──────────┘ └──────────┘       │  │
│  │ ┌──────────┐ ┌──────────┐ ...                │  │
│  │ │ [Image]  │ │ [Image]  │                    │  │
│  │ │ Title    │ │ Title    │                    │  │
│  │ │ ★ 6.8    │ │ ★ 7.9    │                    │  │
│  │ │[Import]  │ │[Import]  │                    │  │
│  │ └──────────┘ └──────────┘                    │  │
│  └─────────────────────────────────────────────┘  │
│                                                      │
│  ✓ Imported: 5 anime in this session               │
└──────────────────────────────────────────────────────┘
```

## Step 4: Search for Anime

### Option A: Manual Search

```
1. Type anime title:
   [Enter "Demon Slayer"]
   
2. Click Search
   
3. Wait for results (~1-2 seconds)
   
4. View results:
   ┌─────────────────────────────────────┐
   │ Found 10 results on MyAnimeList     │
   │                                     │
   │ ┌──────────────────────────────┐   │
   │ │ [Cover Image]                │   │
   │ │ Demon Slayer                 │   │
   │ │ Year: 2019                   │   │
   │ │ Action, Adventure, Demons    │   │
   │ │ ★ Rating: 8.55               │   │
   │ │ ┌──────────────────────────┐ │   │
   │ │ │      [Import Anime]      │ │   │
   │ │ └──────────────────────────┘ │   │
   │ └──────────────────────────────┘   │
   │                                     │
   │ ... more results below ...          │
   └─────────────────────────────────────┘
```

### Option B: Sync Popular

```
1. Click "Sync Popular" button
   
2. Confirm dialog appears:
   "Sync top 20 anime from MyAnimeList?"
   
3. Click "Yes" or "OK"
   
4. System automatically:
   ✓ Fetches top anime
   ✓ Checks for duplicates
   ✓ Imports missing anime
   ✓ Updates with better data
   
5. See results:
   ┌─────────────────────────────────┐
   │ ✓ Imported 15 new anime         │
   │ ℹ️ Skipped 5 already existed    │
   │ ✓ Completed in 42 seconds       │
   └─────────────────────────────────┘
```

## Step 5: Import Anime

```
Flow:

Search Results
    ↓
Find Anime
    ↓
Click [Import]
    ↓
System checks database:
├─ Is it already here?
│  ├─ YES → Update with better data
│  └─ NO → Create new anime
│
System stores:
├─ Title ✓
├─ Description ✓
├─ Genres ✓
├─ Year ✓
├─ Studio ✓
├─ Cover Image ✓
├─ External ID (MAL/AniList) ✓
├─ External Rating ✓
└─ Sync Timestamp ✓
    ↓
Toast: "Anime imported successfully" ✓
    ↓
Anime available in catalog!
```

## Step 6: Confirmation

After import, you'll see:

```
┌─────────────────────────────────────┐
│ ✅ Anime imported successfully      │
│                                     │
│ Now you can:                        │
│ • View on main page                 │
│ • Rate and comment                  │
│ • Add to watchlist                  │
│ • Recommend to friends              │
└─────────────────────────────────────┘
```

---

## Data Sources Comparison

```
┌──────────────────────┬──────────────────┬──────────────────┐
│ Feature              │ MyAnimeList      │ AniList          │
├──────────────────────┼──────────────────┼──────────────────┤
│ Database Size        │ 🔵 Very Large    │ 🟣 Large         │
│ Image Quality        │ ✓ High           │ ✓ High           │
│ Metadata Detail      │ ✓ Excellent      │ ✓ Excellent      │
│ API Speed            │ ⚡ Fast          │ ⚡ Very Fast      │
│ Rate Limit           │ 60/min           │ 90/min           │
│ Recommendations      │ ❌ No            │ ✓ Yes            │
│ Real-time Updates    │ 📅 Daily         │ ⏱️ Real-time      │
└──────────────────────┴──────────────────┴──────────────────┘
```

---

## Result Examples

### MyAnimeList Result
```
┌─────────────────────────────────┐
│  Title: Attack on Titan         │
│  (進撃の巨人)                   │
│                                 │
│  [High-Quality Cover Image]     │
│                                 │
│  Year: 2013                     │
│  Episodes: 25                   │
│  Genres: Action, Drama, Fantasy │
│  Studios: Wit Studio            │
│                                 │
│  ★ Rating: 8.70                 │
│  👥 Popularity: #5              │
│                                 │
│  Description:                   │
│  "Centuries ago, humanity..."   │
│  ...                            │
│                                 │
│  [Import]                       │
└─────────────────────────────────┘
```

### AniList Result
```
┌─────────────────────────────────┐
│  Title: Demon Slayer            │
│  (鬼滅の刃)                     │
│                                 │
│  [Banner Image + Cover]         │
│                                 │
│  Year: 2019                     │
│  Episodes: 26                   │
│  Genres: Action, Adventure      │
│  Studios: ufotable              │
│                                 │
│  ★ Rating: 8.55                 │
│  Trending: #3                   │
│                                 │
│  Description:                   │
│  "Tanjiro's sister is turned..." │
│  ...                            │
│                                 │
│  [Import]                       │
└─────────────────────────────────┘
```

---

## What Gets Saved

```
Database Entry:
┌──────────────────────────────────────────────┐
│ Anime Record                                 │
├──────────────────────────────────────────────┤
│ ID: 256                                      │
│ Title: "Demon Slayer"                        │
│ Description: "2000+ characters from API"     │
│ Genre: "Action, Adventure, Demons"           │
│ Year: 2019                                   │
│ Studio: "ufotable"                           │
│ ImageUrl: "https://api.anilist.co/..."       │
│                                              │
│ [External Tracking]                          │
│ malId: 38000                    (NEW)        │
│ anilistId: 101922               (NEW)        │
│ externalSource: "anilist"       (NEW)        │
│ externalRating: 8.55            (NEW)        │
│ externalPopularity: 3           (NEW)        │
│ lastSyncedAt: 2026-01-17        (NEW)        │
│                                              │
│ createdAt: 2026-01-17                        │
│ updatedAt: 2026-01-17                        │
└──────────────────────────────────────────────┘
```

---

## Common Actions

### ✅ Successful Import
```
✅ Success Toast
"Anime imported successfully"
or
"Anime updated with external data"
```

### ⚠️ Already Exists
```
ℹ️ Info Toast
"Anime with this title already exists"
(System updates with better data)
```

### ❌ Error Cases
```
❌ Error Toast
"Failed to import anime"
"Anime not found on source"
"Network error - please retry"
```

---

## Keyboard Shortcuts (Coming Soon)

```
Ctrl+F       - Focus search box
Ctrl+Enter   - Start search
Shift+Click  - Import all visible
```

---

## Tips & Tricks

🎯 **Best Sources**
- Popular anime → Use MyAnimeList
- Recent releases → Use AniList
- Recommendations → Use AniList only

⚡ **Speed Tips**
- Sync Popular is fastest for bulk import
- Search is faster on AniList
- Check duplicates before import

🖼️ **Image Quality**
- Always uses highest quality available
- Falls back gracefully if unavailable
- Never overwrites existing good images

🔄 **Sync Strategy**
- Initial setup: Sync popular from both
- Maintain: Weekly MAL sync
- Updates: Monthly full sync

---

## Need Help?

1. **Check tooltip** on each button
2. **Read error message** - it explains what went wrong
3. **Review guide** - `EXTERNAL_API_GUIDE.md`
4. **Check console** - Browser dev tools (F12)

---

**Last Updated**: January 17, 2026  
**Version**: 1.0 - Complete
