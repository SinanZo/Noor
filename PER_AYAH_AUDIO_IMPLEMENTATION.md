# Per-Ayah Audio Player & Download Manager Implementation

## 🎉 Server-Side Complete!

All server-side features have been implemented:

### ✅ Completed Server Features:

1. **Per-Ayah Audio Proxy** - `/api/v1/audio/ayah/:surah/:ayah`
   - Supports both `global` mode (1-6236) and `surahPath` mode
   - Configurable via environment variables
   - Same-origin caching with immutable cache headers

2. **Quran Utility Helpers** - `server/src/utils/quranHelpers.js`
   - `versesPerSurah` array (114 surahs)
   - `globalAyahIndex()` function for audio routing
   - `isValidAyah()` validation
   - `getVersesInSurah()` helper

3. **Progress Tracking** - `server/src/models/SurahProgress.js`
   - Track last ayah per surah per user
   - Auto-resume feature support
   - Timestamp tracking

4. **Bookmarks** - `server/src/models/Bookmark.js`
   - Save favorite ayahs with optional notes
   - Per-user bookmark management
   - Unique constraint on user/surah/ayah

5. **User Quran API** - `/api/v1/quran/user/*`
   - `GET /progress` - Get all progress
   - `GET /progress/:surah` - Get surah progress
   - `POST /progress` - Save progress
   - `GET /bookmarks` - List bookmarks
   - `POST /bookmarks` - Add/update bookmark
   - `DELETE /bookmarks/:id` - Delete bookmark

### 📝 Environment Variables Added:

```env
# Per-Ayah Audio Proxy
AYAH_AUDIO_MODE=global        # global | surahPath
AYAH_AUDIO_BASE_URL=https://cdn.islamic.network/quran/audio/128
AYAH_AUDIO_RECITER=ar.alafasy
```

---

## 🚀 Client-Side Implementation Guide

The following files need to be created on the client side. I recommend creating them one at a time and testing each feature:

### Step 1: Service Worker with Download Manager (v3)

**File:** `client/public/sw.js`

Replace the entire file with:

```javascript
const VERSION = 'noor-v3';
const CORE = ['/', '/manifest.json'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => 
      Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const { request } = e;
  if (request.method !== 'GET') return;
  
  e.respondWith(
    caches.match(request).then(cached => 
      cached || fetch(request).then(resp => {
        const copy = resp.clone();
        caches.open(VERSION).then(c => c.put(request, copy));
        return resp;
      }).catch(() => cached)
    )
  );
});

async function broadcast(msg) {
  const all = await self.clients.matchAll({ includeUncontrolled: true });
  all.forEach(c => c.postMessage(msg));
}

self.addEventListener('message', (e) => {
  const data = e.data || {};
  
  if (data.type === 'CACHE_BATCH' && Array.isArray(data.urls)) {
    const id = data.id || String(Date.now());
    const urls = data.urls;
    
    e.waitUntil((async () => {
      let done = 0;
      await caches.open(VERSION);
      
      for (const u of urls) {
        try {
          const resp = await fetch(u, { cache: 'no-cache' });
          if (resp.ok) {
            const copy = resp.clone();
            const cache = await caches.open(VERSION);
            await cache.put(u, copy);
          }
        } catch (_) {}
        
        done++;
        broadcast({ type: 'CACHE_PROGRESS', id, done, total: urls.length });
      }
      
      broadcast({ type: 'CACHE_COMPLETE', id, total: urls.length });
    })());
  }
  
  if (data.type === 'UNCACHE_URLS' && Array.isArray(data.urls)) {
    e.waitUntil((async () => {
      const cache = await caches.open(VERSION);
      await Promise.all(data.urls.map(u => cache.delete(u)));
    })());
  }
});
```

### Step 2: Download Manager Overlay Component

**File:** `client/src/components/DownloadManagerOverlay.tsx`

