import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { FiMenu, FiMoon, FiSun, FiUser, FiLogOut } from 'react-icons/fi';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { t } = useTranslation('common');
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const router = useRouter();

  return (
    <header className="bg-emerald-green text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Menu */}
          <div className="flex items-center space-x-4">
            <button
              onClick={onMenuClick}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Toggle menu"
            >
              <FiMenu size={24} />
            </button>
            
            <Link href="/" className="text-2xl font-bold flex items-center space-x-2">
              <span>🕌</span>
              <span>{t('appName')}</span>
            </Link>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* Language Selector */}
            <select
              value={router.locale}
              onChange={(e) => router.push(router.pathname, router.asPath, { locale: e.target.value })}
              className="bg-white/10 px-3 py-1 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-white"
            >
              <option value="en">English</option>
              <option value="ar">العربية</option>
              <option value="ur">اردو</option>
              <option value="fr">Français</option>
            </select>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <FiMoon size={20} /> : <FiSun size={20} />}
            </button>

            {/* User Menu */}
            {user ? (
              <div className="flex items-center space-x-2">
                <Link href="/profile" className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                  <FiUser size={20} />
                </Link>
                <button
                  onClick={logout}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  aria-label="Logout"
                >
                  <FiLogOut size={20} />
                </button>
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="bg-gold text-charcoal-black px-4 py-2 rounded-lg font-semibold hover:bg-gold/90 transition-colors"
              >
                {t('login')}
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
