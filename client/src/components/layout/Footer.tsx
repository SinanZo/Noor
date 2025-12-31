import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { FiMail, FiGithub, FiTwitter, FiFacebook, FiInstagram } from 'react-icons/fi';

const Footer: React.FC = () => {
  const { t } = useTranslation('common');
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-charcoal-black text-cream-white py-12 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* About */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-gold">{t('appName')}</h3>
            <p className="text-sm text-gray-300">{t('tagline')}</p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 text-gold">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="hover:text-gold transition-colors">About Us</Link></li>
              <li><Link href="/privacy" className="hover:text-gold transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-gold transition-colors">Terms of Service</Link></li>
              <li><Link href="/contact" className="hover:text-gold transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Modules */}
          <div>
            <h4 className="font-semibold mb-4 text-gold">Modules</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/quran" className="hover:text-gold transition-colors">{t('quran')}</Link></li>
              <li><Link href="/prayer" className="hover:text-gold transition-colors">{t('prayer')}</Link></li>
              <li><Link href="/ai" className="hover:text-gold transition-colors">{t('ai')}</Link></li>
              <li><Link href="/sadaqah" className="hover:text-gold transition-colors">{t('sadaqah')}</Link></li>
            </ul>
          </div>

          {/* Social & Contact */}
          <div>
            <h4 className="font-semibold mb-4 text-gold">Connect With Us</h4>
            <div className="flex space-x-4 mb-4">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors">
                <FiTwitter size={20} />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors">
                <FiFacebook size={20} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors">
                <FiInstagram size={20} />
              </a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors">
                <FiGithub size={20} />
              </a>
            </div>
            <a href="mailto:support@noorapp.net" className="flex items-center space-x-2 text-sm hover:text-gold transition-colors">
              <FiMail size={16} />
              <span>support@noorapp.net</span>
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-700 pt-8 text-center text-sm text-gray-400">
          <p>© {currentYear} {t('appName')}. All rights reserved. Made with ❤️ for the Muslim Ummah</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
