# 🧪 Quick Testing Guide - Real-Time Features & Gamification

## ✅ Pre-Flight Checks

### 1. Dev Server Running ✅
```
http://localhost:3000
Status: Should load without errors
```

### 2. Database Connected ✅
```bash
# Check database exists
ls prisma/dev.db
# Should exist and be readable
```

### 3. Prisma Migrations Applied ✅
```bash
cd c:\Users\20197\Desktop\wakawaka
npm run db:migrate
# Output should show: "Your database is now in sync with your schema."
```

---

## 🎮 Test the Gamification System

### Test 1: Check Achievements API
```bash
# Get all achievements (should return empty array initially)
curl http://localhost:3000/api/achievements

# Create a test achievement (admin only in production)
curl -X POST http://localhost:3000/api/achievements \
  -H "Content-Type: application/json" \
  -d '{
    "name": "First Steps",
    "description": "Watch your first anime",
    "icon": "🎬",
    "condition": "first_watch",
    "rarity": "common"
  }'
```

### Test 2: Check Activity Streak API
```bash
# Get user streak (userId=1 is test user)
curl http://localhost:3000/api/streak?userId=1

# Log activity for user
curl -X POST http://localhost:3000/api/streak \
  -H "Content-Type: application/json" \
  -d '{"userId": 1}'

# Response should show updated streak
```

### Test 3: Check Recently Watched API
```bash
# Get recently watched (initially empty)
curl http://localhost:3000/api/recently-watched?userId=1

# Add anime to recently watched
curl -X POST http://localhost:3000/api/recently-watched \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "animeId": 1,
    "progress": 25
  }'

# Should return the created entry with anime details
```

---

## 🌐 Test Real-Time Features

### Test 1: WebSocket Hook in Browser Console
```typescript
// Open DevTools Console and test:

// 1. Check if hook loads
import { useWebSocket } from "@/hooks/useWebSocket";
// Should import without errors

// 2. Check WebSocket types
import { createWSMessage } from "@/lib/websocket";
const msg = createWSMessage("achievement:unlocked", 1, {
  achievementId: 5,
  name: "Achievement Name"
});
console.log(msg);
// Should output message object with timestamp
```

### Test 2: Live Notifications
- Login to profile page at `http://localhost:3000/profile`
- Look top-right corner for connection status indicator
- Status should show: 🟢 "Live" (green dot = connected)
- Or 🔴 "Connecting..." if WebSocket server not running yet

### Test 3: Component Rendering
- Navigate to `http://localhost:3000/profile`
- Click "Полоса" tab → should see Activity Streak component
- Click "Недавно" tab → should see Recently Watched component
- Click "Достижения" tab → should see Achievements component
- All should render without errors

---

## 🎨 Test UI/UX

### Visual Elements
```
✅ Activity Streak Display
   - Fire emoji counter
   - Current streak number
   - Best streak display
   - "Log Activity" button
   - Last activity date

✅ Recently Watched Grid
   - Anime card images
   - Progress bars at bottom
   - Progress percentage
   - Hover effects
   - Click to navigate

✅ Achievements Grid
   - Achievement icons/emojis
   - Rarity color coding
   - Badge labels
   - Unlock dates
   - Tooltip information

✅ Live Notification Center
   - Top-right positioning
   - Connection indicator
   - Auto-dismissing notifications
   - Smooth animations
```

---

## 📊 Test Database Integration

### Check Database Schema
```bash
# Using sqlite3 (if installed):
sqlite3 prisma/dev.db

# Check tables exist:
.tables
# Should show: achievements, activity_streaks, recently_watched, etc.

# Check sample data:
SELECT * FROM achievements;
SELECT * FROM user_achievements;
SELECT * FROM activity_streaks;
SELECT * FROM recently_watched;

# Exit
.exit
```

---

## 🔍 Test Error Handling

### Test 1: Invalid User ID
```bash
curl http://localhost:3000/api/streak?userId=999999
# Should return: 500 or handle gracefully
```

### Test 2: Missing Required Fields
```bash
curl -X POST http://localhost:3000/api/recently-watched \
  -H "Content-Type: application/json" \
  -d '{"userId": 1}'
# Should return: 400 error with message
```

### Test 3: Duplicate Achievement Unlock
```bash
# Unlock same achievement twice
curl -X POST http://localhost:3000/api/achievements/unlock \
  -H "Content-Type: application/json" \
  -d '{"userId": 1, "achievementId": 1}'

# Second time
curl -X POST http://localhost:3000/api/achievements/unlock \
  -H "Content-Type: application/json" \
  -d '{"userId": 1, "achievementId": 1}'
# Should return: "Already unlocked" message, not error
```

