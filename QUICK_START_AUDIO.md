# 🚀 Quick Start: Per-Ayah Audio Implementation

## TL;DR - What's Done

### ✅ Server-Side (100% Complete)
All server code has been implemented and is ready to use:
- Per-ayah audio streaming
- Progress tracking API
- Bookmarks API
- Quran utility helpers
- Database models

### 📝 Client-Side (Code Ready, Needs Copy-Paste)
Complete client code is documented and ready to copy:
- Service Worker v3
- Download Manager Overlay
- Enhanced Per-Ayah Player Component

---

## ⚡ 3-Minute Implementation

### Step 1: Test Server (30 seconds)

```powershell
# Ensure MongoDB is running
mongosh --eval "db.version()"

# Start server
cd server
pnpm dev

# Test in another terminal
curl http://localhost:5000/api/v1/audio/ayah/1/1
# Should return audio stream
```

✅ If audio streams, server is working!

### Step 2: Copy Client Files (2 minutes)

**File 1: Service Worker**
- Open: `client/public/sw.js`
- **Replace entire file** with code from `PER_AYAH_AUDIO_IMPLEMENTATION.md` (Step 1)

**File 2: Download Manager**
- Create: `client/src/components/DownloadManagerOverlay.tsx`
- Copy code from `PER_AYAH_AUDIO_IMPLEMENTATION.md` (Step 2)

**File 3: Mount Overlay**
- Open: `client/src/pages/_app.tsx`
- Add these lines at top:
  ```tsx
  import dynamic from 'next/dynamic';
  const DownloadManagerOverlay = dynamic(
    () => import('@/components/DownloadManagerOverlay'), 
    { ssr: false }
  );
  ```
- Add `<DownloadManagerOverlay />` before closing tag

**File 4: Player Component**
- Create: `client/src/components/quran/SurahPerAyahPlayer.tsx`
- Copy **entire component** from `PLAYER_COMPONENT.md`

**File 5: Integrate Player**
- Open: `client/src/pages/quran/index.tsx`
- Import: `import SurahPerAyahPlayer from '@/components/quran/SurahPerAyahPlayer';`
- Replace `<QuranReader />` with:
  ```tsx
  <SurahPerAyahPlayer 
    surah={selectedSurah} 
    ayat={ayatData} 
  />
  ```

### Step 3: Test (30 seconds)

```powershell
cd client
pnpm dev
```

Visit: http://localhost:3000
- Click a surah
- Click an ayah
- Audio should play with highlighting!

---

## 📋 Feature Checklist

Test these features:

### Basic Playback:
- [ ] Click ayah → plays audio
- [ ] Auto-advances to next ayah
- [ ] Current ayah highlights
- [ ] Auto-scrolls into view
- [ ] Play/Pause button works

### Advanced Controls:
- [ ] Speed control (0.5× to 2×)
- [ ] Previous/Next buttons
- [ ] Keyboard shortcuts (Space, Arrows)
- [ ] Progress indicator shows current/total

### A-B Repeat:
- [ ] Click "A" to set start point
- [ ] Click "B" to set end point
- [ ] Toggle loop → plays A to B repeatedly
- [ ] Clear button resets markers

### Progress & Bookmarks:
- [ ] Refresh page → resumes at last ayah
- [ ] Add bookmark with note
- [ ] Click bookmark → jumps to ayah
- [ ] Delete bookmark works

### Download Manager:
- [ ] Click "Save Offline" → overlay appears
- [ ] Progress bar updates
- [ ] Shows "X/Y" count
- [ ] Overlay disappears when done
- [ ] Test offline mode (DevTools → Network → Offline)

---

## 🎯 What Each File Does

### `server/src/utils/quranHelpers.js`
Calculates global ayah index (1-6236) from surah/ayah numbers. Used by audio proxy to fetch correct file.

### `server/src/routes/audioRoutes.js`
**New endpoint:** `GET /api/v1/audio/ayah/:surah/:ayah`
- Proxies audio from Islamic Network CDN
- Adds caching headers for offline support
- Supports two modes: global (1-6236) or surah-path

### `server/src/models/SurahProgress.js`
MongoDB model for tracking user's reading progress. Stores last ayah per surah.

### `server/src/models/Bookmark.js`
MongoDB model for user bookmarks. Stores surah/ayah/note.

### `server/src/controllers/quranUserController.js`
API handlers for progress and bookmarks. Validates ayah numbers, handles auth.

### `server/src/routes/quranUserRoutes.js`
Routes for `/api/v1/quran/user/*`. All protected with JWT auth.

### `client/public/sw.js`
Service Worker that caches audio and data for offline use. Responds to batch caching messages.

### `client/src/components/DownloadManagerOverlay.tsx`
Shows download progress overlay. Listens to Service Worker messages.

### `client/src/components/quran/SurahPerAyahPlayer.tsx`
Main player component with all features:
- Audio playback controls
- A-B repeat
- Speed control
- Progress tracking
- Bookmarks
- Auto-scroll
- Keyboard shortcuts

---

## 🔥 Quick Fixes

### "Audio not playing"
```powershell
# Check if server is running
curl http://localhost:5000/health

# Check if audio endpoint works
curl http://localhost:5000/api/v1/audio/ayah/1/1

# Check browser console for errors
```

### "Download Manager not showing"
1. Check `sw.js` is in `client/public/`
2. Hard refresh browser (Ctrl+Shift+R)
3. Open DevTools → Application → Service Workers
4. Verify "noor-v3" is active

### "Progress not saving"
1. Check if user is logged in (JWT token)
2. If not logged in, check localStorage (F12 → Application → Local Storage)
3. Check server logs for errors

### "Bookmarks not appearing"
1. Same as progress - check JWT/localStorage
2. Verify API endpoint: `/api/v1/quran/user/bookmarks`
3. Check network tab for 401 errors

---

## 📦 Dependencies

### Server (Already Installed):
```json
{
  "node-fetch": "^3.3.2"
}
```

### Client (May Need to Install):
None! Uses Next.js built-in features.

---

## 🌐 API URLs

### Audio:
```
GET http://localhost:5000/api/v1/audio/ayah/:surah/:ayah
```

### Progress (Protected):
```
GET http://localhost:5000/api/v1/quran/user/progress/:surah
POST http://localhost:5000/api/v1/quran/user/progress
  Body: { surah: number, ayah: number }
```

### Bookmarks (Protected):
```
GET http://localhost:5000/api/v1/quran/user/bookmarks?surah=X
POST http://localhost:5000/api/v1/quran/user/bookmarks
  Body: { surah: number, ayah: number, note?: string }
DELETE http://localhost:5000/api/v1/quran/user/bookmarks/:id
```

---

## 📖 Full Documentation

For detailed implementation:
- **PER_AYAH_AUDIO_IMPLEMENTATION.md** - Client step-by-step guide
- **PLAYER_COMPONENT.md** - Full player component code
- **IMPLEMENTATION_SUMMARY.md** - Complete feature overview

---

## ✨ That's It!

Server is ready. Client code is documented. Copy-paste and enjoy! 🎉

**Estimated time to complete:** 5-10 minutes

