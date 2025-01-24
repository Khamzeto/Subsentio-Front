'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import SubtitleDetails from '@/components/SubtitleDetails/SubtitleDetails';
import $api from '@/config/api/api';
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Tooltip,
} from '@nextui-org/react';
import { Button } from '@nextui-org/button';
import {
  IconCheck,
  IconHeart,
  IconEye,
  IconEyeOff,
  IconMenuDeep,
  IconVolume2,
} from '@tabler/icons-react';
import useProfileStore from '../store/useProfileStore';

type Word = {
  _id: string;
  word: string;
  ipa_pronunciations: string[];
  translations: {
    english: string;
    russian: string;
    gender: string;
  }[];
  learned: boolean;
  t: string;
  // Если нужно сортировать по дате на клиенте, убедитесь,
  // что здесь есть что-то вроде:
  // createdAt: string;
};

const partOfSpeechMap: Record<string, string> = {
  Noun: 'n',
  Verb: 'v',
  Adjective: 'adj',
  Adverb: 'adv',
  Pronoun: 'pron',
  Preposition: 'prep',
  Conjunction: 'conj',
  Interjection: 'intj',
  Determiner: 'det',
  Numeral: 'num',
  Particle: 'part',
  Auxiliary: 'aux',
  Modal: 'mod',
  Gerund: 'ger',
  Infinitive: 'inf',
  'Present Participle': 'pres. part',
};