---

## 🚀 Performance Tests

### Test 1: API Response Time
```bash
# Use curl with time flag
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:3000/api/achievements

# Check time_total should be <200ms
```

### Test 2: Component Render Performance
- Open DevTools → Performance tab
- Navigate to profile page
- Record performance
- Check: No jank, smooth animations
- Timeline should show consistent 60 FPS

### Test 3: Memory Usage
- Open DevTools → Memory tab
- Take heap snapshot
- Navigate between tabs
- Take another snapshot
- Should not see memory leaks (heap growing)

---

## 📱 Test Responsive Design

### Mobile (375px width)
- [ ] Activity Streak Display - readable
- [ ] Recently Watched - grid adapts
- [ ] Achievements - fits without horizontal scroll
- [ ] Notifications - positioned correctly

### Tablet (768px width)
- [ ] All components display properly
- [ ] Grid layouts adjust
- [ ] No overflow issues

### Desktop (1920px width)
- [ ] All components use available space
- [ ] Proper grid columns
- [ ] Good use of screen real estate

---

## ✅ Manual Testing Checklist

```
API Endpoints:
  [ ] GET /api/achievements
  [ ] GET /api/achievements?userId=1
  [ ] POST /api/achievements
  [ ] POST /api/achievements/unlock
  [ ] GET /api/streak
  [ ] POST /api/streak
  [ ] GET /api/recently-watched
  [ ] POST /api/recently-watched

Components:
  [ ] ActivityStreakDisplay renders
  [ ] RecentlyWatchedSection renders
  [ ] AchievementsDisplay renders
  [ ] LiveNotificationCenter renders
  [ ] No console errors
  [ ] All props typed correctly

Features:
  [ ] Can unlock achievement
  [ ] Streak updates on activity log
  [ ] Recently watched list updates
  [ ] Notifications display
  [ ] Animations work smoothly
  [ ] Mobile responsive

Database:
  [ ] Tables created
  [ ] Data persists
  [ ] No query errors
  [ ] Indexes working
  [ ] Relationships valid
```

---

## 🐛 Debugging Tips

### Check Console Errors
```javascript
// In browser console
// Look for any errors in red
// Common issues:
// - Module not found
// - Undefined context
// - Invalid props
```

### Check Network Requests
```
DevTools → Network tab
- Monitor API calls
- Check response codes (should be 200, 201, 400, 500)
- Check payload sizes
- Look for failed requests
```

### Check Component Props
```typescript
// Use React DevTools to inspect
// Right-click component → Inspect
// Check props passed to component
// Verify types match TypeScript definitions
```

### Check Database Queries
```
// Enable Prisma logging
// Set env: DEBUG=prisma:*
// See all database queries
```

---

## 📞 Troubleshooting

### Issue: "useToast not found"
- ✅ Fixed: Updated imports to use toast-provider
- Verify: `import { useToast } from "@/components/toast-provider"`

### Issue: "Module not found: useWebSocket"
- ✅ Fixed: Created useWebSocket hook
- Verify: File exists at `src/hooks/useWebSocket.ts`

### Issue: "Database schema mismatch"
- ✅ Fixed: Run migrations
- Command: `npm run db:migrate`

### Issue: "API returning 500"
- Check: Database connection
- Check: Prisma schema valid
- Check: User exists in database

### Issue: "Components not rendering"
- Check: ToastProvider wrapping app
- Check: Providers component active
- Check: No TypeScript errors

---

## 🎯 Success Criteria

All tests pass when:
```
✅ Dev server runs without errors
✅ All APIs return data or appropriate errors
✅ Components render without console errors
✅ Database contains new tables
✅ UI elements display correctly
✅ Animations are smooth
✅ Mobile responsive
✅ No memory leaks
✅ Performance targets met (<200ms API, 60 FPS UI)
✅ All TypeScript types valid
```

---

## 📊 Test Results Template

```
Date: ___________
Tester: ___________

API Tests:
- Achievements: ✅ ❌
- Streak: ✅ ❌  
- Recently Watched: ✅ ❌

Component Tests:
- ActivityStreak: ✅ ❌
- RecentlyWatched: ✅ ❌
- Achievements: ✅ ❌
- LiveNotifications: ✅ ❌

UI/UX Tests:
- Mobile: ✅ ❌
- Tablet: ✅ ❌
- Desktop: ✅ ❌

Performance:
- API <200ms: ✅ ❌
- 60 FPS: ✅ ❌
- No leaks: ✅ ❌

Overall Status: ✅ PASS ❌ FAIL

Notes: _______________________
```

---

**Happy Testing!** 🎉

All systems are ready to go. The platform is equipped with production-ready real-time features and gamification!
