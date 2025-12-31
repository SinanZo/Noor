import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import Head from 'next/head';
import Layout from '@/components/layout/Layout';
import AIChat from '@/components/ai/AIChat';

export default function IslamVerse() {
  const { t } = useTranslation('ai');

  return (
    <>
      <Head>
        <title>{t('aiAssistantTitle')} - {t('common:appName')}</title>
        <meta name="description" content={t('aiAssistantDescription')} />
      </Head>

      <Layout>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-charcoal-black dark:text-cream-white mb-4">
            {t('aiAssistantHeading')}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            {t('aiAssistantSubheading')}
          </p>

          <AIChat />
        </div>
      </Layout>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale!, ['common', 'ai'])),
    },
  };
};