```typescript
'use client';
import { useEffect, useState } from 'react';

type Task = { 
  id: string; 
  done: number; 
  total: number; 
  startedAt: number 
};

export function startCachingBatch(urls: string[], id?: string) {
  const batchId = id || `batch-${Date.now()}`;
  
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(reg => {
      reg.active?.postMessage({ type: 'CACHE_BATCH', id: batchId, urls });
    });
  }
  
  const event = new CustomEvent('noor-cache-start', { 
    detail: { id: batchId, total: urls.length } 
  });
  window.dispatchEvent(event);
  
  return batchId;
}

export default function DownloadManagerOverlay() {
  const [tasks, setTasks] = useState<Record<string, Task>>({});

  useEffect(() => {
    const onStart = (e: any) => {
      const { id, total } = e.detail;
      setTasks(prev => ({ 
        ...prev, 
        [id]: { id, done: 0, total, startedAt: Date.now() } 
      }));
    };
    
    function onMsg(e: MessageEvent) {
      const data = e.data || {};
      
      if (data.type === 'CACHE_PROGRESS') {
        setTasks(prev => ({ 
          ...prev, 
          [data.id]: { 
            ...(prev[data.id] || { id: data.id, startedAt: Date.now(), total: data.total }), 
            done: data.done, 
            total: data.total 
          } 
        }));
      }
      
      if (data.type === 'CACHE_COMPLETE') {
        setTimeout(() => {
          setTasks(prev => {
            const copy = { ...prev };
            delete copy[data.id];
            return copy;
          });
        }, 1200);
      }
    }
    
    window.addEventListener('noor-cache-start', onStart as any);
    navigator.serviceWorker?.addEventListener('message', onMsg as any);
    
    return () => {
      window.removeEventListener('noor-cache-start', onStart as any);
      navigator.serviceWorker?.removeEventListener('message', onMsg as any);
    };
  }, []);

  const entries = Object.values(tasks);
  if (!entries.length) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[1000] w-80 space-y-2">
      {entries.map(t => {
        const pct = t.total ? Math.min(100, Math.round((t.done / t.total) * 100)) : 0;
        return (
          <div 
            key={t.id} 
            className="rounded-2xl border bg-white/90 dark:bg-gray-800/90 backdrop-blur p-4 shadow-lg"
          >
            <div className="text-sm font-medium mb-1">Downloading…</div>
            <div className="text-xs opacity-70 mb-2">{t.done}/{t.total}</div>
            <div className="h-2 rounded bg-gray-200 dark:bg-gray-700 overflow-hidden">
              <div 
                className="h-full bg-emerald-600 transition-all" 
                style={{ width: `${pct}%` }} 
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
```

### Step 3: Mount Download Manager in _app.tsx

**File:** `client/src/pages/_app.tsx`

Add these imports at the top:

```typescript
import dynamic from 'next/dynamic';
const DownloadManagerOverlay = dynamic(
  () => import('@/components/DownloadManagerOverlay'), 
  { ssr: false }
);
```

Then in the return statement, add the overlay component before the closing tag:

```tsx
return (
  <I18nextProvider i18n={i18n}>
    <AuthProvider>
      <Component {...pageProps} />
      <DownloadManagerOverlay />
    </AuthProvider>
  </I18nextProvider>
);
```

### Step 4: Enhanced Per-Ayah Player Component

This is a large component. Due to length limitations, I'll provide it in the next file...

---

## 📋 Testing Checklist

### Server Tests:
- [ ] `GET /api/v1/audio/ayah/1/1` returns audio
- [ ] `POST /api/v1/quran/user/progress` (with JWT) saves progress
- [ ] `GET /api/v1/quran/user/progress/1` retrieves progress
- [ ] `POST /api/v1/quran/user/bookmarks` adds bookmark
- [ ] `GET /api/v1/quran/user/bookmarks` lists bookmarks

### Client Tests:
- [ ] Service Worker registers and caches resources
- [ ] Download Manager overlay appears when caching
- [ ] Progress bar updates in real-time
- [ ] Overlay disappears after completion

---

## 🎯 Next Steps

1. **Restart MongoDB** if it's not running:
   ```powershell
   Start-Process mongod -ArgumentList "--dbpath `"$env:USERPROFILE\mongodb-data`"" -WindowStyle Normal
   ```

2. **Restart Server**:
   ```powershell
   cd server
   pnpm dev
   ```

3. **Test Per-Ayah Audio**:
   ```powershell
   curl http://localhost:5000/api/v1/audio/ayah/1/1
   ```

4. **Implement Client Components** (Steps 1-3 above)

5. **Create Enhanced Player** (see PLAYER_COMPONENT.md)

---

## 📄 Additional Documentation

I'll create a separate file with the full Player component implementation since it's quite large.

