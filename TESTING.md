# WakaWaka Features Integration Test Guide

## Quick Start Testing

### 1. **Access Development Server**
- Navigate to: `http://localhost:3000`
- Port will default to 3000, or next available if in use
- Check terminal output for exact URL

### 2. **Test Notification System**

#### Test Case: NotificationCenter
1. **Location:** Top-right of header (bell icon)
2. **Expected Behavior:**
   - Bell icon displays unread count badge
   - Click to open dropdown
   - Shows last 20 notifications
   - "Mark all as read" button appears
   - Auto-refreshes every 30 seconds

3. **Manual Testing:**
   ```bash
   # In browser console, create test notification
   fetch('/api/notifications', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ type: 'test', title: 'Test', message: 'Test notification' })
   })
   ```

4. **Verification Points:**
   - ✅ Badge shows correct count
   - ✅ Dropdown appears/disappears on click
   - ✅ Notifications display correctly
   - ✅ Click outside closes dropdown
   - ✅ "Mark all as read" works

---

### 3. **Test Search with Quick Preview**

#### Test Case: SearchBar + AnimePreviewModal
1. **Location:** Center of header
2. **Expected Behavior:**
   - Type anime name to get suggestions
   - Recent searches shown below suggestions
   - Click suggestion to open preview modal
   - Preview shows anime details

3. **Manual Testing:**
   ```typescript
   // Search workflow
   1. Click search bar
   2. Type "Naruto" or similar
   3. See suggestions appear
   4. See recent searches
   5. Click a suggestion
   6. Modal opens with anime details
   7. Can add to watchlist from modal
   ```

4. **Verification Points:**
   - ✅ Autocomplete suggestions appear
   - ✅ Recent searches load
   - ✅ Clear history button works
   - ✅ Preview modal opens on suggestion click
   - ✅ "Add to Watchlist" button works
   - ✅ Modal closes smoothly

---

### 4. **Test Quick Preview on Anime Card**

#### Test Case: AnimeQuickPreview on Home Page
1. **Location:** Any anime card (homepage, trending, etc.)
2. **Expected Behavior:**
   - Hover over card shows eye icon
   - Click eye icon opens preview modal
   - Shows anime details
   - Can add to watchlist
   - No page navigation

3. **Manual Testing:**
   ```
   1. Go to homepage or trending page
   2. Hover over anime card
   3. Eye icon appears in center
   4. Click eye icon
   5. Preview modal opens
   6. Can interact with watchlist button
   7. Click close or outside to close
   ```

4. **Verification Points:**
   - ✅ Eye icon appears on hover
   - ✅ Click doesn't navigate away
   - ✅ Modal opens with correct anime data
   - ✅ Modal closes properly
   - ✅ Can add to watchlist

---

### 5. **Test User Rankings Page**

#### Test Case: Leaderboard with Quick View
1. **Location:** Click Trophy icon in header → Rankings
2. **Expected Behavior:**
   - Loads top 100 users
   - Shows medals for top 3 (🥇🥈🥉)
   - Displays position, username, rank tier, stats
   - Quick preview eye icon on hover

3. **Manual Testing:**
   ```
   1. Click Rankings (Trophy icon)
   2. See leaderboard load
   3. Hover over first user card
   4. Eye icon appears on avatar
   5. Click eye icon
   6. User quick view modal opens
   7. Shows user stats and activity score
   8. Can click "View Full Profile"
   9. Modal closes properly
   ```

