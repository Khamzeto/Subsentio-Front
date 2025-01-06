'use client';

import React, { useState, useEffect } from 'react';
import {
  Select,
  SelectItem,
  Input,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@nextui-org/react';
import { useRouter } from 'next/navigation';
import useProfileStore from '@/components/store/useProfileStore';
import useLanguageStore from '@/components/store/useLanguageStore';
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

const emojis = ['😊', '😎', '🐣', '🌟', '🔥', '🎉', '💎', '🦄'];

const EditProfilePage = ({ initialLang }: { initialLang: string }) => {
  const { t, i18n } = useTranslation();
  const { profile, fetchProfile, updateProfile } = useProfileStore();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    learningLanguage: '',
    nativeLanguage: '',
    seeTranslate: false,
    dayWords: 20,
    avatar: '',
  });
  const [saving, setSaving] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchProfile();
  }, []);
  useEffect(() => {
    if (i18n.language !== initialLang) {
      i18n.changeLanguage(initialLang); // Установка языка до рендера
    }
  }, [initialLang, i18n]);
  useEffect(() => {
    if (profile && !formData.username) {
      setFormData({
        username: profile.username || '',
        email: profile.email || '',
        learningLanguage: profile.learningLanguage || '',
        nativeLanguage: profile.nativeLanguage || '',
        seeTranslate: profile.seeTranslate || false,
        dayWords: profile.dayWords || 20,
        avatar: profile.avatar || '😊',
      });
    }
  }, [profile, formData.username]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string | null) => {
    if (value) {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({
        username: formData.username,
        email: formData.email,
        learningLanguage: formData.learningLanguage,
        nativeLanguage: formData.nativeLanguage,
        seeTranslate: formData.seeTranslate,
        avatar: formData.avatar,
      });
      if (formData.nativeLanguage) {
        const { setLanguage } = useLanguageStore.getState();
        setLanguage(formData.nativeLanguage); // Устанавливаем новый язык
      }
      // Показать модальное окно при успехе
      await fetchProfile(); // Обновить данные профиля
      setIsSuccessModalOpen(true);
    } catch (err) {
      console.error('Ошибка при обновлении профиля:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = (emoji: string) => {
    setFormData(prev => ({ ...prev, avatar: emoji }));
    setIsAvatarModalOpen(false);
  };

  return (
    <div className="h-[100%] dark:bg-[#121212] py-10 px-4">
      <div className="max-w-[540px] mx-auto rounded-[40px] shadow-0 p-8  ">
        <h1 className="text-2xl font-[600] mb-6 text-center dark:text-white">
          {t('profile.settings')}
        </h1>

        <div className="flex justify-center mb-8">
          <div
            className="w-24 h-24 rounded-full bg-blue-500 flex items-center justify-center text-4xl cursor-pointer"
            onClick={() => setIsAvatarModalOpen(true)}
          >
            {formData.avatar}
          </div>
        </div>

        <div className="mb-4 ">
          <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-1">
            {t('signIn.emailLabel')}
          </label>
          <p className="text-[16px] text-gray-900 dark:text-white  py-2 rounded-md">
            {formData.email}
          </p>
        </div>

        <Input
          label={t('profile.username')}
          value={formData.username}
          onChange={handleInputChange}
          name="username"
          fullWidth
          clearable
          className="mb-4"
        />
        {/* @ts-ignore */}
        <Select
          label={t('profile.learningLanguage')}
          selectedKeys={new Set([formData.learningLanguage])}
          onSelectionChange={selected =>
            handleSelectChange('learningLanguage', Array.from(selected)[0] as string)
          }
          className="mb-4"
        >
          {Object.entries(languageMap).map(([code, label]) => (
            <SelectItem key={code} value={code}>
              {label}
            </SelectItem>
          ))}
        </Select>
        {/* @ts-ignore */}
        <Select
          label={t('profile.nativeLanguage')}
          selectedKeys={new Set([formData.nativeLanguage])}
          onSelectionChange={selected =>
            handleSelectChange('nativeLanguage', Array.from(selected)[0] as string)
          }
          className="mb-4"
        >
          {Object.entries(languageMap).map(([code, label]) => (
            <SelectItem key={code} value={code}>
              {label}
            </SelectItem>
          ))}
        </Select>

        <div className="flex mt-4 justify-center">
          <Button
            color="success"
            onPress={handleSave}
            isLoading={saving}
            className="w-full bg-[#39B14C] text-white"
          >
            {t('profile.save')}
          </Button>
        </div>
        {/* @ts-ignore */}
        <Modal isOpen={isAvatarModalOpen} onOpenChange={setIsAvatarModalOpen}>
          {/* @ts-ignore */}
          <ModalContent>
            <ModalHeader className="text-xl font-bold">
              {' '}
              {t('profile.selectAvatar')}
            </ModalHeader>
            <ModalBody className="flex flex-row flex-wrap justify-start gap-5">
              {emojis.map(emoji => (
                <div
                  key={emoji}
                  className="w-12 h-12 flex items-center justify-center text-2xl cursor-pointer bg-gray-100 rounded-full hover:bg-gray-200"
                  onClick={() => handleAvatarChange(emoji)}
                >
                  {emoji}
                </div>
              ))}
            </ModalBody>

            <ModalFooter>
              <Button color="danger" onPress={() => setIsAvatarModalOpen(false)}>
                {t('profile.close')}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
        {/* @ts-ignore */}
        <Modal isOpen={isSuccessModalOpen} onOpenChange={setIsSuccessModalOpen}>
          {/* @ts-ignore */}
          <ModalContent>
            <ModalHeader className="text-xl font-bold">
              {' '}
              {t('profile.success')}
            </ModalHeader>
            <ModalBody>
              <p> {t('profile.profileUpdated')}</p>
            </ModalBody>
            <ModalFooter>
              <Button color="success" onPress={() => setIsSuccessModalOpen(false)}>
                {t('profile.close')}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </div>
  );
};

export default EditProfilePage;
