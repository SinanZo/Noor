import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import axios from 'axios';
import { 
  BookmarkIcon, 
  SpeakerWaveIcon, 
  ArrowLeftIcon, 
  ArrowRightIcon,
  ShareIcon,
  PlayIcon,
  PauseIcon
} from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';
import TimelineAB from './TimelineAB';

interface Ayah {
  number: number;
  text: string;
  translation?: string;
}

interface QuranReaderProps {
  surahNumber: number;
  onClose?: () => void;
}

export default function QuranReader({ surahNumber, onClose }: QuranReaderProps) {
  const { t, i18n } = useTranslation('quran');
  const router = useRouter();
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookmarkedAyahs, setBookmarkedAyahs] = useState<Set<number>>(new Set());
  const [fontSize, setFontSize] = useState(24);
  
  // Audio player state
  const [currentAyah, setCurrentAyah] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [aMark, setAMark] = useState<number | null>(null);
  const [bMark, setBMark] = useState<number | null>(null);
  const [loopEnabled, setLoopEnabled] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  const isRTL = i18n.language === 'ar';

  // Parse deep link query params
  useEffect(() => {
    const { ayah, play, a, b, loop, speed } = router.query;
    
    if (ayah) {
      const ayahNum = parseInt(ayah as string, 10);
      setCurrentAyah(ayahNum);
      
      // Auto-play if requested
      if (play === '1') {
        setTimeout(() => playAyah(ayahNum), 1000);
      }
      
      // Scroll to ayah
      setTimeout(() => {
        const element = document.getElementById(`ayah-${ayahNum}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 500);
    }
    
    if (a) setAMark(parseInt(a as string, 10));
    if (b) setBMark(parseInt(b as string, 10));
    if (loop === '1') setLoopEnabled(true);
    if (speed) setPlaybackSpeed(parseFloat(speed as string));
  }, [router.query]);

  useEffect(() => {
    loadSurah();
    loadBookmarks();
  }, [surahNumber]);

  const loadSurah = async () => {
    try {
      setLoading(true);
      // Try to fetch from your API first
      const response = await axios.get(`${API_BASE}/quran/surah/${surahNumber}`);
      setAyahs(response.data.ayat || []);
    } catch (error) {
      console.error('Error loading surah:', error);
      // Fallback to mock data for Al-Fatihah
      if (surahNumber === 1) {
        setAyahs([
          { number: 1, text: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', translation: 'In the name of Allah, the Entirely Merciful, the Especially Merciful.' },
          { number: 2, text: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ', translation: 'All praise is due to Allah, Lord of the worlds.' },
          { number: 3, text: 'الرَّحْمَٰنِ الرَّحِيمِ', translation: 'The Entirely Merciful, the Especially Merciful,' },
          { number: 4, text: 'مَالِكِ يَوْمِ الدِّينِ', translation: 'Sovereign of the Day of Recompense.' },
          { number: 5, text: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ', translation: 'It is You we worship and You we ask for help.' },
          { number: 6, text: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ', translation: 'Guide us to the straight path,' },
          { number: 7, text: 'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ', translation: 'The path of those upon whom You have bestowed favor, not of those who have earned anger or of those who are astray.' }
        ]);
      } else {
        setAyahs([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadBookmarks = () => {
    const saved = localStorage.getItem('quran-bookmarks');
    if (saved) {
      setBookmarkedAyahs(new Set(JSON.parse(saved)));
    }
  };

  const toggleBookmark = (ayahNumber: number) => {
    const key = `${surahNumber}:${ayahNumber}`;
    const bookmarkId = parseInt(key.replace(':', ''));
    
    setBookmarkedAyahs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(bookmarkId)) {
        newSet.delete(bookmarkId);
      } else {
        newSet.add(bookmarkId);
      }
      localStorage.setItem('quran-bookmarks', JSON.stringify(Array.from(newSet)));
      return newSet;
    });
  };

  const isBookmarked = (ayahNumber: number) => {
    const key = `${surahNumber}:${ayahNumber}`;
    const bookmarkId = parseInt(key.replace(':', ''));
    return bookmarkedAyahs.has(bookmarkId);
  };

  // Audio player functions
  const saveProgress = async (ayah: number) => {
    // 1. Save to backend (JWT)
    const token = localStorage.getItem('token');
    if (token) {
      try {
        await axios.post(
          `${API_BASE}/v1/quran/user/progress`,
          { surah: surahNumber, ayah },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (error) {
        console.error('Failed to save progress to backend:', error);
      }
    }

    // 2. Save to localStorage (fallback)
    localStorage.setItem('noor_last', JSON.stringify({
      surah: surahNumber,
      ayah,
      updatedAt: new Date().toISOString(),
    }));
  };

  const playAyah = async (ayah: number) => {
    setCurrentAyah(ayah);
    setIsPlaying(true);
    await saveProgress(ayah);

    // Scroll to ayah
    setTimeout(() => {
      const element = document.getElementById(`ayah-${ayah}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);

    if (audioRef.current) {
      audioRef.current.src = `${API_BASE}/v1/audio/ayah/${surahNumber}/${ayah}`;
      audioRef.current.playbackRate = playbackSpeed;
      await audioRef.current.play();
    }
  };

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
      if (nextAyah <= ayahs.length) {
        playAyah(nextAyah);
      } else {
        setIsPlaying(false);
      }
    }
  };

  const handleShare = () => {
    const params = new URLSearchParams();
    params.set('ayah', currentAyah.toString());
    if (isPlaying) params.set('play', '1');
    if (aMark) params.set('a', aMark.toString());
    if (bMark) params.set('b', bMark.toString());
    if (loopEnabled) params.set('loop', '1');
    if (playbackSpeed !== 1.0) params.set('speed', playbackSpeed.toString());

    const baseUrl = window.location.origin;
    const link = `${baseUrl}/quran?surah=${surahNumber}&${params.toString()}#ayah-${currentAyah}`;
    
    navigator.clipboard.writeText(link).then(() => {
      alert(t('linkCopied', 'Link copied to clipboard!'));
    });
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      playAyah(currentAyah);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (ayahs.length === 0) {
    return (
      <div className="text-center py-20">
        <BookmarkIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-600 dark:text-gray-400">
          {t('noAyahs', 'No ayahs available for this surah. Please connect to MongoDB and seed the data.')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Reader Controls */}
      <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 sticky top-0 z-10 shadow-md">
        <div className="flex items-center gap-4">
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
            >
              {isRTL ? <ArrowRightIcon className="w-5 h-5" /> : <ArrowLeftIcon className="w-5 h-5" />}
            </button>
          )}
          <div>
            <h2 className="font-bold text-lg">{t('surah', 'Surah')} {surahNumber}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {ayahs.length} {t('ayahs', 'Ayahs')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Font Size Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFontSize(Math.max(16, fontSize - 2))}
              className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
            >
              A-
            </button>
            <span className="text-sm">{fontSize}px</span>
            <button
              onClick={() => setFontSize(Math.min(32, fontSize + 2))}
              className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
            >
              A+
            </button>
          </div>
        </div>
      </div>

      {/* Audio Player with Timeline */}
      {ayahs.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-lg">
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
            total={ayahs.length}
            current={currentAyah}
            aMark={aMark}
            bMark={bMark}
            onCurrentChange={(ayah) => playAyah(ayah)}
            onAChange={setAMark}
            onBChange={setBMark}
          />

          {/* Player Controls */}
          <div className="flex flex-wrap gap-3 mt-6">
            {/* Play/Pause */}
            <button
              onClick={togglePlayPause}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
            >
              {isPlaying ? (
                <>
                  <PauseIcon className="w-5 h-5" />
                  {t('pause', 'Pause')}
                </>
              ) : (
                <>
                  <PlayIcon className="w-5 h-5" />
                  {t('play', 'Play')}
                </>
              )}
            </button>

            {/* Loop Toggle */}
            <button
              onClick={() => setLoopEnabled(!loopEnabled)}
              className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                loopEnabled
                  ? 'bg-purple-600 hover:bg-purple-700 text-white'
                  : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
              }`}
              disabled={!aMark || !bMark}
              title={!aMark || !bMark ? t('setABFirst', 'Set A and B markers first') : ''}
            >
              🔁 {t('loop', 'Loop')} {loopEnabled ? 'ON' : 'OFF'}
            </button>

            {/* Speed Control */}
            <select
              value={playbackSpeed}
              onChange={(e) => {
                const speed = parseFloat(e.target.value);
                setPlaybackSpeed(speed);
                if (audioRef.current) audioRef.current.playbackRate = speed;
              }}
              className="px-4 py-3 rounded-lg bg-gray-200 dark:bg-gray-700 border-none font-medium cursor-pointer"
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
              className="flex items-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
            >
              <ShareIcon className="w-5 h-5" />
              {t('share', 'Share')}
            </button>
          </div>
        </div>
      )}

      {/* Bismillah */}
      {surahNumber !== 1 && surahNumber !== 9 && (
        <div className="text-center py-8">
          <p className="text-3xl font-arabic" dir="rtl" style={{ fontSize: fontSize + 8 }}>
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </p>
        </div>
      )}

      {/* Ayahs */}
      <div className="space-y-6">
        {ayahs.map((ayah, index) => (
          <motion.div
            key={ayah.number}
            id={`ayah-${ayah.number}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`bg-white dark:bg-gray-800 rounded-2xl border p-6 hover:shadow-lg transition ${
              currentAyah === ayah.number 
                ? 'border-blue-500 dark:border-blue-400 ring-2 ring-blue-200 dark:ring-blue-800' 
                : 'border-gray-200 dark:border-gray-700'
            }`}
          >
            {/* Arabic Text */}
            <div className="mb-4">
              <p 
                className="text-right leading-loose font-arabic font-semibold"
                dir="rtl"
                style={{ fontSize }}
              >
                {ayah.text}
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white text-sm mr-2">
                  {ayah.number}
                </span>
              </p>
            </div>

            {/* Translation */}
            {ayah.translation && (
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {ayah.translation}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleBookmark(ayah.number)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                  title={t('bookmark', 'Bookmark')}
                >
                  {isBookmarked(ayah.number) ? (
                    <BookmarkSolidIcon className="w-5 h-5 text-primary" />
                  ) : (
                    <BookmarkIcon className="w-5 h-5" />
                  )}
                </button>
                <button
                  onClick={() => playAyah(ayah.number)}
                  className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition ${
                    currentAyah === ayah.number && isPlaying ? 'text-blue-600' : ''
                  }`}
                  title={t('play', 'Play audio')}
                >
                  <SpeakerWaveIcon className="w-5 h-5" />
                </button>
              </div>

              <span className="text-sm text-gray-500 dark:text-gray-400">
                {surahNumber}:{ayah.number}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
