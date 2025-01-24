'use client';
import React, { useState, useEffect } from 'react';
import { Button, Progress, Card, Spinner } from '@nextui-org/react';
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

  // --- Состояния ---
  const [wordsToPractice, setWordsToPractice] = useState<Word[]>([]);
  const [history, setHistory] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [dailyLearnedWords, setDailyLearnedWords] = useState<number>(0);
  const [moveDirection, setMoveDirection] = useState<'left' | 'right' | null>(null);
  const [isGoalReached, setIsGoalReached] = useState<boolean | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [dayWords, setDayWords] = useState<number>(0);

  // Вычисляем прогресс
  const progressPercentage = dayWords > 0 ? (dailyLearnedWords / dayWords) * 100 : 0;
  const isListEmpty = wordsToPractice.length === 0;

  // ----------------- При первом рендере -----------------
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        await fetchProfile(); // Загрузить профиль (dayWords)
        await fetchDailyStats(); // Загрузить статистику за день (learnedWords, history)
        await fetchUnmasteredWords();
        await checkDailyGoal(); // Проверить, достигнута ли цель
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    })();
  }, [fetchProfile]);

  // При смене языка (SSR / SSG, если нужно)
  useEffect(() => {
    if (i18n.language !== initialLang) {
      i18n.changeLanguage(initialLang);
    }
  }, [initialLang, i18n]);

  // Если профиль обновился
  useEffect(() => {
    if (profile?.dayWords) {
      setDayWords(profile.dayWords);
    }
  }, [profile]);

  // ----------------- Запросы -----------------
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

  const fetchUnmasteredWords = async () => {
    try {
      const response = await $api.get('/words?filter=unmastered');
      const newWords = response.data.words ?? [];
      setWordsToPractice(prev => [...prev, ...newWords]);
    } catch (error: any) {
      console.error('Не удалось загрузить слова:', error.response?.data?.message);
    }
  };

  const checkDailyGoal = async () => {
    try {
      const response = await $api.get('/word-stats/check-daily-goal');
      setIsGoalReached(response.data.isGoalReached);
    } catch (error: any) {
      console.error(
        'Не удалось проверить достижение цели:',
        error.response?.data?.message
      );
      setIsGoalReached(null);
    }
  };

  // ----------------- Локальная логика -----------------
  /** Текущее слово: либо из history (пока не дошли до конца), либо из wordsToPractice[0] */
  const getCurrentWord = (): Word | null => {
    if (currentIndex < history.length) {
      return history[currentIndex];
    }
    if (currentIndex === history.length && wordsToPractice.length > 0) {
      return wordsToPractice[0];
    }
    return null;
  };

  /** Когда появляется новое слово в wordsToPractice, добавим его в history (чтобы была кнопка Repeat) */
  useEffect(() => {
    const currentWord = getCurrentWord();
    if (currentWord && currentIndex === history.length) {
      const alreadyInHistory = history.some(w => w._id === currentWord._id);
      if (!alreadyInHistory) {
        setHistory(prev => [...prev, currentWord]);
      }
    }
  }, [currentIndex, history, wordsToPractice]);

  /** Повторить (шаг назад) */
  const handleRepeat = () => {
    if (currentIndex > 0) {
      setMoveDirection(null);
      setCurrentIndex(prev => prev - 1);
    }
  };

  /** Обработка нажатия «Знаю» / «Ещё изучаю» */
  const handleMark = async (known: boolean) => {
    const currentWord = getCurrentWord();
    if (!currentWord) return;

    setMoveDirection(known ? 'right' : 'left');

    try {
      if (known) {
        // Помечаем слово как изученное
        await $api.patch(`/words/${currentWord._id}/learned`, { learned: true });

        // Счётчик выученных слов + проверка целей
        try {
          await $api.put('/word-stats/update', { wordId: currentWord._id });
          setDailyLearnedWords(prevCount => {
            const newCount = prevCount + 1;
            // Если вдруг превысили цель
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

        // Переходим к следующему слову
        if (currentIndex < history.length) {
          setCurrentIndex(prev => prev + 1);
          // Убираем текущее слово из очереди
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
        // Помечаем как "ещё изучается"
        await $api.patch(`/words/${currentWord._id}/learning`, { learning: true });

        // Ставим слово в конец очереди
        setCurrentIndex(prev => prev + 1);
        setWordsToPractice(prevWords => {
          const nextWords = [...prevWords.slice(1), currentWord];
          // Индекс обновим после изменения массива
          setCurrentIndex(history.length);
          return nextWords;
        });
        setCurrentIndex(prev => prev + 1);

        // Добавляем в history (если ещё нет)
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
  };

  // ----------------- «Оптимистичная» смена цели -----------------
  /**
   * Когда из DailyGoalSelector приходит новый goal,
   * мы сразу (не дожидаясь ответа сервера) ставим dayWords.
   * Если уже выучили больше, чем новая цель — мгновенно показываем успех.
   */
  const handleSetGoal = (newGoal: number) => {
    // 1. Ставим новую цель в локальный стейт
    setDayWords(newGoal);

    // 2. Оптимистично определяем, достигнута ли цель прямо сейчас
    if (dailyLearnedWords >= newGoal) {
      setIsGoalReached(true);
    } else {
      setIsGoalReached(false);
    }
  };

  // ----------------- Рендер -----------------
  // Если идёт загрузка данных — показываем спиннер на весь экран
  if (loading) {
    return (
      <div className="flex items-center justify-center w-full h-[calc(100vh-80px)]">
        <Spinner />
      </div>
    );
  }

  const currentWord = getCurrentWord();

  return (
    <div className="flex flex-col h-full w-full dark:bg-[#121212] overflow-hidden p-6 mx-auto">
      {/* Шапка: заголовок и выбор дневной цели */}
      <div className="flex  flex-col lg:flex-row flex-start lg:justify-between  items-start gap-[20px] mb-8">
        <h1 className="text-3xl font-bold">{t('practice.title')}</h1>

        <DailyGoalSelector
          onSetGoal={handleSetGoal}
          fetchUnmasteredWords={async () => {
            // Эти вызовы идут «за кадром»,
            // если хотите пересвечивать UI загрузкой — добавьте setLoading(true)
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
          {/* Если нет слов вообще и при этом dailyLearnedWords = 0 */}
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
            <div className="flex flex-col items-center h-full w-full overflow-hidden mx-auto">
              <div
                className={`
                  flex flex-col w-full items-center
                  transition-transform duration-200 ease-in-out
                  ${moveDirection === 'left' ? 'translate-x-[-10px]' : ''} 
                  ${moveDirection === 'right' ? 'translate-x-[10px]' : ''}
                `}
              >
                <Flashcard
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

          {/* Если все карточки закончились, но есть выученные слова (dailyLearnedWords > 0) */}
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
