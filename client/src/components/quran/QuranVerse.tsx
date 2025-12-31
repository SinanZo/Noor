import { useEffect, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { motion } from 'framer-motion';
import { BookOpenIcon } from '@heroicons/react/24/outline';

interface Verse {
  surah: number;
  ayah: number;
  text: string;
  translation: string;
}

export default function QuranVerse() {
  const { t, i18n } = useTranslation('quran');
  const [verse, setVerse] = useState<Verse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock verse - in production, this would fetch from the API
    const mockVerse: Verse = {
      surah: 2,
      ayah: 255,
      text: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ...',
      translation: 'Allah - there is no deity except Him, the Ever-Living, the Sustainer of existence. Neither drowsiness overtakes Him nor sleep...',
    };

    setVerse(mockVerse);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="card animate-pulse">
        <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/3 mb-4" />
        <div className="h-20 bg-gray-300 dark:bg-gray-700 rounded mb-4" />
        <div className="h-16 bg-gray-300 dark:bg-gray-700 rounded" />
      </div>
    );
  }

  if (!verse) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="card bg-gradient-to-br from-primary/5 to-secondary/5 border-l-4 border-primary"
    >
      <div className="flex items-center gap-2 mb-4">
        <BookOpenIcon className="w-6 h-6 text-primary" />
        <h3 className="text-xl font-bold">
          {t('verseOfDay.title', 'Verse of the Day')}
        </h3>
      </div>

      <div className="mb-4 p-4 bg-white dark:bg-gray-800 rounded-lg">
        <p className="text-2xl text-right font-arabic leading-loose mb-2" dir="rtl">
          {verse.text}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-right" dir="rtl">
          {t('surah', 'Surah')} {verse.surah}, {t('ayah', 'Ayah')} {verse.ayah}
        </p>
      </div>

      <div className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          {verse.translation}
        </p>
      </div>

      <button className="btn-primary mt-4 w-full sm:w-auto">
        {t('readMore', 'Read Full Surah')}
      </button>
    </motion.div>
  );
}
