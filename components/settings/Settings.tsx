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
import $api from '@/config/api/api'; // Используем ваш настроенный клиент
import useProfileStore from '@/components/store/useProfileStore';
import useLanguageStore from '@/components/store/useLanguageStore';
import { useTranslation } from 'react-i18next';

const nativeLanguageMap: Record<string, string> = {
  en: 'English',
  ru: 'Русский',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  it: 'Italiano',
  pt: 'Português',
  ar: 'العربية', // Арабский язык
  ja: '日本語', // Японский язык
  zh: '中文', // Китайский язык
};

const learningLanguageMap: Record<string, string> = {
  en: 'English',
  ru: 'Русский',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  it: 'Italiano',
  pt: 'Português',
  ar: 'العربية', // Арабский язык
};

const emojis = ['😊', '😎', '🐣', '🌟', '🔥', '🎉', '💎', '🦄'];

type Props = {
  initialLang: string;
};

const EditProfilePage = ({ initialLang }: Props) => {
  const { t, i18n } = useTranslation();
  // Берём методы и данные из вашего Store
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

  // Стейт для формы смены пароля
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  const [saving, setSaving] = useState(false); // индикатор загрузки
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const router = useRouter();

  // При первом рендере загружаем профиль
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Устанавливаем язык i18n
  useEffect(() => {
    if (i18n.language !== initialLang) {
      i18n.changeLanguage(initialLang);
    }
  }, [initialLang, i18n]);

  // Заполняем форму данными профиля
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

  // Обработчик изменений в текстовых полях (username, etc.)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Обработчик изменений в полях пароля
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  // Обработчик выбора языка (Select)
  const handleSelectChange = (name: string, value: string | null) => {
    if (value) {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Сохранение изменений в профиле
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

      // Если сменился родной язык, обновляем его в глобальном сторе
      if (formData.nativeLanguage) {
        const { setLanguage } = useLanguageStore.getState();
        setLanguage(formData.nativeLanguage);
      }

      // Обновляем профиль и показываем уведомление об успехе
      await fetchProfile();
      setIsSuccessModalOpen(true);
    } catch (err) {
      console.error('Ошибка при обновлении профиля:', err);
    } finally {
      setSaving(false);
    }
  };

  // Сохранение нового пароля
  const handlePasswordSave = async () => {
    setSaving(true);
    try {
      // Проверяем совпадение пароля и подтверждения
      if (passwordData.newPassword !== passwordData.confirmNewPassword) {
        console.error('Пароли не совпадают');
        setSaving(false);
        return;
      }

      // Запрос на эндпоинт смены пароля через $api
      await $api.post('/users/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      // Сброс полей формы пароля
      setPasswordData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
      // Закрываем модалку и показываем успешное сообщение
      setIsPasswordModalOpen(false);
      setIsSuccessModalOpen(true);
    } catch (err) {
      console.error('Ошибка при изменении пароля:', err);
    } finally {
      setSaving(false);
    }
  };

  // Смена аватара (emoji)
  const handleAvatarChange = (emoji: string) => {
    setFormData(prev => ({ ...prev, avatar: emoji }));
    setIsAvatarModalOpen(false);
  };

  return (
    <div className="h-[100%] dark:bg-[#121212] py-10 px-4">
      <div className="max-w-[540px] mx-auto rounded-[40px] shadow-0 p-8">
        <h1 className="text-2xl font-[600] mb-6 text-center dark:text-white">
          {t('profile.settings')}
        </h1>

        {/* Аватар */}
        <div className="flex justify-center mb-8">
          <div
            className="w-24 h-24 rounded-full bg-blue-500 flex items-center justify-center text-4xl cursor-pointer"
            onClick={() => setIsAvatarModalOpen(true)}
          >
            {formData.avatar}
          </div>
        </div>

        {/* Отображаем email (нельзя менять) */}
        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-1">
            {t('signIn.emailLabel')}
          </label>
          <p className="text-[16px] text-gray-900 dark:text-white py-2 rounded-md">
            {formData.email}
          </p>
        </div>

        {/* Имя пользователя */}
        <Input
          label={t('profile.username')}
          value={formData.username}
          onChange={handleInputChange}
          name="username"
          fullWidth
          clearable
          className="mb-4"
        />

        {/* Выбор изучаемого языка */}
        {/* @ts-ignore */}
        {/* Выбор изучаемого языка */}
        <Select
          label={t('profile.learningLanguage')}
          selectedKeys={new Set([formData.learningLanguage])}
          onSelectionChange={selected =>
            handleSelectChange('learningLanguage', Array.from(selected)[0] as string)
          }
          className="mb-4"
        >
          {Object.entries(learningLanguageMap).map(([code, label]) => (
            <SelectItem key={code} value={code}>
              {label}
            </SelectItem>
          ))}
        </Select>

        {/* Выбор родного языка */}
        <Select
          label={t('profile.nativeLanguage')}
          selectedKeys={new Set([formData.nativeLanguage])}
          onSelectionChange={selected =>
            handleSelectChange('nativeLanguage', Array.from(selected)[0] as string)
          }
          className="mb-4"
        >
          {Object.entries(nativeLanguageMap).map(([code, label]) => (
            <SelectItem key={code} value={code}>
              {label}
            </SelectItem>
          ))}
        </Select>

        {/* Кнопка сохранения изменений профиля */}
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

        {/* Кнопка открытия модалки смены пароля */}
        <div className="flex mt-4 justify-center">
          <Button
            color="primary"
            onPress={() => setIsPasswordModalOpen(true)}
            className="w-full bg-[#0070F3] text-white"
          >
            {t('forgotPassword.changePasswordButton')}
          </Button>
        </div>

        {/* Модальное окно для смены пароля */}
        {/* @ts-ignore */}
        <Modal isOpen={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
          {/* @ts-ignore */}
          <ModalContent>
            <ModalHeader className="text-xl font-bold">
              {t('forgotPassword.changePasswordButton')}
            </ModalHeader>
            <ModalBody>
              <Input
                label={t('change.currentPassword')}
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                name="currentPassword"
                type="password"
                fullWidth
                className="mb-4"
              />
              <Input
                label={t('forgotPassword.enterNewPassword')}
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                name="newPassword"
                type="password"
                fullWidth
                className="mb-4"
              />
              <Input
                label={t('signUp.confirmPasswordPlaceholder')}
                value={passwordData.confirmNewPassword}
                onChange={handlePasswordChange}
                name="confirmNewPassword"
                type="password"
                fullWidth
                className="mb-4"
              />
            </ModalBody>
            <ModalFooter>
              <Button color="primary" onPress={handlePasswordSave} isLoading={saving}>
                {t('profile.save')}
              </Button>
              <Button color="danger" onPress={() => setIsPasswordModalOpen(false)}>
                {t('profile.close')}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Модалка выбора аватара */}
        {/* @ts-ignore */}
        <Modal isOpen={isAvatarModalOpen} onOpenChange={setIsAvatarModalOpen}>
          {/* @ts-ignore */}
          <ModalContent>
            <ModalHeader className="text-xl font-bold">
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

        {/* Модальное окно успешного сохранения (профиль или пароль) */}
        {/* @ts-ignore */}
        <Modal isOpen={isSuccessModalOpen} onOpenChange={setIsSuccessModalOpen}>
          {/* @ts-ignore */}
          <ModalContent>
            <ModalHeader className="text-xl font-bold">
              {t('profile.success')}
            </ModalHeader>
            <ModalBody>
              <p>{t('profile.profileUpdated')}</p>
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
