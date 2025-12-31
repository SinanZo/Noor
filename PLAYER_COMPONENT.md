# Enhanced Per-Ayah Player Component

## Full Implementation

**File:** `client/src/components/quran/SurahPerAyahPlayer.tsx`

```typescript
import { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';
import { startCachingBatch } from '../DownloadManagerOverlay';

interface Ayah {
  surah: number;
  ayah: number;
  text_arabic: string;
  text_english?: string;
}

interface Bookmark {
  _id?: string;
  surah: number;
  ayah: number;
  note?: string;
}

const LS_PROGRESS = (s: number) => `noor_progress_${s}`;
const LS_BOOKMARKS = (s: number) => `noor_bookmarks_${s}`;

interface Props {
  surah: number;
  ayat: Ayah[];
}

export default function SurahPerAyahPlayer({ surah, ayat }: Props) {
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
  const { token } = useAuth();

  // Playback state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);

  // A-B repeat
  const [aMark, setAMark] = useState<number | null>(null);
  const [bMark, setBMark] = useState<number | null>(null);
  const [abLoop, setAbLoop] = useState(false);

  // Bookmarks
  const [note, setNote] = useState('');
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lineRefs = useRef<Record<number, HTMLDivElement | null>>({});

  // Audio URLs
  const ayahUrls = useMemo(
    () => ayat.map(a => `${apiBase}/audio/ayah/${surah}/${a.ayah}`),
    [apiBase, surah, ayat]
  );

  // Helper functions
  const bounded = (idx: number) => Math.max(0, Math.min(idx, ayahUrls.length - 1));
  
  const playIdx = (idx: number) => {
    const n = bounded(idx);
    setCurrentIndex(n);
    setTimeout(async () => {
      if (audioRef.current) {
        audioRef.current.playbackRate = playbackRate;
        try {
          await audioRef.current.play();
          setPlaying(true);
        } catch (e) {
          console.error('Play error:', e);
        }
      }
    }, 50);
  };

  const pause = () => {
    audioRef.current?.pause();
    setPlaying(false);
  };

  const togglePlay = () => {
    if (playing) {
      pause();
    } else {
      playIdx(currentIndex);
    }
  };

  // Resume progress on mount
  useEffect(() => {
    (async () => {
      let startAyah = 1;
      
      if (token) {
        try {
          const response = await api.get(`/quran/user/progress/${surah}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (response.data?.ayah) {
            startAyah = response.data.ayah;
          }
        } catch (e) {
          console.error('Load progress error:', e);
        }
      } else {
        const stored = localStorage.getItem(LS_PROGRESS(surah));
        if (stored) {
          startAyah = Number(stored) || 1;
        }
      }
      
      setCurrentIndex(bounded(startAyah - 1));
    })();
  }, [surah, token]);

  // Save progress on change
  useEffect(() => {
    (async () => {
      const ayah = ayat[currentIndex]?.ayah;
      if (!ayah) return;

      if (token) {
        try {
          await api.post(
            '/quran/user/progress',
            { surah, ayah },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        } catch (e) {
          console.error('Save progress error:', e);
        }
      } else {
        localStorage.setItem(LS_PROGRESS(surah), String(ayah));
      }
    })();
  }, [currentIndex, surah, token, ayat]);

  // Auto-scroll to current ayah
  useEffect(() => {
    const el = lineRefs.current[ayat[currentIndex]?.ayah];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentIndex, ayat]);

  // Handle track end
  const onEnded = () => {
    if (abLoop && aMark !== null && bMark !== null) {
      if (currentIndex >= bMark) {
        playIdx(aMark);
      } else {
        playIdx(currentIndex + 1);
      }
    } else {
      if (currentIndex < ayahUrls.length - 1) {
        playIdx(currentIndex + 1);
      } else {
        setPlaying(false);
      }
    }
  };

  // Update playback rate
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  // Keyboard controls
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        playIdx(currentIndex + 1);
      }
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        playIdx(currentIndex - 1);
      }
      if (e.key === ' ') {
        e.preventDefault();
        togglePlay();
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [currentIndex, playing]);

  // Load bookmarks
  const loadBookmarks = async () => {
    if (token) {
      try {
        const response = await api.get('/quran/user/bookmarks', {
          params: { surah },
          headers: { Authorization: `Bearer ${token}` }
        });
        setBookmarks(response.data || []);
      } catch (e) {
        console.error('Load bookmarks error:', e);
      }
    } else {
      const raw = localStorage.getItem(LS_BOOKMARKS(surah));
      setBookmarks(raw ? JSON.parse(raw) : []);
    }
  };

  useEffect(() => {
    loadBookmarks();
  }, [surah, token]);

  const saveBookmarksLocal = (list: Bookmark[]) => {
    localStorage.setItem(LS_BOOKMARKS(surah), JSON.stringify(list));
  };

  const addBookmark = async () => {
    const ayah = ayat[currentIndex]?.ayah;
    if (!ayah) return;

    if (token) {
      try {
        const response = await api.post(
          '/quran/user/bookmarks',
          { surah, ayah, note },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        setBookmarks(prev => {
          const filtered = prev.filter(b => !(b.surah === surah && b.ayah === ayah));
          return [...filtered, response.data].sort((a, b) => a.ayah - b.ayah);
        });
      } catch (e) {
        console.error('Add bookmark error:', e);
      }
    } else {
      const entry: Bookmark = { surah, ayah, note };
      const next = [...bookmarks.filter(b => !(b.surah === surah && b.ayah === ayah)), entry]
        .sort((a, b) => a.ayah - b.ayah);
      setBookmarks(next);
      saveBookmarksLocal(next);
    }
    
    setNote('');
  };

  const deleteBookmark = async (b: Bookmark) => {
    if (token && b._id) {
      try {
        await api.delete(`/quran/user/bookmarks/${b._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setBookmarks(prev => prev.filter(x => x._id !== b._id));
      } catch (e) {
        console.error('Delete bookmark error:', e);
      }
    } else {
      const next = bookmarks.filter(x => !(x.surah === b.surah && x.ayah === b.ayah));
      setBookmarks(next);
      saveBookmarksLocal(next);
    }
  };

  // Download for offline
  const downloadSurah = () => {
    const urls = [
      `${apiBase}/quran/surah/${surah}`,
      `${apiBase}/quran/meta/${surah}`,
      `${apiBase}/quran/tafsir/${surah}`,
      ...ayahUrls
    ];
    startCachingBatch(urls, `surah-${surah}`);
  };

  return (
    <div className="space-y-5">
      {/* Main Controls */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <button
            onClick={() => playIdx(currentIndex - 1)}
            className="rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Previous (←)"
          >
            ◀︎
          </button>
          
          <button
            onClick={togglePlay}
            className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 flex items-center gap-2 font-medium"
          >
            {playing ? '❚❚ Pause' : '▶︎ Play'}
          </button>
          
          <button
            onClick={() => playIdx(currentIndex + 1)}
            className="rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Next (→)"
          >
            ▶︎
          </button>

          <div className="text-sm opacity-75 ml-2">
            Ayah {ayat[currentIndex]?.ayah} / {ayat.length}
          </div>

          {/* Speed Control */}
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs opacity-70">Speed:</span>
            <select
              value={playbackRate}
              onChange={(e) => setPlaybackRate(Number(e.target.value))}
              className="rounded-lg border border-gray-300 dark:border-gray-600 px-2 py-1 text-sm bg-white dark:bg-gray-800"
            >
              {[0.5, 0.75, 1, 1.25, 1.5, 2].map(v => (
                <option key={v} value={v}>{v}×</option>
              ))}
            </select>
          </div>

          {/* Download Button */}
          <button
            onClick={downloadSurah}
            className="rounded-xl border border-gray-300 dark:border-gray-600 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Save for offline"
          >
            ⬇ Save Offline
          </button>
        </div>

        {/* A-B Repeat Controls */}
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
          <span className="text-xs opacity-70 mr-2">Repeat A-B:</span>
          
          <button
            onClick={() => setAMark(currentIndex)}
            className={`rounded-lg border px-3 py-1 text-sm ${
              aMark === currentIndex 
                ? 'bg-emerald-100 dark:bg-emerald-900 border-emerald-600' 
                : 'border-gray-300 dark:border-gray-600'
            }`}
          >
            A: {aMark !== null ? ayat[aMark]?.ayah : '—'}
          </button>
          
          <button
            onClick={() => setBMark(Math.max(currentIndex, aMark ?? currentIndex))}
            className={`rounded-lg border px-3 py-1 text-sm ${
              bMark === currentIndex 
                ? 'bg-emerald-100 dark:bg-emerald-900 border-emerald-600' 
                : 'border-gray-300 dark:border-gray-600'
            }`}
          >
            B: {bMark !== null ? ayat[bMark]?.ayah : '—'}
          </button>
          
          <button
            onClick={() => setAbLoop(v => !v)}
            className={`rounded-lg px-3 py-1 border text-sm ${
              abLoop 
                ? 'bg-emerald-600 text-white border-emerald-600' 
                : 'border-gray-300 dark:border-gray-600'
            }`}
          >
            🔁 {abLoop ? 'Looping' : 'Loop'}
          </button>
          
          <button
            onClick={() => {
              setAMark(null);
              setBMark(null);
              setAbLoop(false);
            }}
            className="rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-1 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Clear
          </button>
        </div>
      </div>

      <audio
        ref={audioRef}
        src={ayahUrls[currentIndex]}
        onEnded={onEnded}
        preload="none"
        className="hidden"
      />

      {/* Bookmarks Section */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
        <div className="font-semibold mb-3 flex items-center gap-2">
          🔖 Bookmarks
        </div>
        
        {/* Add Bookmark */}
        <div className="flex gap-2 mb-3">
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Note (optional)"
            className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-gray-800"
          />
          <button
            onClick={addBookmark}
            className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-sm"
          >
            + Add Current
          </button>
        </div>

        {/* Bookmarks List */}
        {bookmarks.length ? (
          <ul className="space-y-2">
            {bookmarks.map((b) => (
              <li
                key={(b._id ?? '') + ':' + b.ayah}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <button
                  onClick={() => playIdx(b.ayah - 1)}
                  className="text-sm hover:underline text-left flex-1"
                >
                  <span className="font-medium">Ayah {b.ayah}</span>
                  {b.note && <span className="opacity-70">: {b.note}</span>}
                </button>
                <button
                  onClick={() => deleteBookmark(b)}
                  className="text-red-600 hover:text-red-800 p-1"
                  title="Delete"
                >
                  🗑️
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm opacity-70">No bookmarks yet.</p>
        )}
      </div>

      {/* Ayat List with Highlighting */}
      <div className="space-y-4">
        {ayat.map((a, idx) => (
          <div
            key={a.ayah}
            ref={el => (lineRefs.current[a.ayah] = el)}
            onClick={() => playIdx(idx)}
            className={`rounded-xl border p-4 cursor-pointer transition ${
              idx === currentIndex
                ? 'ring-2 ring-emerald-600 bg-emerald-50/50 dark:bg-emerald-900/20 border-emerald-600'
                : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            <div className="text-right text-xl leading-loose font-semibold">
              {a.text_arabic}
            </div>
            {a.text_english && (
              <div className="mt-2 opacity-80 text-sm">
                {a.text_english}
              </div>
            )}
            <div className="mt-2 text-xs opacity-60 flex items-center justify-between">
              <span>Ayah {a.ayah}</span>
              {idx === currentIndex && playing && (
                <span className="text-emerald-600 flex items-center gap-1">
                  <span className="animate-pulse">●</span> Playing
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Usage Example

In `client/src/pages/quran/index.tsx`:

```typescript
import SurahPerAyahPlayer from '@/components/quran/SurahPerAyahPlayer';

// Inside your component, replace QuranReader with:
<SurahPerAyahPlayer 
  surah={selectedSurah} 
  ayat={ayatData} // Array of ayahs from API
/>
```

## Features Included

✅ **Play/Pause Controls** with keyboard shortcuts (Space, Arrows)
✅ **Playback Speed** (0.5× to 2×)
✅ **A-B Repeat** with loop toggle
✅ **Auto-scroll** to current ayah
✅ **Progress Tracking** (JWT or localStorage)
✅ **Bookmarks** with notes (JWT or localStorage)
✅ **Offline Download** integration
✅ **Visual highlighting** of current ayah
✅ **Responsive design** with dark mode support

## Keyboard Shortcuts

- **Space**: Play/Pause
- **Arrow Right/Down**: Next ayah
- **Arrow Left/Up**: Previous ayah

