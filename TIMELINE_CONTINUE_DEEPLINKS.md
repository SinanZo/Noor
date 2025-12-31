# Timeline UI + Continue Card + Deep Links Implementation

## Overview

This guide implements three advanced player features:

1. **Timeline UI Component** - Draggable slider with A-B repeat markers showing loop range
2. **Continue Reading Card** - Global "pick up where you left off" on home page
3. **Shareable Deep Links** - Full playback state in URL (`?ayah=5&play=1&a=3&b=7&loop=1&speed=1.25`)

All features work together:
- **Timeline** shows current position + loop range visually
- **Continue Card** uses latest progress API + localStorage fallback
- **Deep Links** restore full player state from URL
- **Cross-device sync** via JWT (web) + AsyncStorage (mobile)

---

## Architecture

### Server-Side (✅ COMPLETE)

**Endpoint**: `GET /api/v1/quran/user/progress/latest`
- **Auth**: JWT required via `Authorization: Bearer <token>`
- **Returns**: `{ userId, surah, ayah, updatedAt }` or `{}`
- **Implementation**: `server/src/controllers/quranUserController.js::getLatestProgress`
- **Route**: `server/src/routes/quranUserRoutes.js`

### Client-Side (TO IMPLEMENT)

**Files to create/modify**:
1. `client/src/components/quran/TimelineAB.tsx` - Timeline component
2. `client/src/components/home/ContinueReadingCard.tsx` - Continue card
3. `client/src/pages/quran/[surah].tsx` - Deep link parsing (modify existing)
4. `client/src/components/quran/SurahPerAyahPlayer.tsx` - Player enhancements (modify existing)

---

## 1. Timeline UI Component

### Create: `client/src/components/quran/TimelineAB.tsx`

