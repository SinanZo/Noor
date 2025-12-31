import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  BookOpenIcon,
  ClockIcon,
  SparklesIcon,
  HeartIcon,
  MapPinIcon,
  AcademicCapIcon,
  GlobeAltIcon,
  UserGroupIcon,
  CalendarIcon,
  ShoppingBagIcon,
} from '@heroicons/react/24/outline';

const modules = [
  {
    id: 'quran',
    name: 'QuranHub',
    description: 'Read, listen, and explore the Holy Quran with translations',
    icon: BookOpenIcon,
    href: '/quran',
    color: 'from-emerald-500 to-teal-600',
  },
  {
    id: 'prayer',
    name: 'PrayerTime360',
    description: 'Accurate prayer times, Qibla compass, and reminders',
    icon: ClockIcon,
    href: '/prayer',
    color: 'from-blue-500 to-indigo-600',
  },
  {
    id: 'ai',
    name: 'IslamVerse AI',
    description: 'AI-powered Islamic knowledge assistant',
    icon: SparklesIcon,
    href: '/ai',
    color: 'from-purple-500 to-pink-600',
  },
  {
    id: 'donations',
    name: 'SadaqahChain',
    description: 'Transparent charitable giving with 50/50 split',
    icon: HeartIcon,
    href: '/donations',
    color: 'from-rose-500 to-red-600',
  },
  {
    id: 'halal',
    name: 'HalalFinder',
    description: 'Discover halal restaurants and products nearby',
    icon: MapPinIcon,
    href: '/halal',
    color: 'from-green-500 to-emerald-600',
  },
  {
    id: 'hadith',
    name: 'Hadith Navigator',
    description: 'Explore authentic Hadith collections',
    icon: AcademicCapIcon,
    href: '/hadith',
    color: 'from-amber-500 to-orange-600',
  },
  {
    id: 'arabic',
    name: 'LearnArabic',
    description: 'Interactive Arabic and Quran learning',
    icon: GlobeAltIcon,
    href: '/learn',
    color: 'from-cyan-500 to-blue-600',
  },
  {
    id: 'community',
    name: 'UmmahConnect',
    description: 'Connect with Muslims worldwide',
    icon: UserGroupIcon,
    href: '/community',
    color: 'from-violet-500 to-purple-600',
  },
  {
    id: 'planner',
    name: 'MuslimLife Planner',
    description: 'Organize your Islamic lifestyle',
    icon: CalendarIcon,
    href: '/planner',
    color: 'from-lime-500 to-green-600',
  },
  {
    id: 'kids',
    name: 'Islamic Kids World',
    description: 'Fun Islamic education for children',
    icon: ShoppingBagIcon,
    href: '/kids',
    color: 'from-pink-500 to-rose-600',
  },
];

export default function ModulesGrid() {
  const { t } = useTranslation('common');

  return (
    <section className="mb-12">
      <h2 className="text-3xl font-bold mb-8 text-center">
        {t('modules.title', 'Explore All Features')}
      </h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {modules.map((module, index) => (
          <Link key={module.id} href={module.href}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="card group cursor-pointer h-full"
            >
              <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${module.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <module.icon className="w-8 h-8 text-white" />
              </div>
              
              <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                {t(`modules.${module.id}.name`, module.name)}
              </h3>
              
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {t(`modules.${module.id}.description`, module.description)}
              </p>
            </motion.div>
          </Link>
        ))}
      </div>
    </section>
  );
}
