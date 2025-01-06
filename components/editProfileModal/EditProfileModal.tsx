'use client';

import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Select,
  SelectItem,
  Input,
  Button,
  Switch,
} from '@nextui-org/react';
import { useRouter } from 'next/navigation'; // Импортируем useRouter для навигации
import DailyGoalSelector from '../DailyGoalSelector/DailyGoalSelector';
import { IconCrown } from '@tabler/icons-react';

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

const EditProfileModal = ({
  isOpen,
  onClose,
  profileData,
  onSaveChanges,
  fetchUnmasteredWords,
}: {
  isOpen: boolean;
  onClose: () => void;
  profileData: {
    username: string;
    email: string;
    learningLanguage: string;
    nativeLanguage: string;
    seeTranslate: boolean;
    dayWords: number;
  };
  onSaveChanges: (updatedData: {
    username: string;
    email: string;
    learningLanguage: string;
    nativeLanguage: string;
    seeTranslate: boolean;
  }) => void;
  fetchUnmasteredWords: () => Promise<void>;
}) => {
  const [formData, setFormData] = useState(profileData);
  const [dailyGoal, setDailyGoal] = useState(profileData.dayWords);
  const router = useRouter(); // Используем useRouter для навигации

  useEffect(() => {
    setFormData(profileData);
    setDailyGoal(profileData.dayWords);
  }, [profileData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string | null) => {
    if (value) {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleToggleChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, seeTranslate: checked }));
  };

  const handleSave = () => {
    // @ts-ignore
    onSaveChanges({ ...formData, dayWords: dailyGoal });
    onClose();
  };

  const handleChangePlan = () => {
    router.push('/plans'); // Навигация на страницу /plans
  };

  return (
    <>
      {/* @ts-ignore */}
      <Modal isOpen={isOpen} onOpenChange={onClose}>
        {/* @ts-ignore */}
        <ModalContent>
          <ModalHeader className="text-xl font-bold">Редактировать профиль</ModalHeader>
          <ModalBody>
            <Input
              label="Имя пользователя"
              value={formData.username}
              onChange={handleInputChange}
              name="username"
              fullWidth
              clearable
            />
            <Input
              label="Email"
              value={formData.email}
              onChange={handleInputChange}
              name="email"
              fullWidth
              clearable
            />
            {/* @ts-ignore */}
            <Select
              label="Изучаемый язык"
              selectedKeys={new Set([formData.learningLanguage])}
              onSelectionChange={selected =>
                handleSelectChange('learningLanguage', Array.from(selected)[0] as string)
              }
            >
              {Object.entries(languageMap).map(([code, label]) => (
                <SelectItem key={code} value={code}>
                  {label}
                </SelectItem>
              ))}
            </Select>
            {/* @ts-ignore */}
            <Select
              label="Родной язык"
              selectedKeys={new Set([formData.nativeLanguage])}
              onSelectionChange={selected =>
                handleSelectChange('nativeLanguage', Array.from(selected)[0] as string)
              }
            >
              {Object.entries(languageMap).map(([code, label]) => (
                <SelectItem key={code} value={code}>
                  {label}
                </SelectItem>
              ))}
            </Select>

            <DailyGoalSelector
              onSetGoal={setDailyGoal}
              fetchUnmasteredWords={fetchUnmasteredWords}
            />
            <Button
              color="primary"
              onPress={handleChangePlan}
              className="flex items-center gap-2"
            >
              <IconCrown size={20} className="text-white" />
              Изменить план
            </Button>
          </ModalBody>
          <ModalFooter>
            <div className="flex w-full justify-between">
              <Button variant="light" color="danger" onPress={onClose}>
                Отмена
              </Button>

              <Button color="primary" onPress={handleSave}>
                Сохранить
              </Button>
            </div>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default EditProfileModal;
