import { useEffect, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { motion } from 'framer-motion';
import { ClockIcon, MapPinIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

interface PrayerTime {
  name: string;
  time: string;
  isNext: boolean;
}

export default function PrayerWidget() {
  const { t } = useTranslation('prayer');
  const [prayerTimes, setPrayerTimes] = useState<PrayerTime[]>([]);
  const [location, setLocation] = useState('Loading...');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    loadPrayerTimes();
  }, []);

  const loadPrayerTimes = async () => {
    try {
      // Get user's location
      if (!navigator.geolocation) {
        setError('Geolocation is not supported by your browser');
        setLoading(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setLocation(`${latitude.toFixed(2)}, ${longitude.toFixed(2)}`);

          try {
            const response = await axios.get(`${API_BASE}/prayer/times`, {
              params: {
                lat: latitude,
                lng: longitude,
                method: 'MuslimWorldLeague'
              }
            });

            const times = response.data.data?.formatted || response.data.data?.times;
            const currentTime = new Date();
            
            // Convert prayer times to our format
            const prayers: PrayerTime[] = [
              { name: 'Fajr', time: times.fajr || '05:30 AM', isNext: false },
              { name: 'Sunrise', time: times.sunrise || '06:45 AM', isNext: false },
              { name: 'Dhuhr', time: times.dhuhr || '12:30 PM', isNext: false },
              { name: 'Asr', time: times.asr || '03:45 PM', isNext: false },
              { name: 'Maghrib', time: times.maghrib || '06:15 PM', isNext: false },
              { name: 'Isha', time: times.isha || '07:30 PM', isNext: false },
            ];

            // Find next prayer
            for (let i = 0; i < prayers.length; i++) {
              const prayerTime = new Date(response.data.data.times[prayers[i].name.toLowerCase()]);
              if (prayerTime > currentTime) {
                prayers[i].isNext = true;
                break;
              }
            }

            setPrayerTimes(prayers);
            setLoading(false);
          } catch (apiError) {
            console.error('API Error:', apiError);
            // Fallback to mock data
            loadMockData();
          }
        },
        (geoError) => {
          console.error('Geolocation error:', geoError);
          setError('Unable to get your location');
          loadMockData();
        }
      );
    } catch (err) {
      console.error('Error loading prayer times:', err);
      setError('Failed to load prayer times');
      loadMockData();
    }
  };

  const loadMockData = () => {
    const mockTimes: PrayerTime[] = [
      { name: 'Fajr', time: '05:30 AM', isNext: false },
      { name: 'Sunrise', time: '06:45 AM', isNext: false },
      { name: 'Dhuhr', time: '12:30 PM', isNext: true },
      { name: 'Asr', time: '03:45 PM', isNext: false },
      { name: 'Maghrib', time: '06:15 PM', isNext: false },
      { name: 'Isha', time: '07:30 PM', isNext: false },
    ];

    setPrayerTimes(mockTimes);
    setLocation('Mock Data (Enable location for accurate times)');
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="card animate-pulse">
        <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-4" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-4 bg-gray-300 dark:bg-gray-700 rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="card"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold flex items-center gap-2">
          <ClockIcon className="w-6 h-6 text-primary" />
          {t('widget.title', 'Prayer Times')}
        </h3>
        <MapPinIcon className="w-5 h-5 text-gray-500" />
      </div>

      {error && (
        <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">{error}</p>
        </div>
      )}

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 flex items-center gap-2">
        <span>{location}</span>
      </p>

      <div className="space-y-3">
        {prayerTimes.map((prayer, index) => (
          <motion.div
            key={prayer.name}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`flex justify-between items-center p-3 rounded-lg transition-colors ${
              prayer.isNext
                ? 'bg-primary text-white'
                : 'bg-gray-50 dark:bg-gray-800/50'
            }`}
          >
            <span className="font-medium">{t(`prayers.${prayer.name.toLowerCase()}`, prayer.name)}</span>
            <span className="font-semibold">{prayer.time}</span>
          </motion.div>
        ))}
      </div>

      <button className="btn-primary w-full mt-6">
        {t('widget.viewAll', 'View Full Calendar')}
      </button>
    </motion.div>
  );
}
