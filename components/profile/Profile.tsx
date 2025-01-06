'use client';

import React, { useEffect, useState } from 'react';
import {
  IconMail,
  IconLanguage,
  IconTargetArrow,
  IconCrown,
  IconWorld,
} from '@tabler/icons-react';
import { Button } from '@nextui-org/react';
// Импортируем модальное окно
import useProfileStore from '@/components/store/useProfileStore';
import EditProfileModal from '@/components/editProfileModal/EditProfileModal';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

const languageMap: Record<string, string> = {
  en: 'English',
  ru: 'Русский',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  zh: '中文',
  it: 'Italiano',
  jp: '日本語',
};

export default function Profile({ initialLang }: { initialLang: string }) {
  const { profile, fetchProfile, updateProfile, loading } = useProfileStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false); // Состояние для кнопки сохранения
  const { t, i18n } = useTranslation();
  useEffect(() => {
    if (i18n.language !== initialLang) {
      i18n.changeLanguage(initialLang); // Установка языка до рендера
    }
  }, [initialLang, i18n]);
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);
  const router = useRouter();

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

  return (
    <div className="h-[100%] dark:bg-[#121212] py-10">
      <div className="max-w-4xl mx-auto rounded-[32px] shadow-0 p-8">
        <div className="flex justify-center">
          <div className="w-24 h-24 rounded-full bg-blue-500 flex items-center justify-center text-4xl text-white">
            {profile?.avatar}
          </div>
        </div>
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

        <div className="flex justify-center items-center bg-transparent mb-[40px] mt-[30px]">
          <div className="w-full max-w-[700px]  rounded-2xl shadow-0 p-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-[#2a2a2a] rounded-[18px] shadow-0   ">
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

              <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-[#2a2a2a] rounded-[18px] shadow-sm   transition-shadow">
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

              <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-[#2a2a2a] rounded-[18px] shadow-sm   transition-shadow">
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
            </div>
          </div>
        </div>

        <div className="mt-4 flex w-full justify-center gap-4">
          <Button
            color="primary"
            className="px-6 max-w-[320px] w-full py-2 rounded-[14px]"
            onPress={() => router.push('/settings')}
          >
            Редактировать профиль
          </Button>
        </div>

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
