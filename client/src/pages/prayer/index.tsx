import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import Head from 'next/head';
import Layout from '@/components/layout/Layout';
import PrayerTimesDisplay from '@/components/prayer/PrayerTimesDisplay';
import QiblaCompass from '@/components/prayer/QiblaCompass';
import HijriCalendar from '@/components/prayer/HijriCalendar';
import MosqueFinder from '@/components/prayer/MosqueFinder';

export default function PrayerTime360() {
  const { t } = useTranslation('prayer');

  return (
    <>
      <Head>
        <title>{t('prayerTimeTitle')} - {t('common:appName')}</title>
        <meta name="description" content={t('prayerTimeDescription')} />
      </Head>

      <Layout>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-charcoal-black dark:text-cream-white mb-8">
            {t('prayerTimeHeading')}
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <PrayerTimesDisplay />
            <QiblaCompass />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
            <HijriCalendar />
            <MosqueFinder />
          </div>
        </div>
      </Layout>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale!, ['common', 'prayer'])),
    },
  };
};
