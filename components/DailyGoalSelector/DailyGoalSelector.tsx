'use client';
// @ts-ignore
import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
} from '@nextui-org/react';
import { Slider } from '@nextui-org/slider';
import useProfileStore from '../store/useProfileStore';
import { IconTargetArrow } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

type DailyGoalSelectorProps = {
  onSetGoal: (goal: number) => void;
  fetchUnmasteredWords: () => Promise<void>;
};

const DailyGoalSelector: React.FC<DailyGoalSelectorProps> = ({
  onSetGoal,
  fetchUnmasteredWords,
}) => {
  const { t } = useTranslation(); // <-- используем неймспейс common
  const { profile, updateDayWords, fetchProfile } = useProfileStore();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const [dailyGoal, setDailyGoal] = useState<number>(20);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (profile?.dayWords) {
      setDailyGoal(profile.dayWords);
    }
  }, [profile]);

  const handleConfirm = async () => {
    await updateDayWords(dailyGoal);
    onSetGoal(dailyGoal);
    // @ts-ignore
    onOpenChange(false);
    if (fetchUnmasteredWords) {
      await fetchUnmasteredWords();
    }
  };

  // Создание меток для ползунка
  const marks = Array.from({ length: 10 }, (_, i) => ({
    value: (i + 1) * 10,
    label: `${(i + 1) * 10}`,
  }));

  return (
    <>
      {/* Кнопка для открытия модального окна */}
      <Button
        onPress={onOpen}
        className="flex items-center justify-center gap-2 px-4 py-3 text-black dark:text-white text-[14px] rounded-[12px]"
      >
        <IconTargetArrow size={20} stroke={1.5} className="text-black dark:text-white" />
        {t('dailyGoalSelector.setGoalButton')}
      </Button>
      {/* @ts-ignore */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        {/* @ts-ignore */}
        <ModalContent>
          {onClose => (
            <>
              {/* Заголовок */}
              <ModalHeader className="flex flex-col gap-1">
                {t('dailyGoalSelector.modalTitle')}
              </ModalHeader>

              {/* Тело модального окна */}
              <ModalBody>
                <p className="text-gray-500 text-sm mb-4">
                  {t('dailyGoalSelector.modalDescription')}
                </p>

                {/* Ползунок для выбора цели */}
                <div className="flex flex-col items-center gap-4">
                  <Slider
                    value={dailyGoal}
                    step={10}
                    minValue={10}
                    maxValue={100}
                    onChange={setDailyGoal}
                    showTooltip={true}
                    aria-label="Daily Goal"
                    className="w-full"
                    marks={marks}
                  />
                </div>
              </ModalBody>

              {/* Футер с кнопками */}
              <ModalFooter className="mt-3 mb-2">
                <Button variant="light" color="danger" onPress={onClose}>
                  {t('dailyGoalSelector.cancel')}
                </Button>
                <Button color="primary" onPress={handleConfirm}>
                  {t('dailyGoalSelector.confirm')}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default DailyGoalSelector;