```typescript
import React, { useRef, useEffect, useState } from 'react';

interface TimelineABProps {
  /** Total number of ayahs in surah */
  total: number;
  /** Current playback position (1-based) */
  current: number;
  /** A-B repeat start marker (1-based, null if disabled) */
  aMark: number | null;
  /** A-B repeat end marker (1-based, null if disabled) */
  bMark: number | null;
  /** Callback when current position changes (user drags main slider) */
  onCurrentChange: (ayah: number) => void;
  /** Callback when A marker changes */
  onAChange: (ayah: number | null) => void;
  /** Callback when B marker changes */
  onBChange: (ayah: number | null) => void;
}

export default function TimelineAB({
  total,
  current,
  aMark,
  bMark,
  onCurrentChange,
  onAChange,
  onBChange,
}: TimelineABProps) {
  const [isDraggingCurrent, setIsDraggingCurrent] = useState(false);
  const [isDraggingA, setIsDraggingA] = useState(false);
  const [isDraggingB, setIsDraggingB] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate percentages for visual positioning
  const currentPercent = ((current - 1) / (total - 1)) * 100;
  const aPercent = aMark ? ((aMark - 1) / (total - 1)) * 100 : 0;
  const bPercent = bMark ? ((bMark - 1) / (total - 1)) * 100 : 0;

  // Calculate loop range width and position
  const loopStart = aMark && bMark ? Math.min(aPercent, bPercent) : 0;
  const loopWidth = aMark && bMark ? Math.abs(bPercent - aPercent) : 0;

  // Convert pixel position to ayah number
  const getAyahFromPosition = (clientX: number): number => {
    if (!containerRef.current) return 1;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = x / rect.width;
    const ayah = Math.round(percent * (total - 1)) + 1;
    return Math.max(1, Math.min(ayah, total));
  };

  // Mouse/touch move handler
  const handleMove = (clientX: number) => {
    const ayah = getAyahFromPosition(clientX);
    if (isDraggingCurrent) onCurrentChange(ayah);
    if (isDraggingA) onAChange(ayah);
    if (isDraggingB) onBChange(ayah);
  };

  // Global mouse move/up handlers
  useEffect(() => {
    if (!isDraggingCurrent && !isDraggingA && !isDraggingB) return;

    const handleMouseMove = (e: MouseEvent) => handleMove(e.clientX);
    const handleTouchMove = (e: TouchEvent) => handleMove(e.touches[0].clientX);
    const handleEnd = () => {
      setIsDraggingCurrent(false);
      setIsDraggingA(false);
      setIsDraggingB(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchend', handleEnd);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isDraggingCurrent, isDraggingA, isDraggingB, total]);

  return (
    <div className="space-y-2">
      {/* Labels */}
      <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
        <span>Ayah {current} of {total}</span>
        {aMark && bMark && (
          <span className="text-blue-600 dark:text-blue-400">
            Loop: {Math.min(aMark, bMark)}-{Math.max(aMark, bMark)}
          </span>
        )}
      </div>

      {/* Timeline Container */}
      <div
        ref={containerRef}
        className="relative h-12 cursor-pointer select-none"
        onMouseDown={(e) => {
          // Click on track to jump current position
          if (e.target === e.currentTarget) {
            const ayah = getAyahFromPosition(e.clientX);
            onCurrentChange(ayah);
          }
        }}
      >
        {/* Track */}
        <div className="absolute top-5 left-0 right-0 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
          {/* Loop Range Highlight */}
          {aMark && bMark && (
            <div
              className="absolute h-full bg-gradient-to-r from-blue-400/30 to-purple-400/30 dark:from-blue-600/30 dark:to-purple-600/30 rounded-full"
              style={{
                left: `${loopStart}%`,
                width: `${loopWidth}%`,
              }}
            />
          )}

          {/* Progress (from start to current) */}
          <div
            className="absolute h-full bg-gradient-to-r from-green-500 to-blue-500 dark:from-green-600 dark:to-blue-600 rounded-full"
            style={{ width: `${currentPercent}%` }}
          />
        </div>

        {/* Current Position Thumb */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-white dark:bg-gray-800 border-2 border-blue-500 rounded-full shadow-lg cursor-grab active:cursor-grabbing z-30"
          style={{ left: `${currentPercent}%`, transform: 'translate(-50%, -50%)' }}
          onMouseDown={() => setIsDraggingCurrent(true)}
          onTouchStart={() => setIsDraggingCurrent(true)}
        >
          <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-blue-600">
            ▶
          </div>
        </div>

        {/* A Marker Thumb */}
        {aMark && (
          <div
            className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-green-500 dark:bg-green-600 rounded-full shadow cursor-grab active:cursor-grabbing z-20"
            style={{ left: `${aPercent}%`, transform: 'translate(-50%, -50%)' }}
            onMouseDown={() => setIsDraggingA(true)}
            onTouchStart={() => setIsDraggingA(true)}
          >
            <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
              A
            </div>
          </div>
        )}

        {/* B Marker Thumb */}
        {bMark && (
          <div
            className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-purple-500 dark:bg-purple-600 rounded-full shadow cursor-grab active:cursor-grabbing z-20"
            style={{ left: `${bPercent}%`, transform: 'translate(-50%, -50%)' }}
            onMouseDown={() => setIsDraggingB(true)}
            onTouchStart={() => setIsDraggingB(true)}
          >
            <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
              B
            </div>
          </div>
        )}
      </div>

      {/* A-B Controls */}
      <div className="flex gap-2 text-xs">
        <button
          onClick={() => onAChange(current)}
          className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Set A ({current})
        </button>
        <button
          onClick={() => onBChange(current)}
          className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          Set B ({current})
        </button>
        {(aMark || bMark) && (
          <button
            onClick={() => {
              onAChange(null);
              onBChange(null);
            }}
            className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Clear A-B
          </button>
        )}
      </div>
    </div>
  );
}
```

**Features**:
- ✅ Three draggable thumbs: Current position (blue), A marker (green), B marker (purple)
- ✅ Visual loop range highlight (gradient background)
- ✅ Click track to jump to position
- ✅ Quick set buttons: "Set A", "Set B", "Clear A-B"
- ✅ Mobile-friendly touch support
- ✅ Dark mode support

---

## 2. Continue Reading Card

### Create: `client/src/components/home/ContinueReadingCard.tsx`

