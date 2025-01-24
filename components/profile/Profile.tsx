'use client';

import React, { useEffect, useState } from 'react';
import {
  IconMail,
  IconLanguage,
  IconTargetArrow,
  IconCrown,
  IconWorld,
  IconCalendar,
} from '@tabler/icons-react';
import { Button } from '@nextui-org/react';
import useProfileStore from '@/components/store/useProfileStore';
import EditProfileModal from '@/components/editProfileModal/EditProfileModal';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

// Сопоставляем код языка с нужным форматом локали
const localeMap: Record<string, string> = {
  en: 'en-US',
  ru: 'ru-RU',
  es: 'es-ES',
  fr: 'fr-FR',
  de: 'de-DE',
  zh: 'zh-CN',
  it: 'it-IT',
  ja: 'ja-JP',
};

const languageMap: Record<string, string> = {
  en: 'English',
  ru: 'Русский',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  zh: '中文',
  it: 'Italiano',
  ja: '日本語',
};

export default function Profile({ initialLang }: { initialLang: string }) {
  const { profile, fetchProfile, updateProfile, loading } = useProfileStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const { t, i18n } = useTranslation();
  const router = useRouter();

  // Устанавливаем язык до рендера компонента
  useEffect(() => {
    if (i18n.language !== initialLang) {
      i18n.changeLanguage(initialLang);
    }
  }, [initialLang, i18n]);

  // Загружаем профиль при монтировании
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Сохранение изменений в профиле
  const handleSaveChanges = async (updatedData: {
    username: string;
    email: string;
    learningLanguage: string;
    nativeLanguage: string;
  }) => {
    setSaving(true);
    try {
      await updateProfile(updatedData);
      await fetchProfile(); // Обновляем данные после сохранения
    } catch (err) {
      console.error('Ошибка при обновлении профиля:', err);
    } finally {
      setSaving(false);
    }
  };

  // Форматируем дату окончания подписки
  const formatSubscriptionEndDate = () => {
    try {
      if (!profile?.subscriptionEndDate) return '';
      const date = new Date(profile.subscriptionEndDate);
      // Определяем нужную локаль
      const locale = localeMap[i18n.language] || 'en-US';
      // Форматируем дату по выбранной локали
      return date.toLocaleDateString(locale, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch (e) {
      return profile?.subscriptionEndDate || '';
    }
  };

  return (
    <div className="h-[100%] dark:bg-[#121212] py-10">
      <div className="max-w-4xl mx-auto rounded-[32px] shadow-0 p-8">
        {/* Аватар */}
        <div className="flex justify-center">
          <div className="w-24 h-24 rounded-full bg-blue-500 flex items-center justify-center text-4xl text-white">
            {profile?.avatar}
          </div>
        </div>

        {/* Имя пользователя и email (краткая инфо вверху) */}
        <div className="flex mt-6 items-center justify-center gap-6 mb-0">
          <div>
            <h1 className="text-3xl font-bold text-center text-gray-800 dark:text-gray-100">
              {profile?.username}
            </h1>
            <p className="text-gray-600 mt-2 text-center dark:text-gray-400">
              {profile?.email}
            </p>
          </div>
        </div>

        {/* Основная информация о пользователе (сетка карточек) */}
        <div className="flex justify-center items-center bg-transparent mb-[40px] mt-[30px]">
          <div className="w-full max-w-[700px] rounded-2xl shadow-0 p-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* E-mail */}
              <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-[#2a2a2a] rounded-[18px] shadow-0">
                <div className="p-2 rounded-[14px] bg-blue-100 dark:bg-blue-700">
                  <IconMail size={28} className="text-blue-500 dark:text-blue-300" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                    E-mail
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">{profile?.email}</p>
                </div>
              </div>

              {/* Язык обучения */}
              <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-[#2a2a2a] rounded-[18px] shadow-0">
                <div className="p-2 rounded-[14px] bg-green-100 dark:bg-green-700">
                  <IconLanguage
                    size={28}
                    className="text-green-500 dark:text-green-300"
                  />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                    {t('profile.learningLanguage')}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    {languageMap[profile?.learningLanguage] || profile?.learningLanguage}
                  </p>
                </div>
              </div>

              {/* Родной язык */}
              <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-[#2a2a2a] rounded-[18px] shadow-0 transition-shadow">
                <div className="p-2 rounded-[14px] bg-orange-100 dark:bg-orange-700">
                  <IconWorld size={28} className="text-orange-500 dark:text-orange-300" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                    {t('profile.nativeLanguage')}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    {languageMap[profile?.nativeLanguage] || profile?.nativeLanguage}
                  </p>
                </div>
              </div>

              {/* Ежедневная цель по словам */}
              <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-[#2a2a2a] rounded-[18px] shadow-sm transition-shadow">
                <div className="p-2 rounded-[14px] bg-yellow-100 dark:bg-yellow-700">
                  <IconTargetArrow
                    size={28}
                    className="text-yellow-500 dark:text-yellow-300"
                  />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                    {t('profile.dailyGoal')}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    {profile?.dayWords} {t('profile.wordsPerDay')}
                  </p>
                </div>
              </div>

              {/* Тарифный план */}
              <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-[#2a2a2a] rounded-[18px] shadow-sm transition-shadow">
                <div className="p-2 rounded-[14px] bg-purple-100 dark:bg-purple-700">
                  <IconCrown size={28} className="text-purple-500 dark:text-purple-300" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                    {t('profile.subscriptionPlan')}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    {profile?.plan === 'free' && t('profile.free')}
                    {profile?.plan === 'premium' && t('profile.premium')}
                    {profile?.plan === 'enterprise' && t('profile.corporate')}
                  </p>
                </div>
              </div>

              {/* Дата окончания подписки (локализованный вывод) */}
              <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-[#2a2a2a] rounded-[18px] shadow-sm transition-shadow">
                <div className="p-2 rounded-[14px] bg-blue-100 dark:bg-blue-700">
                  <IconCalendar size={28} className="text-blue-500 dark:text-blue-300" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                    {t('date_end')}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    {formatSubscriptionEndDate() ? (
                      formatSubscriptionEndDate()
                    ) : (
                      <span className="text-[16px] font-bold">∞</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Кнопка редактирования профиля */}
        <div className="mt-4 flex w-full justify-center gap-4">
          <Button
            color="primary"
            className="px-6 max-w-[320px] w-full py-2 rounded-[14px]"
            onPress={() => router.push('/settings')}
          >
            Редактировать профиль
          </Button>
        </div>

        {/* Модальное окно для редактирования профиля */}
        <EditProfileModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          // @ts-ignore
          profileData={{
            username: profile?.username || '',
            email: profile?.email || '',
            learningLanguage: profile?.learningLanguage || '',
            nativeLanguage: profile?.nativeLanguage || '',
          }}
          onSaveChanges={handleSaveChanges}
          saving={saving}
        />
      </div>
    </div>
  );
}
