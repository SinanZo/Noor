import React from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Layout from '@/components/layout/Layout';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import dayjs from 'dayjs';

type HabitKey = 'salah' | 'quran' | 'dhikr' | 'charity' | 'fasting';

type Habit = {
  _id?: string;
  key: HabitKey;
  targetPerDay: number;
};

export default function PlannerPage() {
  const { t } = useTranslation('planner');
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any>({});

  const habitIcons: Record<HabitKey, string> = {
    salah: '🕌',
    quran: '📖',
    dhikr: '📿',
    charity: '💰',
    fasting: '🌙'
  };

  const habitColors: Record<HabitKey, string> = {
    salah: 'bg-emerald-500',
    quran: 'bg-blue-500',
    dhikr: 'bg-purple-500',
    charity: 'bg-yellow-500',
    fasting: 'bg-indigo-500'
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch habits
      const habitsRes = await api.get('/planner/habits');
      setHabits(habitsRes.data.data || []);

      // Fetch stats
      const from = dayjs().subtract(30, 'day').format('YYYY-MM-DD');
      const to = dayjs().format('YYYY-MM-DD');
      const statsRes = await api.get('/planner/stats', {
        params: { from, to }
      });

      setStreak(statsRes.data.data.streak || 0);
      setSummary(statsRes.data.data.summary || {});
    } catch (error) {
      console.error('Fetch data error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated()) {
      router.push('/auth/login');
      return;
    }
    fetchData();
  }, [isAuthenticated, router]);

  const setTarget = async (key: HabitKey, targetPerDay: number) => {
    try {
      await api.post('/planner/habits', { key, targetPerDay });
      await fetchData();
    } catch (error) {
      console.error('Set target error:', error);
    }
  };

  const logActivity = async (key: HabitKey) => {
    try {
      await api.post('/planner/log', { key, value: 1 });
      await fetchData();
    } catch (error) {
      console.error('Log activity error:', error);
    }
  };

  const getTarget = (key: HabitKey) => {
    return habits.find(h => h.key === key)?.targetPerDay ?? 1;
  };

  const allHabits: HabitKey[] = ['salah', 'quran', 'dhikr', 'charity', 'fasting'];

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen py-12 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold mb-2">
              {t('title', 'MuslimLife Planner')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              {t('subtitle', 'Track your daily ibadah and build consistent habits')}
            </p>

            {/* Streak Display */}
            <div className="card mb-8 bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90 mb-1">
                    {t('streak_label', 'Current Salah Streak')}
                  </p>
                  <p className="text-5xl font-bold">{streak}</p>
                  <p className="text-sm opacity-90 mt-1">
                    {t('days', 'days')}
                  </p>
                </div>
                <div className="text-6xl">🔥</div>
              </div>
            </div>

            {/* Habits Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {allHabits.map((key) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: allHabits.indexOf(key) * 0.1 }}
                  className="card hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{habitIcons[key]}</span>
                      <div>
                        <h3 className="font-semibold capitalize text-lg">
                          {t(`habit.${key}`, key)}
                        </h3>
                        {summary[key] && (
                          <p className="text-xs text-gray-500">
                            {summary[key].total} total • {summary[key].days} days
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Target Input */}
                  <div className="mb-4">
                    <label className="text-sm text-gray-600 dark:text-gray-400 block mb-2">
                      {t('target_label', 'Daily Target')}
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={getTarget(key)}
                      onChange={(e) => setTarget(key, Number(e.target.value))}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  {/* Log Button */}
                  <button
                    onClick={() => logActivity(key)}
                    className={`w-full ${habitColors[key]} hover:opacity-90 text-white font-semibold py-3 px-4 rounded-xl transition-opacity`}
                  >
                    {t('log_button', '+ Log Activity')}
                  </button>
                </motion.div>
              ))}
            </div>

            {/* Info Card */}
            <div className="card mt-8 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
              <h3 className="font-semibold mb-2 text-blue-900 dark:text-blue-100">
                💡 {t('tip_title', 'Pro Tip')}
              </h3>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                {t('tip_content', 'Build consistency by setting realistic daily targets. Track your progress and watch your streak grow! Remember, consistency is more important than perfection.')}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common', 'planner'])),
    },
  };
}
