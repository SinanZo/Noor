import { useTranslation } from 'next-i18next';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpenIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface Surah {
  number: number;
  name: string;
  englishName: string;
  ayahs: number;
  revelationType: 'Meccan' | 'Medinan';
}

const SURAHS: Surah[] = [
  { number: 1, name: 'الفاتحة', englishName: 'Al-Fatihah', ayahs: 7, revelationType: 'Meccan' },
  { number: 2, name: 'البقرة', englishName: 'Al-Baqarah', ayahs: 286, revelationType: 'Medinan' },
  { number: 3, name: 'آل عمران', englishName: 'Aal-E-Imran', ayahs: 200, revelationType: 'Medinan' },
  { number: 4, name: 'النساء', englishName: 'An-Nisa', ayahs: 176, revelationType: 'Medinan' },
  { number: 5, name: 'المائدة', englishName: 'Al-Maidah', ayahs: 120, revelationType: 'Medinan' },
  { number: 6, name: 'الأنعام', englishName: 'Al-Anam', ayahs: 165, revelationType: 'Meccan' },
  { number: 7, name: 'الأعراف', englishName: 'Al-Araf', ayahs: 206, revelationType: 'Meccan' },
  { number: 8, name: 'الأنفال', englishName: 'Al-Anfal', ayahs: 75, revelationType: 'Medinan' },
  { number: 9, name: 'التوبة', englishName: 'At-Tawbah', ayahs: 129, revelationType: 'Medinan' },
  { number: 10, name: 'يونس', englishName: 'Yunus', ayahs: 109, revelationType: 'Meccan' },
  // Add more surahs as needed - this is a sample list
];

interface SurahListProps {
  onSelectSurah: (surahNumber: number) => void;
  selectedSurah?: number;
}

export default function SurahList({ onSelectSurah, selectedSurah }: SurahListProps) {
  const { t, i18n } = useTranslation('quran');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSurahs = SURAHS.filter(surah => 
    surah.name.includes(searchTerm) || 
    surah.englishName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    surah.number.toString().includes(searchTerm)
  );

  const isRTL = i18n.language === 'ar';

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder={t('searchSurahs', 'Search surahs...')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      {/* Surah List */}
      <div className="space-y-2 max-h-[600px] overflow-y-auto">
        {filteredSurahs.map((surah, index) => (
          <motion.button
            key={surah.number}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onSelectSurah(surah.number)}
            className={`w-full p-4 rounded-xl border transition-all text-left ${
              selectedSurah === surah.number
                ? 'bg-primary text-white border-primary shadow-lg'
                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-primary hover:shadow-md'
            }`}
          >
            <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
              {/* Surah Number Badge */}
              <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center font-bold ${
                selectedSurah === surah.number
                  ? 'bg-white/20 text-white'
                  : 'bg-primary/10 text-primary'
              }`}>
                {surah.number}
              </div>

              {/* Surah Info */}
              <div className={`flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-lg font-semibold" dir="rtl">
                    {surah.name}
                  </h3>
                  <span className={`text-sm ${
                    selectedSurah === surah.number ? 'text-white/80' : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    {surah.englishName}
                  </span>
                </div>
                <div className={`flex items-center gap-3 text-sm mt-1 ${
                  selectedSurah === surah.number ? 'text-white/70' : 'text-gray-500 dark:text-gray-400'
                }`}>
                  <span>{surah.ayahs} {t('ayahs', 'ayahs')}</span>
                  <span>•</span>
                  <span>{t(surah.revelationType.toLowerCase(), surah.revelationType)}</span>
                </div>
              </div>

              {/* Icon */}
              <BookOpenIcon className={`w-5 h-5 flex-shrink-0 ${
                selectedSurah === surah.number ? 'text-white' : 'text-gray-400'
              }`} />
            </div>
          </motion.button>
        ))}
      </div>

      {filteredSurahs.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <BookOpenIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>{t('noResults', 'No surahs found')}</p>
        </div>
      )}
    </div>
  );
}
