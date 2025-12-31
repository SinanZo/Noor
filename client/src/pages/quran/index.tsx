import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import SurahList from '@/components/quran/SurahList';
import QuranReader from '@/components/quran/QuranReader';

export default function QuranHub() {
  const { t } = useTranslation('quran');
  const router = useRouter();
  const [selectedSurah, setSelectedSurah] = useState<number | null>(null);

  // Handle deep link surah parameter
  useEffect(() => {
    const { surah } = router.query;
    if (surah) {
      const surahNum = parseInt(surah as string, 10);
      if (surahNum >= 1 && surahNum <= 114) {
        setSelectedSurah(surahNum);
      }
    }
  }, [router.query]);

  return (
    <>
      <Head>
        <title>{t('quranHubTitle')} - {t('common:appName')}</title>
        <meta name="description" content={t('quranHubDescription')} />
      </Head>

      <Layout>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-charcoal-black dark:text-cream-white mb-8">
            {t('quranHubHeading')}
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <SurahList onSelectSurah={setSelectedSurah} />
            </div>
            
            <div className="lg:col-span-2">
              {selectedSurah ? (
                <QuranReader surahNumber={selectedSurah} />
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center">
                  <p className="text-gray-600 dark:text-gray-300">
                    {t('selectSurahPrompt')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale!, ['common', 'quran'])),
    },
  };
};
