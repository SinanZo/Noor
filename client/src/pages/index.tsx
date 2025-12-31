import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import Head from 'next/head';
import Layout from '@/components/layout/Layout';
import Hero from '@/components/home/Hero';
import ModulesGrid from '@/components/home/ModulesGrid';
import PrayerWidget from '@/components/prayer/PrayerWidget';
import QuranVerse from '@/components/quran/QuranVerse';
import ContinueReadingCard from '@/components/home/ContinueReadingCard';

export default function Home() {
  const { t } = useTranslation('common');

  return (
    <>
      <Head>
        <title>{t('appName')} - {t('tagline')}</title>
        <meta name="description" content={t('metaDescription')} />
        <meta property="og:title" content={`${t('appName')} - ${t('tagline')}`} />
        <meta property="og:description" content={t('metaDescription')} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/images/og-image.jpg" />
      </Head>

      <Layout>
        <Hero />
        
        <section className="py-12 bg-cream-white dark:bg-charcoal-black">
          <div className="container mx-auto px-4">
            {/* Continue Reading Card */}
            <div className="mb-8">
              <ContinueReadingCard />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
              <div className="lg:col-span-2">
                <QuranVerse />
              </div>
              <div>
                <PrayerWidget />
              </div>
            </div>
            
            <ModulesGrid />
          </div>
        </section>
      </Layout>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale!, ['common', 'home'])),
    },
  };
};
