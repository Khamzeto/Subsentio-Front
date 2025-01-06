'use client';

import React, { useState, useEffect } from 'react';
import { Button, Progress, Card } from '@nextui-org/react';
import Flashcard from '@/components/flashcard/Flashcard';
import DailyGoalSelector from '@/components/DailyGoalSelector/DailyGoalSelector';
import { IconBook, IconCheck, IconRepeat } from '@tabler/icons-react';
import $api from '@/config/api/api';
import useProfileStore from '@/components/store/useProfileStore';
import { useTranslation } from 'react-i18next';

// Тип для слова
type Word = {
  _id: string;
  word: string;
  transcription: string;
  partOfSpeech: string;
  translation: string;
};

export default function Practice({ initialLang }: { initialLang: string }) {
  const { t, i18n } = useTranslation();
  const { profile, fetchProfile } = useProfileStore();

  // Список «непройденных» слов
  const [wordsToPractice, setWordsToPractice] = useState<Word[]>([]);

  // История просмотренных слов
  const [history, setHistory] = useState<Word[]>([]);

  // Индекс текущего слова в history
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  // Сколько слов уже выучено (для прогресс-бара)
  const [dailyLearnedWords, setDailyLearnedWords] = useState<number>(0);

  // Анимация смахивания (left/right)
  const [moveDirection, setMoveDirection] = useState<'left' | 'right' | null>(null);

  // Достигли ли цели?
  const [isGoalReached, setIsGoalReached] = useState<boolean | null>(null);

  // Флаг загрузки (при запросах)
  const [loading, setLoading] = useState<boolean>(false);

  // Цель пользователя (сколько слов нужно выучить)
  const [dayWords, setDayWords] = useState<number>(0);

  // Процент выполнения цели
  const progressPercentage = dayWords > 0 ? (dailyLearnedWords / dayWords) * 100 : 0;

  // Пусто ли всё (и history, и wordsToPractice)
  const isListEmpty = wordsToPractice.length === 0;

  // --- Загрузка данных при монтировании ---
  useEffect(() => {
    fetchProfile(); // Получаем профиль (там dayWords)
    fetchDailyStats(); // Сколько уже выучено сегодня
    fetchUnmasteredWords(); // Слова, которые ещё не выучены
    checkDailyGoal(); // Проверяем, достигнута ли цель
  }, [fetchProfile]);
  useEffect(() => {
    if (i18n.language !== initialLang) {
      i18n.changeLanguage(initialLang); // Установка языка до рендера
    }
  }, [initialLang, i18n]);

  /**
   * Если в профиле (Zustand) поменялся dayWords (пользователь установил новую цель),
   * автоматически подгружаем слова и статистику заново, чтобы не ждать перезагрузки страницы.
   */
  useEffect(() => {
    if (profile && profile.dayWords) {
      // Допустим, при каждой смене dayWords подгружаем заново
      fetchUnmasteredWords();
      fetchDailyStats();
      console.log(profile, 'профиль');
      setDayWords(profile.dayWords);
    }
  }, [profile?.dayWords]);

  useEffect(() => {
    if (profile?.dayWords) {
      setDayWords(profile.dayWords);

      // Устанавливаем локальное значение, если оно есть в профиле
    }
  }, [profile]);
  // Проверить, достигнута ли дневная цель
  const checkDailyGoal = async () => {
    try {
      setLoading(true);
      const response = await $api.get('/word-stats/check-daily-goal');
      setIsGoalReached(response.data.isGoalReached);
    } catch (error: any) {
      console.error(
        'Не удалось проверить достижение цели:',
        error.response?.data?.message
      );
      setIsGoalReached(null);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Загружаем статистику за сегодня:
   *  - learnedWords (число выученных слов)
   *  - wordSequence (история уже просмотренных слов)
   */
  const fetchDailyStats = async () => {
    try {
      const response = await $api.get('/word-stats/daily');
      const learnedCount = response.data?.stats?.learnedWords ?? 0;
      setDailyLearnedWords(learnedCount);

      const { wordSequence } = response.data?.stats ?? {};
      if (wordSequence && wordSequence.length > 0) {
        setHistory(wordSequence);
        setCurrentIndex(wordSequence.length);
      }
    } catch (error: any) {
      console.error(
        error.response?.data?.message || 'Не удалось получить статистику за день'
      );
    }
  };

  /**
   * Загружаем слова, которые ещё не выучены (unmastered).
   * Объединяем их со старыми (чтобы не терять).
   */
  const fetchUnmasteredWords = async () => {
    setLoading(true);
    try {
      const response = await $api.get('/words?filter=unmastered');
      const newWords = response.data.words ?? [];
      setWordsToPractice(prev => [...prev, ...newWords]);
    } catch (error: any) {
      console.error('Не удалось загрузить слова:', error.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Возвращаем текущее слово:
   * - Если currentIndex < history.length, значит показываем history[currentIndex]
   * - Иначе, если currentIndex == history.length, показываем wordsToPractice[0]
   * - Иначе null (всё пройдено)
   */
  const getCurrentWord = (): Word | null => {
    if (currentIndex < history.length) {
      return history[currentIndex];
    }
    if (currentIndex === history.length && wordsToPractice.length > 0) {
      return wordsToPractice[0];
    }
    return null;
  };

  /**
   * useEffect, который следит за "новым словом" (из wordsToPractice).
   * Если текущий index == history.length (значит мы «впервые» видим слово из wordsToPractice[0]),
   * добавим это слово в history, чтобы кнопка «Repeat» потом работала без перезагрузки.
   */
  useEffect(() => {
    const currentWord = getCurrentWord();
    if (currentWord && currentIndex === history.length) {
      // Проверяем, нет ли уже этого слова в history
      const alreadyInHistory = history.some(w => w._id === currentWord._id);
      if (!alreadyInHistory) {
        setHistory(prev => [...prev, currentWord]);
      }
    }
  }, [currentIndex, history, wordsToPractice]);

  /**
   * Кнопка «Повторить» (шаг назад)
   */
  const handleRepeat = () => {
    if (currentIndex > 0) {
      setMoveDirection(null);
      setCurrentIndex(prev => prev - 1);
    }
  };

  /**
   * Обработка нажатия "Знаю" / "Ещё изучаю"
   * - Если known, делаем patch(learned=true) и put(.../update)
   * - Инкрементируем dailyLearnedWords и проверяем, превысили ли цель
   * - Удаляем слово из wordsToPractice, если оно там
   * - Сдвигаем currentIndex, если слово было в history
   * - Или удаляем 0-й элемент из wordsToPractice (если оно было оттуда)
   */
  const handleMark = async (known: boolean) => {
    const currentWord = getCurrentWord();
    if (!currentWord) return;

    setMoveDirection(known ? 'right' : 'left');

    setTimeout(async () => {
      try {
        if (known) {
          // Если "Знаю"
          await $api.patch(`/words/${currentWord._id}/learned`, { learned: true });

          try {
            await $api.put('/word-stats/update', { wordId: currentWord._id });
            setDailyLearnedWords(prevCount => {
              const newCount = prevCount + 1;
              if (dayWords > 0 && newCount >= dayWords) {
                setIsGoalReached(true);
              }
              return newCount;
            });
          } catch (statsError: any) {
            if (statsError.response?.status === 400) {
              console.warn('Слово уже учтено.');
            }
          }

          if (currentIndex < history.length) {
            setCurrentIndex(prev => prev + 1);
            setWordsToPractice(prev => prev.filter(w => w._id !== currentWord._id));
          } else {
            setWordsToPractice(prev =>
              prev.slice(1).filter(w => w._id !== currentWord._id)
            );
          }

          setHistory(prevHistory => {
            const alreadyInHistory = prevHistory.some(w => w._id === currentWord._id);
            return alreadyInHistory ? prevHistory : [...prevHistory, currentWord];
          });
        } else {
          // Если "Ещё изучаю"
          await $api.patch(`/words/${currentWord._id}/learning`, { learning: true });

          setCurrentIndex(prev => prev + 1);

          // Обновляем массив и индекс последовательно
          setWordsToPractice(prevWords => {
            const nextWords = [...prevWords.slice(1), currentWord];
            setCurrentIndex(history.length); // Индекс обновляем после изменения массива
            return nextWords;
          });
          setCurrentIndex(prev => prev + 1);

          setHistory(prevHistory => {
            const alreadyInHistory = prevHistory.some(w => w._id === currentWord._id);
            return alreadyInHistory ? prevHistory : [...prevHistory, currentWord];
          });
        }
      } catch (error: any) {
        console.error('Ошибка при handleMark:', error.response?.data?.message);
      } finally {
        setMoveDirection(null);
      }
    }, 300);
  };

  // Получаем текущее слово
  const currentWord = getCurrentWord();

  return (
    <div className="flex flex-col h-full w-full dark:bg-[#121212] overflow-hidden p-6 mx-auto">
      {/* Шапка: заголовок и выбор дневной цели */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{t('practice.title')}</h1>
        <DailyGoalSelector
          onSetGoal={(goal: number) => {
            // Можно что-то делать сразу, но мы используем useEffect для подгрузки
          }}
          fetchUnmasteredWords={async () => {
            await fetchProfile();
            await fetchUnmasteredWords();
            await fetchDailyStats();
            checkDailyGoal();
          }}
        />
      </div>

      {/* Прогресс и количество выученных */}
      <div className="flex mt-4 flex-col items-center">
        <div className="flex justify-between items-center w-full max-w-[520px] mb-4">
          <Progress
            value={Math.round(progressPercentage)}
            color="primary"
            size="md"
            className="w-full"
          />
        </div>
        <div className="pl-2 mb-6 text-gray-400 text-base justify-end flex w-full max-w-[510px]">
          {t('practice.wordsLearnedCount', {
            learned: dailyLearnedWords,
            goal: dayWords,
          })}
        </div>
      </div>

      {/* Если цель достигнута: поздравление */}
      {isGoalReached ? (
        <div className="flex flex-col items-center justify-center h-full w-full">
          <Card
            variant="flat"
            className="w-full max-w-md text-center p-8 rounded-[24px] shadow-0 bg-gradient-to-b from-purple-100 to-purple-200 dark:from-purple-700 dark:to-purple-800"
          >
            <div className="mb-6 text-6xl animate-bounce">
              {t('practice.dailyGoalReachedEmoji')}
            </div>
            <div className="mb-4 text-2xl font-extrabold text-purple-900 dark:text-purple-200">
              {t('practice.congratulationsTitle')}
            </div>
            <p className="text-purple-700 dark:text-purple-300 text-base">
              {t('practice.congratulationsText')}
            </p>
          </Card>
        </div>
      ) : (
        <>
          {/* Если нет слов вообще и мы не грузимся */}
          {!loading && isListEmpty && dailyLearnedWords <= 0 && (
            <div className="flex flex-col items-center justify-center h-full w-full ">
              <Card
                variant="flat"
                className="w-full max-w-md text-center p-8 rounded-[24px] shadow-0 bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800"
              >
                <div className="mb-6 text-6xl">{t('practice.noWordsEmoji')}</div>
                <div className="mb-4 text-2xl font-extrabold text-gray-900 dark:text-gray-200">
                  {t('practice.noWordsTitle')}
                </div>
                <p className="text-gray-700 dark:text-gray-300 text-base">
                  {t('practice.noWordsText')}
                </p>
                <Button
                  color="primary"
                  size="lg"
                  className="mt-6"
                  onPress={fetchUnmasteredWords}
                >
                  {t('practice.refreshList')}
                </Button>
              </Card>
            </div>
          )}

          {/* Если есть текущее слово */}
          {dayWords > 0 && currentWord && (
            <div className="flex flex-col items-center h-full w-full overflow-hidden  mx-auto ">
              <div
                className={`
                  flex flex-col w-full items-center
                  transition-transform duration-300 ease-in-out
                  ${
                    moveDirection === 'right'
                      ? 'translate-x-40'
                      : moveDirection === 'left'
                      ? '-translate-x-40'
                      : ''
                  }
                `}
              >
                <Flashcard
                  // @ts-ignore
                  word={currentWord}
                  onMark={handleMark}
                  currentIndex={currentIndex}
                />
              </div>

              <div className="flex justify-between mt-5 w-full max-w-md space-x-4">
                <Button
                  color="danger"
                  size="lg"
                  className="w-full flex items-center justify-center gap-2 rounded-[14px] shadow-lg bg-[#DA4141] hover:bg-red-500 text-white font-[500]"
                  onPress={() => handleMark(false)}
                >
                  <IconBook size={20} stroke={1.5} className="text-white" />
                  {t('practice.stillLearning')}
                </Button>
                <Button
                  color="success"
                  size="lg"
                  className="w-full flex items-center justify-center gap-2 rounded-[14px] shadow-lg bg-[#39B14C] hover:bg-green-500 text-white font-[500]"
                  onPress={() => handleMark(true)}
                >
                  <IconCheck size={20} stroke={1.5} className="text-white" />
                  {t('practice.iKnow')}
                </Button>
              </div>

              <div className="flex justify-center mt-5">
                <Button
                  isIconOnly
                  size="lg"
                  color="warning"
                  onPress={handleRepeat}
                  aria-label={t('practice.repeat') as string}
                >
                  <IconRepeat size={24} />
                </Button>
              </div>
            </div>
          )}

          {/* Если все карточки закончились, но есть выученные слова */}
          {!loading && isListEmpty && dailyLearnedWords > 0 && (
            <div className="flex flex-col items-center justify-center h-full w-full">
              <Card
                variant="flat"
                className="w-full max-w-md text-center p-8 rounded-[24px] bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800"
              >
                <div className="mb-6 text-6xl">{t('practice.noCardsLeftEmoji')}</div>
                <div className="mb-4 text-2xl font-extrabold text-gray-900 dark:text-gray-200">
                  {t('practice.cardsFinishedTitle')}
                </div>
                <p className="text-gray-700 dark:text-gray-300 text-base">
                  {t('practice.cardsFinishedText')}
                </p>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
}