export default function WordsList({ initialLang }: { initialLang: string }) {
  const { t, i18n } = useTranslation(); // берем переводы из common.json
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const subtitleDetailsRef = useRef<HTMLDivElement | null>(null);
  const { profile } = useProfileStore();
  // Стейты для фильтра и сортировки
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<string>('date_desc');
  const [sortLabel, setSortLabel] = useState<string>(t('wordsList.sortByDateDesc'));

  // Скрыть/показать переводы
  const [hiddenTranslations, setHiddenTranslations] = useState<boolean>(false);

  // Для отображения иконки при проигрывании аудио
  const [playingWordId, setPlayingWordId] = useState<string | null>(null);

  // При первом рендере выставляем язык
  useEffect(() => {
    if (i18n.language !== initialLang) {
      i18n.changeLanguage(initialLang);
    }
  }, [initialLang, i18n]);

  /**
   * Загрузка слов с бэкенда
   *
   * Вариант 1: Если ваш бэкенд поддерживает сортировку, просто передаёте `sort` в запрос:
   */
  const fetchWords = async (filter: string, sort: string) => {
    setLoading(true);
    setError(null);

    try {
      // Пример: передаём и фильтр, и сортировку в GET-запрос
      const response = await $api.get(`/words?filter=${filter}&sort=${sort}`);
      setWords(response.data.words);
    } catch (err: any) {
      setError(t('wordsList.loadingError'));
    } finally {
      setLoading(false);
    }
  };

  // Подгружаем слова при изменении фильтра или сортировки
  useEffect(() => {
    fetchWords(activeFilter, sortOrder);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFilter, sortOrder]);

  // Обработчик нажатия кнопки аудио
  const handleAudioPlay = (word: string, sourceLanguage: string, wordId: string) => {
    const voiceMap: Record<string, string> = {
      ru: 'Alyona22k',
      es: 'Maria22k',
      de: 'Klaus22k',
      fr: 'Bruno22k',
      tr: 'Ipek22k',
      ar: 'Mehdi22k',
      en: 'Heather22k',
    };

    const voiceName = voiceMap[sourceLanguage] || 'Heather22k';

    // Кодируем текст в Base64 с учетом UTF-8
    const encodeToBase64 = str => {
      return btoa(unescape(encodeURIComponent(str)));
    };

    const encodedWord = encodeToBase64(word);

    const audio = new Audio(
      `https://voice.reverso.net/RestPronunciation.svc/v1/output=json/GetVoiceStream/voiceName=${voiceName}?voiceSpeed=80&inputText=${encodeURIComponent(
        encodedWord
      )}`
    );

    setPlayingWordId(wordId);
    audio.play();

    audio.addEventListener('ended', () => {
      setPlayingWordId(null);
    });

    audio.addEventListener('error', () => {
      setPlayingWordId(null);
      console.error('Audio playback error');
    });
  };

  // Смена фильтра
  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    fetchWords(filter, sortOrder);
  };

  // Смена сортировки
  const handleSortChange = (sort: string, label: string) => {
    setSortOrder(sort);
    setSortLabel(label);
    fetchWords(activeFilter, sort);
  };

  // Удаление слова
  const deleteWord = async (id: string) => {
    try {
      await $api.delete(`/words/${id}`);
      setWords(prevWords => prevWords.filter(word => word._id !== id));
    } catch (err: any) {
      console.error(
        t('wordsList.deleteError'),
        err.response?.data?.message || err.message
      );
    }
  };

  // Изменение статуса “выучено”
  const toggleLearnedStatus = async (id: string, currentStatus: boolean) => {
    try {
      const response = await $api.patch(`/words/${id}/learned`, {
        learned: !currentStatus,
      });
      const updatedWord = response.data.word;

      setWords(prevWords =>
        prevWords.map(word => (word._id === id ? updatedWord : word))
      );
    } catch (err: any) {
      console.error(
        t('wordsList.updateError'),
        err.response?.data?.message || err.message
      );
    }
  };

  // Закрыть детальное окошко при клике вне него
  const handleOutsideClick = (event: MouseEvent) => {
    if (
      subtitleDetailsRef.current &&
      !subtitleDetailsRef.current.contains(event.target as Node)
    ) {
      setSelectedWord(null);
    }
  };

  useEffect(() => {
    if (selectedWord) {
      document.addEventListener('mousedown', handleOutsideClick);
    } else {
      document.removeEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [selectedWord]);

  // Скрывать/показывать переводы
  const toggleTranslationsVisibility = () => {
    setHiddenTranslations(!hiddenTranslations);
  };

  return (
    <>
      <div className="p-5 max-w-[1400px] dark:bg-[#121212]">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">{t('wordsList.title')}</h1>
        </div>

        {/* Фильтры и сортировка */}
        <div
          className="
            mb-4
            flex flex-col items-start gap-3
            md:flex-row md:items-center md:gap-4 md:justify-between md:flex-nowrap
          "
        >
          {/* Блок фильтров */}
          <div className="flex flex-wrap gap-3 w-full md:max-w-[calc(100%-200px)] mb-6">
            <Button
              variant="bordered"
              size="sm"
              className={activeFilter === 'all' ? 'text-blue-500 border-blue-500' : ''}
              onPress={() => handleFilterChange('all')}
            >
              {t('wordsList.all')}
            </Button>
            <Button
              variant="bordered"
              size="sm"
              className={
                activeFilter === 'unlearned' ? 'text-blue-500 border-blue-500' : ''
              }
              onPress={() => handleFilterChange('unlearned')}
            >
              {t('wordsList.unlearned')}
            </Button>
            <Button
              variant="bordered"
              size="sm"
              className={
                activeFilter === 'learning' ? 'text-blue-500 border-blue-500' : ''
              }
              onPress={() => handleFilterChange('learning')}
            >
              {t('wordsList.learning')}
            </Button>
            <Button
              variant="bordered"
              size="sm"
              className={
                activeFilter === 'learned' ? 'text-blue-500 border-blue-500' : ''
              }
              onPress={() => handleFilterChange('learned')}
            >
              {t('wordsList.learned')}
            </Button>
          </div>

          {/* Кнопки “Скрыть переводы” и “Сортировка” */}
          <div className="flex justify-end items-start gap-2 mt-[-20px] w-[100%]">
            <Button
              variant="bordered"
              isIconOnly
              onPress={toggleTranslationsVisibility}
              startContent={
                hiddenTranslations ? <IconEyeOff size={20} /> : <IconEye size={20} />
              }
              className="w-10 h-10 p-0 flex items-center justify-center"
            />

            <Dropdown>
              <DropdownTrigger>
                <Button className="w-full md:w-auto md:mt-0">{sortLabel}</Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Sorting"
                onAction={key => {
                  switch (key) {
                    case 'date_desc':
                      handleSortChange('date_desc', t('wordsList.sortByDateDesc'));
                      break;
                    case 'date_asc':
                      handleSortChange('date_asc', t('wordsList.sortByDateAsc'));
                      break;
                    case 'alphabetical_asc':
                      handleSortChange(
                        'alphabetical_asc',
                        t('wordsList.sortByAlphabetAsc')
                      );
                      break;
                    case 'alphabetical_desc':
                      handleSortChange(
                        'alphabetical_desc',
                        t('wordsList.sortByAlphabetDesc')
                      );
                      break;
                  }
                }}
              >
                <DropdownItem key="date_desc">
                  {t('wordsList.sortByDateDesc')}
                </DropdownItem>
                <DropdownItem key="date_asc">{t('wordsList.sortByDateAsc')}</DropdownItem>
                <DropdownItem key="alphabetical_asc">
                  {t('wordsList.sortByAlphabetAsc')}
                </DropdownItem>
                <DropdownItem key="alphabetical_desc">
                  {t('wordsList.sortByAlphabetDesc')}
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>

        {/* Сколько всего слов */}
        <p className="mb-4 text-gray-400 text-base">
          {t('wordsList.wordsCount', { count: words.length })}
        </p>

        {/* Ошибка при загрузке */}
        {error && <p className="text-red-500 font-semibold mb-4">{error}</p>}

        {/* Список слов */}
        <div className="flex flex-col gap-0">
          {words.map(word => (
            <div
              key={word._id}
              className="
                w-full py-3 px-4 border-b border-default relative
                flex flex-col items-start hover:bg-default-100
                md:flex-row md:items-center
              "
            >
              {/* Левая часть: само слово + кнопка аудио */}
              <div className="md:flex-[2] w-[100%]">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-base text-foreground">{word.word}</p>
                  <button
                    className="p-1 rounded hover:bg-gray-200 z-[2] relative dark:hover:bg-gray-700"
                    aria-label="Play pronunciation"
                    onClick={() =>
                      handleAudioPlay(word.word, (word as any).sourceLanguage, word._id)
                    }
                  >
                    <IconVolume2
                      size={20}
                      strokeWidth={2}
                      color={playingWordId === word._id ? '#facc15' : 'currentColor'}
                    />
                  </button>
                </div>
                <p className="text-sm text-default-500">
                  {word.ipa_pronunciations[0] || '—'}
                </p>
              </div>

              {/* Средняя часть: переводы */}
              <div className="flex gap-1 w-full md:mt-0 mt-3 justify-start items-start relative flex-wrap md:left-[0px] max-w-[50%] md:mt-0 text-left">
                <div
                  className={`text-sm transition-all duration-300 flex gap-1 flex-wrap items-start ${
                    hiddenTranslations
                      ? 'bg-[#E0E0E0] p-2 rounded-[4px] dark:bg-[#222222] text-transparent hover:text-default-800 hover:bg-transparent'
                      : 'text-default-800'
                  }`}
                  onMouseEnter={e => {
                    if (hiddenTranslations) {
                      e.currentTarget.classList.remove(
                        'text-transparent',
                        'dark:bg-[#222222]'
                      );
                      e.currentTarget.classList.add('text-default-800', 'bg-transparent');
                    }
                  }}
                  onMouseLeave={e => {
                    if (hiddenTranslations) {
                      e.currentTarget.classList.add(
                        'text-transparent',
                        'dark:bg-[#222222]'
                      );
                      e.currentTarget.classList.remove(
                        'text-default-800',
                        'bg-transparent'
                      );
                    }
                  }}
                >
                  {word.translations.map((translation, index) => (
                    <span key={index}>
                      {/* Преобразуем gender, если указана часть речи */}
                      <span className="font-bold">
                        {translation.gender
                          ? translation.gender
                              .split('/')
                              .map(part => {
                                const trimmedPart = part.trim();
                                if (trimmedPart.startsWith('Noun')) {
                                  return 'n';
                                }
                                if (trimmedPart.startsWith('Adjective')) {
                                  return 'adj';
                                }
                                return partOfSpeechMap[trimmedPart] || trimmedPart;
                              })
                              .join(' / ') + ': '
                          : ''}
                      </span>
                      <span>{translation.russian || t('wordsList.noTranslation')}</span>
                      {index < word.translations.length - 1 && <span>, </span>}
                    </span>
                  ))}
                </div>
              </div>

              {/* Правая часть: кнопки действий (learned/delete/details) */}
              <div
                className="
                  md:flex-[2]
                  flex justify-end w-full md:items-center 
                  md:justify-end max-md:absolute max-md:top-[12px] max-md:left-[-12px] max-md:w-[100%]
                "
              >
                <div className="flex items-center gap-2 md:gap-1">
                  {/* Кнопка “выучено” */}
                  <Tooltip
                    content={
                      word.learned
                        ? t('wordsList.markUnlearned')
                        : t('wordsList.markLearned')
                    }
                    placement="top"
                    color={word.learned ? 'success' : 'default'}
                  >
                    <Button
                      isIconOnly
                      variant="light"
                      size="sm"
                      className={word.learned ? 'text-green-500' : 'text-current'}
                      onPress={() => toggleLearnedStatus(word._id, word.learned)}
                    >
                      <IconCheck size={20} strokeWidth={2} />
                    </Button>
                  </Tooltip>

                  {/* Кнопка “Удалить” */}
                  <Tooltip content={t('wordsList.delete')} placement="top" color="error">
                    <Button
                      isIconOnly
                      variant="light"
                      size="sm"
                      className="text-red-500"
                      onPress={() => deleteWord(word._id)}
                    >
                      <IconHeart
                        size={20}
                        strokeWidth={2}
                        fill="#FF6B6B"
                        color="#FF6B6B"
                      />
                    </Button>
                  </Tooltip>

                  {/* Кнопка “Детали слова” */}
                  <Tooltip content={t('wordsList.details')} placement="top">
                    <Button
                      isIconOnly
                      variant="light"
                      size="sm"
                      className="text-current"
                      onPress={() => setSelectedWord(word)}
                    >
                      <IconMenuDeep size={20} strokeWidth={2} />
                    </Button>
                  </Tooltip>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Подробные детали (по клику “Детали слова”) */}
      {selectedWord && (
        <div ref={subtitleDetailsRef}>
          <SubtitleDetails
            word={selectedWord.word}
            wordFull={selectedWord}
            setSelectedWord={setSelectedWord}
            setWords={setWords}
            translation={selectedWord.translations}
            onClose={() => setSelectedWord(null)}
            targetLang={profile.learningLanguage}
            sourceLang={profile.nativeLanguage}
            initialLang={initialLang}
            accessToken="your-access-token"
            profile={profile}
            t={t}
          />
        </div>
      )}
    </>
  );
}