4. **Verification Points:**
   - ✅ Medals display correctly (🥇🥈🥉#4)
   - ✅ All stats visible on desktop
   - ✅ Compact layout on mobile
   - ✅ Quick view modal opens
   - ✅ User data loads correctly
   - ✅ Activity score progress bar shows
   - ✅ Rank badge displays (Legendary/Master/Expert/etc)

---

### 6. **Test UserQuickView Modal**

#### Test Case: User Profile Quick View
1. **Location:** Any user interaction (leaderboard, rankings, comments)
2. **Expected Behavior:**
   - Shows user avatar, name, rank
   - Displays stats grid (ratings, comments, anime, friends, score)
   - Activity score with progress bar
   - Link to full profile

3. **Verification Points:**
   - ✅ Avatar loads correctly
   - ✅ Username displays
   - ✅ Rank badge matches score tier
   - ✅ All stats numbers display
   - ✅ Activity score bar fills to correct percentage
   - ✅ Progress bar color is correct (cyan/magenta gradient)
   - ✅ Profile link works

---

## Browser Testing Checklist

### Desktop Testing (1920x1080)
- [ ] All modals center properly
- [ ] No overlapping UI elements
- [ ] Hover effects work smooth
- [ ] Keyboard navigation works (Tab, Enter, Esc)
- [ ] Click outside closes modals

### Mobile Testing (375x667 - iPhone)
- [ ] Modals fit screen
- [ ] Touch interactions work (no hover issues)
- [ ] Stats display correctly (abbreviated on mobile)
- [ ] Leaderboard shows compact view
- [ ] SearchBar fully functional

### Tablet Testing (768x1024 - iPad)
- [ ] Responsive design transitions work
- [ ] All features accessible
- [ ] Touch-friendly button sizes

---

## Performance Testing

### 1. **Load Times**
```bash
# Check Network tab in DevTools
- AnimePreviewModal load: < 500ms
- UserQuickView load: < 500ms
- Leaderboard page load: < 2s
```

### 2. **Search Autocomplete**
```bash
# Type in search bar while watching Network tab
- Initial suggestions: < 300ms
- Suggestions update: < 200ms per keystroke
```

### 3. **Notification Updates**
```bash
# Watch Network tab
- Polling interval: 30s
- Load time: < 100ms
```

---

## Error Handling Tests

### Test Case: API Error Handling
1. **Missing Data:**
   ```bash
   # Test with invalid anime ID
   http://localhost:3000/anime/999999
   ```
   - [ ] Error message displays
   - [ ] Toast notification shows
   - [ ] No JavaScript errors in console

2. **Network Error:**
   ```bash
   # Simulate offline (DevTools)
   1. Open DevTools → Network
   2. Set throttling to "Offline"
   3. Try using any feature
   ```
   - [ ] Error handled gracefully
   - [ ] User sees error message
   - [ ] UI doesn't break

3. **Authentication Error:**
   ```bash
   # Test when not logged in
   1. Log out
   2. Try to add to watchlist from preview
   ```
   - [ ] Should redirect to login or show message
   - [ ] Error handled correctly

---

## API Endpoint Verification

### 1. **Test /api/anime/{id}**
```bash
curl http://localhost:3000/api/anime/1

Expected response:
{
  "id": 1,
  "title": "...",
  "description": "...",
  "genre": "...",
  "year": 2024,
  "studio": "...",
  "imageUrl": "...",
  "averageRating": 8.5,
  "ratingsCount": 150,
  "commentsCount": 42
}
```

### 2. **Test /api/rankings**
```bash
curl http://localhost:3000/api/rankings?limit=10

Expected response:
{
  "users": [
    {
      "userId": "...",
      "user": { "username": "...", "avatar": "..." },
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

### 3. **Test /api/search-history**
```bash
# GET - retrieve history
curl http://localhost:3000/api/search-history

# POST - save search
curl -X POST http://localhost:3000/api/search-history \
  -H "Content-Type: application/json" \
  -d '{"query": "Naruto"}'

# DELETE - clear history
curl -X DELETE http://localhost:3000/api/search-history
```

### 4. **Test /api/notifications**
```bash
# GET - fetch notifications
curl http://localhost:3000/api/notifications

# PUT - mark as read
curl -X PUT http://localhost:3000/api/notifications \
  -H "Content-Type: application/json" \
  -d '{"id": 1, "read": true}'

# POST - mark all as read
curl -X POST http://localhost:3000/api/notifications
```

---

## Console Error Handling

### Expected Warnings (Safe to Ignore)
- `Warning: Unknown at-rule or directive @supports`
- `Warning: useCallback has an unnecessary dependency`
- Deprecation warnings for images.domains

### Errors to Fix
- `Failed to load anime details`
- `Failed to load user`
- `Failed to fetch rankings`
- Any uncaught promise rejections
- React hook dependency warnings (should see none after fixes)

---

## Data Verification

### Check if UserStats are populated
```bash
# In browser console (with Prisma Client)
db.userStats.findMany({ take: 5 })

# Should return stats for users
```

### Check if SearchHistory is saved
```bash
# After searching, check database
db.searchHistory.findMany({ 
  where: { userId: currentUserId },
  take: 10,
  orderBy: { createdAt: 'desc' }
})
```

### Check if Notifications exist
```bash
db.notification.findMany({ 
  take: 10,
  orderBy: { createdAt: 'desc' }
})
```

---

## Accessibility Testing

### Keyboard Navigation
- [ ] Can tab through all interactive elements
- [ ] Modals close with Esc key
- [ ] Enter key opens search results
- [ ] Focus indicators visible
- [ ] No keyboard traps

### Screen Reader Testing
- [ ] Bell icon has aria-label
- [ ] Eye icon buttons have titles
- [ ] Modal has aria-modal="true"
- [ ] Close button accessible
- [ ] Stats have proper semantic HTML

---

## Rollback Procedure (if needed)

### If issues occur:
```bash
# Revert Prisma schema
git checkout prisma/schema.prisma

# Delete migration
rm prisma/migrations/20260116144825_add/migration.sql

# Reset database
rm dev.db

# Reinstall and rebuild
bun install
bun run build
```

---

## Success Criteria

All tests should pass:
- ✅ All new components render without errors
- ✅ Modals open and close smoothly
- ✅ Data loads correctly
- ✅ Responsive design works
- ✅ No console errors
- ✅ Performance is acceptable
- ✅ Error handling is graceful
- ✅ All features work as described

---

## Bug Reporting Template

If issues found:
```
**Feature:** [Component Name]
**Action:** [What you did]
**Expected:** [What should happen]
**Actual:** [What actually happened]
**Browser:** [Chrome/Firefox/Safari]
**Device:** [Desktop/Mobile/Tablet]
**Console Error:** [Any JavaScript errors]
**Screenshot:** [If applicable]
```

---

## Next Steps After Testing

1. Fix any identified bugs
2. Test again on different browsers
3. Test with multiple users if possible
4. Check mobile responsiveness thoroughly
5. Monitor error logs for edge cases
6. Deploy to staging environment
7. Production deployment

---

## Support

For questions or issues:
1. Check FEATURES.md for component documentation
2. Review API endpoint specs in this document
3. Check server logs: `tail -f .next/dev.log`
4. Check browser console DevTools for errors
5. Verify database is running: `prisma studio`
