'use client';

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CircularProgress, Chip, Spacer } from '@nextui-org/react';
import useAuthStore from '@/components/auth/authStore';
import useProfileStore from '@/components/store/useProfileStore';
import $api from '@/config/api/api';

export default function Dashboard({ initialLang }: { initialLang: string }) {
  const { t, i18n } = useTranslation(); // <-- Хук для использования перевода
  const { profile } = useProfileStore();

  useEffect(() => {
    if (i18n.language !== initialLang) {
      i18n.changeLanguage(initialLang); // Установка языка до рендера
    }
  }, [initialLang, i18n]);
  const [stats, setStats] = useState({
    totalLearnedWords: 0,
    totalWords: 0,
    maxStreak: 0,
    missedDays: 0,
    goalAchievementRate: 0,
    averageLearnedWordsPerDay: 0,
    totalTrainings: 0,
    dayWords: 0,
    learnedWordsToday: 0,
    learnedWordsThisWeek: 0,
    learnedWordsThisMonth: 0,
    learnedWordsThisYear: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await $api.get('/word-stats/summary');
        const wordsResponse = await $api.get('/words/counts');

        setStats({
          ...response.data,
          totalWords: wordsResponse.data.totalWords,
          dayWords: response.data.dayWords || 0,
        });
        setLoading(false);
      } catch (err) {
        setError(t('dashboard.loadingError')); // <-- Используем перевод
        setLoading(false);
      }
    };

    fetchStats();
  }, [t]); // Чтобы при смене языка строка тоже обновлялась

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {error}
      </div>
    );
  }

  const {
    totalLearnedWords,
    totalWords,
    maxStreak,
    missedDays,
    goalAchievementRate,
    averageLearnedWordsPerDay,
    totalTrainings,
    dayWords,
    learnedWordsToday,
    learnedWordsThisWeek,
    learnedWordsThisMonth,
    learnedWordsThisYear,
  } = stats;

  const learnedPercentage = totalWords > 0 ? (totalLearnedWords / totalWords) * 100 : 0;
  const remainingWords = totalWords - totalLearnedWords;

  const widgetData = [
    {
      title: t('dashboard.flashcards'),
      value: totalLearnedWords,
      subtext: t('dashboard.wordsLearned'),
    },
    {
      title: t('dashboard.dictionary'),
      value: totalWords,
      subtext: t('dashboard.words'),
    },
    {
      title: t('dashboard.dailyGoal'),
      value: profile?.dayWords || 0,
      subtext: t('dashboard.words'),
    },
    {
      title: t('dashboard.practice'),
      value: maxStreak,
      subtext: t('dashboard.words'), // или 'дней' — зависит от логики
    },
  ];

  return (
    <div className="h-[100%] bg-white text-black dark:bg-[#121212] dark:text-white p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{t('dashboard.mainPanel')}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-lg:gap-0">
        <div className="grid grid-cols-2 gap-4">
          {widgetData.map((widget, index) => (
            <Card
              key={index}
              className="p-6 bg-gray-100 text-black dark:bg-[#222222] dark:text-white shadow-none rounded-[22px] flex flex-col justify-between"
            >
              <h2 className="text-md font-semibold mb-2">{widget.title}</h2>
              <p className="text-4xl font-bold text-purple-600 dark:text-purple-400">
                {widget.value}
              </p>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {widget.subtext}
              </span>
            </Card>
          ))}
        </div>

        <div className="p-6 bg-gradient-to-r from-purple-400 to-purple-700 text-white shadow-md rounded-[24px] col-span-2 flex flex-col lg:flex-row max-lg:mt-4">
          <div className="flex flex-col justify-center items-center lg:w-[240px] w-full mb-6 lg:mb-0">
            <CircularProgress
              classNames={{
                svg: 'w-36 h-36 drop-shadow-none',
                indicator: 'stroke-white',
                track: 'stroke-white/10',
                value: 'text-3xl font-semibold text-white',
              }}
              value={learnedPercentage}
              strokeWidth={3}
              showValueLabel
            />
            <Chip
              classNames={{
                base: 'mt-4 border-1 border-white/30',
                content: 'text-white/90 text-small font-semibold',
              }}
              variant="bordered"
            >
              {totalLearnedWords} {t('dashboard.wordsLearned')}
            </Chip>
          </div>

          <div className="flex-1 flex flex-col justify-center items-center lg:items-start text-center lg:text-left">
            <h2 className="text-[20px] font-[700] mb-2">
              {t('dashboard.progressDetails')}
            </h2>
            <p className="text-sm text-gray-200 max-lg:my-[10px] leading-5">
              {t('dashboard.progressDescription', { totalWords })}
            </p>

            <div className="mt-4 flex flex-col justify-center items-start max-lg:items-center gap-3 w-full">
              <Chip
                classNames={{
                  base: 'bg-yellow-500 text-black rounded-[9px] w-full lg:w-auto py-2 px-4 shadow-none',
                  content: 'font-[500] text-sm text-center',
                }}
              >
                {t('dashboard.remainingWords', { count: Math.max(0, remainingWords) })}
              </Chip>
            </div>
          </div>
        </div>
      </div>

      <Spacer y={2} />

      {/* Блок с Today, This week, This month, This year */}
      <div className="grid grid-cols-1 mt-4 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: t('dashboard.today'),
            value: learnedWordsToday,
            borderColor: 'border-green-400',
          },
          {
            title: t('dashboard.thisWeek'),
            value: learnedWordsThisWeek,
            borderColor: 'border-yellow-400',
          },
          {
            title: t('dashboard.thisMonth'),
            value: learnedWordsThisMonth,
            borderColor: 'border-blue-400',
          },
          {
            title: t('dashboard.thisYear'),
            value: learnedWordsThisYear,
            borderColor: 'border-red-400',
          },
        ].map((block, index) => (
          <div
            key={index}
            className={`h-24 rounded-[18px] shadow-md p-4 flex flex-col justify-between bg-transparent border-2 ${block.borderColor}`}
          >
            <h3 className="text-sm font-medium text-black dark:text-white">
              {block.title}
            </h3>
            <p className="text-lg font-bold text-black dark:text-white">
              {block.value} {t('dashboard.wordsShort')}
            </p>
          </div>
        ))}
      </div>

      {/* Блок с тренировки, среднее слов в день и т.д. */}
      <div className="grid mt-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: t('dashboard.trainings'),
            value: totalTrainings,
            color: 'bg-green-400',
            textColor: 'text-black',
          },
          {
            title: t('dashboard.avgWordsPerDay'),
            value: Math.round(averageLearnedWordsPerDay), // Округляем до ближайшего целого
            color: ' bg-yellow-400 ',
            textColor: 'text-black',
          },

          {
            title: t('dashboard.goalCompletion'),
            value: `${goalAchievementRate.toFixed(0)}%`,
            color: 'bg-blue-400',
            textColor: 'text-black',
          },
          {
            title: t('dashboard.missedDays'),
            value: missedDays,
            color: ' bg-red-400 ',
            textColor: 'text-black',
          },
        ].map((block, index) => (
          <div
            key={index}
            className={`h-24 rounded-[18px] shadow-0 p-4 flex flex-col justify-between ${block.color}`}
          >
            <h3 className={`text-sm font-medium ${block.textColor || 'text-white'}`}>
              {block.title}
            </h3>
            <p className={`text-lg font-bold ${block.textColor || 'text-white'}`}>
              {block.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
