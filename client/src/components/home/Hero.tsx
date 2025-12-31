import { useTranslation } from 'next-i18next';
import { motion } from 'framer-motion';

export default function Hero() {
  const { t } = useTranslation('common');

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative bg-gradient-to-br from-primary to-primary-dark text-white py-20 px-6 rounded-3xl mb-12 overflow-hidden"
    >
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gold opacity-10 rounded-full -mr-32 -mt-32" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary opacity-10 rounded-full -ml-24 -mb-24" />

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-5xl md:text-6xl font-bold mb-6"
        >
          {t('hero.title', 'السلام عليكم')}
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-xl md:text-2xl mb-8 text-gray-100"
        >
          {t('hero.subtitle', 'Your Companion in Faith, Knowledge & Life')}
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="text-lg mb-10 text-gray-200 max-w-2xl mx-auto"
        >
          {t('hero.description', 'Noor SuperApp brings together Quran, Prayer Times, Islamic Learning, and AI-powered guidance in one beautiful platform.')}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <button className="btn-primary bg-gold text-charcoal-black hover:bg-secondary-dark px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all">
            {t('hero.exploreButton', 'Explore Features')}
          </button>
          <button className="bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 px-8 py-4 rounded-xl font-semibold text-lg border-2 border-white/30 transition-all">
            {t('hero.downloadButton', 'Download App')}
          </button>
        </motion.div>
      </div>
    </motion.section>
  );
}
