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