```typescript
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { BookOpenIcon } from '@heroicons/react/24/outline';

interface Progress {
  surah: number;
  ayah: number;
  updatedAt?: string;
}

interface SurahMeta {
  number: number;
  englishName: string;
  arabicName: string;
  revelationType: string;
  numberOfAyahs: number;
}

export default function ContinueReadingCard() {
  const router = useRouter();
  const [progress, setProgress] = useState<Progress | null>(null);
  const [surahMeta, setSurahMeta] = useState<SurahMeta | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      // 1. Try JWT-authenticated API first (cross-device sync)
      const token = localStorage.getItem('token');
      if (token) {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/quran/user/progress/latest`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.surah && data.ayah) {
            setProgress(data);
            await fetchSurahMeta(data.surah);
            setLoading(false);
            return;
          }
        }
      }

      // 2. Fallback to localStorage (single-device)
      const localProgress = localStorage.getItem('noor_last');
      if (localProgress) {
        const data = JSON.parse(localProgress);
        if (data.surah && data.ayah) {
          setProgress(data);
          await fetchSurahMeta(data.surah);
          setLoading(false);
          return;
        }
      }

      // 3. No progress found
      setLoading(false);
    } catch (error) {
      console.error('Failed to load progress:', error);
      setLoading(false);
    }
  };

  const fetchSurahMeta = async (surah: number) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/quran/metadata/${surah}`);
      if (res.ok) {
        const data = await res.json();
        setSurahMeta(data);
      }
    } catch (error) {
      console.error('Failed to fetch surah metadata:', error);
    }
  };

  const handleContinue = () => {
    if (!progress) return;
    // Navigate with deep link: auto-play, scroll to ayah, restore state
    router.push(`/quran/${progress.surah}?ayah=${progress.ayah}&play=1#ayah-${progress.ayah}`);
  };

  // Don't render if no progress or still loading
  if (loading || !progress || !surahMeta) return null;

  const percentComplete = Math.round((progress.ayah / surahMeta.numberOfAyahs) * 100);

  return (
    <div
      onClick={handleContinue}
      className="group cursor-pointer bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
          <BookOpenIcon className="w-6 h-6 text-white" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            Continue Reading
          </h3>
          <p className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-1 truncate">
            {surahMeta.arabicName} - {surahMeta.englishName}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Ayah {progress.ayah} of {surahMeta.numberOfAyahs} • {percentComplete}% complete
          </p>

          {/* Progress Bar */}
          <div className="mt-3 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-500"
              style={{ width: `${percentComplete}%` }}
            />
          </div>

          {/* Last Updated */}
          {progress.updatedAt && (
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              Last read: {new Date(progress.updatedAt).toLocaleDateString()}
            </p>
          )}
        </div>

        {/* Arrow */}
        <div className="flex-shrink-0 text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  );
}
```

**Features**:
- ✅ JWT-first (cross-device sync)
- ✅ localStorage fallback (single device)
- ✅ Fetches surah metadata for display
- ✅ Shows progress bar with percentage
- ✅ Deep link with auto-play + scroll
- ✅ Hover animations
- ✅ Dark mode support

**Add to Home Page**:
```typescript
// client/src/pages/index.tsx
import ContinueReadingCard from '@/components/home/ContinueReadingCard';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Continue Reading Card - Only shows if progress exists */}
      <ContinueReadingCard />
      
      {/* Rest of home page content */}
      {/* ... */}
    </div>
  );
}
```

---

## 3. Deep Link Parsing & Player Enhancements

### Modify: `client/src/pages/quran/[surah].tsx`

Add deep link parsing:

```typescript
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function SurahPage() {
  const router = useRouter();
  const { surah, ayah, play, a, b, loop, speed } = router.query;

  // Parse query params into player props
  const initialAyah = ayah ? parseInt(ayah as string, 10) : 1;
  const shouldAutoPlay = play === '1';
  const initialA = a ? parseInt(a as string, 10) : null;
  const initialB = b ? parseInt(b as string, 10) : null;
  const shouldLoop = loop === '1';
  const initialSpeed = speed ? parseFloat(speed as string) : 1.0;

  // Scroll to ayah on mount (if hash present)
  useEffect(() => {
    if (router.asPath.includes('#ayah-')) {
      const targetId = router.asPath.split('#')[1];
      setTimeout(() => {
        const element = document.getElementById(targetId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 500); // Wait for page render
    }
  }, [router.asPath]);

  return (
    <div>
      <SurahPerAyahPlayer
        surah={parseInt(surah as string, 10)}
        initialAyah={initialAyah}
        autoPlay={shouldAutoPlay}
        initialA={initialA}
        initialB={initialB}
        initialLoop={shouldLoop}
        initialSpeed={initialSpeed}
      />

      {/* Ayah text with anchor IDs */}
      {ayahsData.map((ayah) => (
        <div
          key={ayah.numberInSurah}
          id={`ayah-${ayah.numberInSurah}`}
          className="py-4 border-b"
        >
          <p className="text-right text-2xl mb-2">{ayah.text}</p>
          <p className="text-sm text-gray-600">{ayah.numberInSurah}</p>
        </div>
      ))}
    </div>
  );
}
```

### Modify: `client/src/components/quran/SurahPerAyahPlayer.tsx`

Add new props and features:

```typescript
interface SurahPerAyahPlayerProps {
  surah: number;
  initialAyah?: number;
  autoPlay?: boolean;
  initialA?: number | null;
  initialB?: number | null;
  initialLoop?: boolean;
  initialSpeed?: number;
}

export default function SurahPerAyahPlayer({
  surah,
  initialAyah = 1,
  autoPlay = false,
  initialA = null,
  initialB = null,
  initialLoop = false,
  initialSpeed = 1.0,
}: SurahPerAyahPlayerProps) {
  const [currentAyah, setCurrentAyah] = useState(initialAyah);
  const [isPlaying, setIsPlaying] = useState(false);
  const [aMark, setAMark] = useState<number | null>(initialA);
  const [bMark, setBMark] = useState<number | null>(initialB);
  const [loopEnabled, setLoopEnabled] = useState(initialLoop);
  const [playbackSpeed, setPlaybackSpeed] = useState(initialSpeed);
  const audioRef = useRef<HTMLAudioElement>(null);
  const router = useRouter();

  // Initialize from props
  useEffect(() => {
    if (autoPlay) {
      // Auto-play after mount
      setTimeout(() => playAyah(currentAyah), 1000);
    }
  }, []);

  // Save progress to backend + localStorage
  const saveProgress = async (ayah: number) => {
    // 1. Save to backend (JWT)
    const token = localStorage.getItem('token');
    if (token) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/quran/user/progress`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ surah, ayah }),
        });
      } catch (error) {
        console.error('Failed to save progress to backend:', error);
      }
    }

    // 2. Save to localStorage (fallback)
    localStorage.setItem('noor_last', JSON.stringify({
      surah,
      ayah,
      updatedAt: new Date().toISOString(),
    }));
  };

  // Generate shareable link
  const getShareLink = () => {
    const params = new URLSearchParams();
    params.set('ayah', currentAyah.toString());
    if (isPlaying) params.set('play', '1');
    if (aMark) params.set('a', aMark.toString());
    if (bMark) params.set('b', bMark.toString());
    if (loopEnabled) params.set('loop', '1');
    if (playbackSpeed !== 1.0) params.set('speed', playbackSpeed.toString());

    const baseUrl = window.location.origin;
    return `${baseUrl}/quran/${surah}?${params.toString()}#ayah-${currentAyah}`;
  };

  const handleShare = () => {
    const link = getShareLink();
    navigator.clipboard.writeText(link).then(() => {
      alert('Link copied to clipboard!');
    });
  };

  // Play ayah with loop logic
  const playAyah = async (ayah: number) => {
    setCurrentAyah(ayah);
    setIsPlaying(true);
    await saveProgress(ayah);

    if (audioRef.current) {
      audioRef.current.src = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/audio/ayah/${surah}/${ayah}`;
      audioRef.current.playbackRate = playbackSpeed;
      await audioRef.current.play();
    }
  };

  // Handle audio end
  const handleAudioEnd = () => {
    // A-B loop logic
    if (loopEnabled && aMark && bMark) {
      const nextAyah = currentAyah + 1;
      const loopEnd = Math.max(aMark, bMark);
      const loopStart = Math.min(aMark, bMark);

      if (nextAyah > loopEnd) {
        // Loop back to A
        playAyah(loopStart);
      } else {
        // Continue within loop
        playAyah(nextAyah);
      }
    } else {
      // Normal playback: go to next ayah
      const nextAyah = currentAyah + 1;
      if (nextAyah <= totalAyahs) {
        playAyah(nextAyah);
      } else {
        setIsPlaying(false);
      }
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      {/* Audio Element */}
      <audio
        ref={audioRef}
        onEnded={handleAudioEnd}
        onError={() => {
          console.error('Audio playback error');
          setIsPlaying(false);
        }}
      />

      {/* Timeline Component */}
      <TimelineAB
        total={totalAyahs}
        current={currentAyah}
        aMark={aMark}
        bMark={bMark}
        onCurrentChange={(ayah) => playAyah(ayah)}
        onAChange={setAMark}
        onBChange={setBMark}
      />

      {/* Controls */}
      <div className="flex gap-4 mt-6">
        {/* Play/Pause */}
        <button
          onClick={() => (isPlaying ? audioRef.current?.pause() : playAyah(currentAyah))}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {isPlaying ? 'Pause' : 'Play'}
        </button>

        {/* Loop Toggle */}
        <button
          onClick={() => setLoopEnabled(!loopEnabled)}
          className={`px-4 py-3 rounded-lg ${
            loopEnabled
              ? 'bg-purple-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
          disabled={!aMark || !bMark}
        >
          🔁 Loop {loopEnabled ? 'ON' : 'OFF'}
        </button>

        {/* Speed Control */}
        <select
          value={playbackSpeed}
          onChange={(e) => {
            const speed = parseFloat(e.target.value);
            setPlaybackSpeed(speed);
            if (audioRef.current) audioRef.current.playbackRate = speed;
          }}
          className="px-4 py-3 rounded-lg bg-gray-200 dark:bg-gray-700"
        >
          <option value="0.5">0.5x</option>
          <option value="0.75">0.75x</option>
          <option value="1.0">1.0x</option>
          <option value="1.25">1.25x</option>
          <option value="1.5">1.5x</option>
          <option value="2.0">2.0x</option>
        </select>

        {/* Share Button */}
        <button
          onClick={handleShare}
          className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          📤 Share
        </button>
      </div>
    </div>
  );
}
```

---

## 4. Environment Variables

Add to `client/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

## 5. Usage Examples

### Example 1: Basic Deep Link
```
https://yourapp.com/quran/2?ayah=255
```
- Opens Surah 2 (Al-Baqarah)
- Scrolls to Ayah 255
- Does NOT auto-play

### Example 2: Auto-Play Deep Link
```
https://yourapp.com/quran/18?ayah=10&play=1
```
- Opens Surah 18 (Al-Kahf)
- Scrolls to Ayah 10
- Auto-plays from Ayah 10

### Example 3: Full State Deep Link (A-B Loop)
```
https://yourapp.com/quran/55?ayah=1&play=1&a=1&b=78&loop=1&speed=1.25
```
- Opens Surah 55 (Ar-Rahman)
- Sets A marker at Ayah 1
- Sets B marker at Ayah 78
- Enables loop mode
- Sets playback speed to 1.25x
- Auto-plays and loops through entire surah

### Example 4: Continue Reading
User clicks "Continue Reading" card on home page:
```
https://yourapp.com/quran/36?ayah=58&play=1#ayah-58
```
- Opens Surah 36 (Ya-Sin)
- Scrolls to Ayah 58 (last read position)
- Auto-plays

---

## 6. Cross-Device Sync

### Web (JWT)
- **Save**: Every ayah change → `POST /api/v1/quran/user/progress` + `localStorage.setItem('noor_last')`
- **Load**: Home page → `GET /api/v1/quran/user/progress/latest` (fallback to localStorage)

### Mobile (Optional - Bonus Feature)
If you implement the mobile app:
- **Save**: Every ayah change → `POST /api/v1/quran/user/progress` + `AsyncStorage.setItem('noor_last')`
- **Load**: Home screen → `GET /api/v1/quran/user/progress/latest` (fallback to AsyncStorage)

### Conflict Resolution
- **Strategy**: Last-Writer-Wins (LWW)
- **Field**: `updatedAt` timestamp
- **Logic**: Backend always accepts newest `updatedAt`

---

## 7. Testing Checklist

### Timeline UI
- [ ] Drag current position thumb → changes ayah
- [ ] Click track → jumps to position
- [ ] Set A button → sets green marker
- [ ] Set B button → sets purple marker
- [ ] Clear A-B button → removes markers
- [ ] Loop range shows gradient highlight
- [ ] Dark mode styling works

### Continue Reading Card
- [ ] Shows on home page when progress exists
- [ ] Displays correct surah name (Arabic + English)
- [ ] Shows current ayah and percentage
- [ ] Click card → navigates with deep link
- [ ] Auto-plays on navigation
- [ ] Scrolls to correct ayah
- [ ] JWT sync works (test on multiple devices)
- [ ] localStorage fallback works (test logged out)

### Deep Links
- [ ] `?ayah=X` → scrolls to ayah
- [ ] `?ayah=X&play=1` → auto-plays
- [ ] `?a=X&b=Y` → sets A-B markers
- [ ] `?loop=1` → enables loop mode
- [ ] `?speed=X` → sets playback speed
- [ ] All combinations work together
- [ ] Share button copies correct URL
- [ ] URL opens correctly in new tab/device

### Progress Sync
- [ ] Playing ayah saves to backend (JWT)
- [ ] Playing ayah saves to localStorage
- [ ] Home card shows backend progress (logged in)
- [ ] Home card shows localStorage progress (logged out)
- [ ] Cross-device sync works (same user, different browser/device)

---

## 8. Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        HOME PAGE                             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │          ContinueReadingCard                           │ │
│  │  1. GET /api/v1/quran/user/progress/latest (JWT)      │ │
│  │  2. Fallback: localStorage.getItem('noor_last')       │ │
│  │  3. Click → /quran/[surah]?ayah=X&play=1              │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            ↓ (navigation)
┌─────────────────────────────────────────────────────────────┐
│                     QURAN PAGE                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Parse Query Params (useRouter)                        │ │
│  │  - ayah, play, a, b, loop, speed                       │ │
│  │  - Pass to SurahPerAyahPlayer as props                 │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  SurahPerAyahPlayer                                    │ │
│  │  ┌──────────────────────────────────────────────────┐ │ │
│  │  │  TimelineAB Component                            │ │ │
│  │  │  - Current position (blue thumb)                 │ │ │
│  │  │  - A marker (green thumb)                        │ │ │
│  │  │  - B marker (purple thumb)                       │ │ │
│  │  │  - Loop range gradient highlight                 │ │ │
│  │  └──────────────────────────────────────────────────┘ │ │
│  │  ┌──────────────────────────────────────────────────┐ │ │
│  │  │  Controls                                        │ │ │
│  │  │  - Play/Pause                                    │ │ │
│  │  │  - Loop Toggle (🔁)                              │ │ │
│  │  │  - Speed Select (0.5x - 2.0x)                    │ │ │
│  │  │  - Share Button (📤)                             │ │ │
│  │  └──────────────────────────────────────────────────┘ │ │
│  │  ┌──────────────────────────────────────────────────┐ │ │
│  │  │  Playback Logic                                  │ │ │
│  │  │  1. playAyah(ayah) → fetch audio                 │ │ │
│  │  │  2. onEnded → check loop                         │ │ │
│  │  │  3. Save progress: POST + localStorage           │ │ │
│  │  │  4. A-B loop: if enabled, jump to A when > B     │ │ │
│  │  └──────────────────────────────────────────────────┘ │ │
│  │  ┌──────────────────────────────────────────────────┐ │ │
│  │  │  Share Logic                                     │ │ │
│  │  │  1. Build URL: ?ayah=X&play=1&a=Y&b=Z&loop=1    │ │ │
│  │  │  2. Copy to clipboard                            │ │ │
│  │  │  3. Show success message                         │ │ │
│  │  └──────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Ayah Text (with anchor IDs)                          │ │
│  │  <div id="ayah-1">...</div>                            │ │
│  │  <div id="ayah-2">...</div>                            │ │
│  │  ...                                                   │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            ↓ (save progress)
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (Node.js/Express)                 │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  POST /api/v1/quran/user/progress                     │ │
│  │  - Auth: JWT required                                 │ │
│  │  - Body: { surah, ayah }                              │ │
│  │  - Upsert SurahProgress (userId + surah unique)       │ │
│  │  - Returns: { success: true }                         │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  GET /api/v1/quran/user/progress/latest               │ │
│  │  - Auth: JWT required                                 │ │
│  │  - Query: SurahProgress.findOne().sort({ updatedAt: -1 })│
│  │  - Returns: { surah, ayah, updatedAt } or {}          │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            ↓ (persist)
┌─────────────────────────────────────────────────────────────┐
│                    DATABASE (MongoDB)                        │
│  Collection: surahprogresses                                 │
│  {                                                           │
│    userId: ObjectId("..."),                                  │
│    surah: 2,                                                 │
│    ayah: 255,                                                │
│    updatedAt: ISODate("2025-10-08T12:34:56.789Z")           │
│  }                                                           │
│  Index: (userId, surah) - unique compound                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 9. Bonus: Mobile App Integration

If you want to implement the mobile app (Expo/React Native) with cross-device sync:

### Key Components (User Provided)
- `apps/mobile/src/components/TimelineAB.tsx` - Same logic as web, different styling (React Native)
- `apps/mobile/src/screens/HomeScreen.tsx` - Continue card using AsyncStorage + JWT API
- `apps/mobile/src/screens/QuranScreen.tsx` - Player with deep linking (Expo Router)
- `apps/mobile/src/hooks/useAudio.ts` - Expo AV audio hook
- Cross-device sync: Same `/progress` and `/progress/latest` endpoints

### Mobile Deep Links (Expo)
```typescript
// apps/mobile/app.json
{
  "expo": {
    "scheme": "noor",
    "ios": { "associatedDomains": ["applinks:noor.app"] },
    "android": { "intentFilters": [{ "action": "VIEW", "data": [{ "scheme": "https", "host": "noor.app" }] }] }
  }
}
```

**Universal Links**:
- Web: `https://noor.app/quran/2?ayah=255&play=1`
- Mobile: Opens app if installed, otherwise web

---

## 10. Summary

### Server-Side ✅ COMPLETE
- `GET /api/v1/quran/user/progress/latest` - Ready to use
- Authentication via JWT
- MongoDB persistence

### Client-Side 📋 TO IMPLEMENT
1. **TimelineAB.tsx** - 150 lines, copy-paste ready
2. **ContinueReadingCard.tsx** - 100 lines, copy-paste ready
3. **Modify [surah].tsx** - Add 20 lines for deep link parsing
4. **Modify SurahPerAyahPlayer.tsx** - Add 50 lines for timeline integration + share logic

### Estimated Implementation Time
- **Timeline Component**: 10 minutes (copy-paste + test)
- **Continue Card**: 10 minutes (copy-paste + add to home page)
- **Deep Links**: 5 minutes (add query parsing + scroll logic)
- **Player Integration**: 15 minutes (integrate timeline + share button)
- **Testing**: 30 minutes (verify all features)
- **Total**: ~70 minutes

### Next Steps
1. Create `TimelineAB.tsx` component
2. Create `ContinueReadingCard.tsx` component
3. Add deep link parsing to `[surah].tsx`
4. Enhance `SurahPerAyahPlayer.tsx` with timeline + share
5. Test all features together
6. (Optional) Implement mobile app

---

**Status**: Server-side COMPLETE ✅ | Client-side DOCUMENTED 📋 | Ready to implement!
