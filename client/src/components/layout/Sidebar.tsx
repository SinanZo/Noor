import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { FiX, FiBook, FiClock, FiMessageCircle, FiCalendar, FiDollarSign, FiUsers, FiMap, FiBookOpen, FiSmile } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation('common');
  const router = useRouter();

  const menuItems = [
    { icon: FiBook, label: t('quran'), href: '/quran' },
    { icon: FiBookOpen, label: t('hadith'), href: '/hadith' },
    { icon: FiClock, label: t('prayer'), href: '/prayer' },
    { icon: FiCalendar, label: t('planner'), href: '/planner' },
    { icon: FiMessageCircle, label: t('ai'), href: '/ai' },
    { icon: FiDollarSign, label: t('sadaqah'), href: '/sadaqah' },
    { icon: FiSmile, label: t('kids'), href: '/kids' },
    { icon: FiMap, label: t('halal'), href: '/halal' },
    { icon: FiUsers, label: t('connect'), href: '/connect' },
  ];

  return (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={{ x: '-100%' }}
        animate={{ x: isOpen ? 0 : '-100%' }}
        transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
        className="fixed left-0 top-0 h-full w-72 bg-white dark:bg-gray-900 shadow-xl z-50 lg:relative lg:translate-x-0"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-emerald-green">{t('appName')}</h2>
            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <FiX size={24} />
            </button>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = router.pathname.startsWith(item.href);

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                        isActive
                          ? 'bg-emerald-green text-white shadow-lg'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      <Icon size={20} />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              {t('tagline')}
            </p>
          </div>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;
