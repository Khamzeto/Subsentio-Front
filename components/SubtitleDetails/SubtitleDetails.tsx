import React, { useEffect, useState } from 'react';
import './SubtitleDetails.css'; // Подключаем CSS
import $api from '@/config/api/api';
import { IconCheck } from '@tabler/icons-react';
import { Button, Tooltip } from '@nextui-org/react';
import { useTranslation } from 'react-i18next';

type Translation = {
  english: string;
  russian: string;
  gender: string;
};

type WordFull = {
  _id: string;
  word: string;
  learned: boolean;
  // добавьте сюда другие поля, если нужно
};

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
};

type SubtitleDetailsProps = {
  word: string;
  translation: Translation[];
  onClose: () => void;
  targetLang: string;
  sourceLang: string;
  accessToken: string;
  wordFull: WordFull;
  setWords: React.Dispatch<React.SetStateAction<Word[]>>;
  setSelectedWord: React.Dispatch<React.SetStateAction<Word | null>>;
  initialLang: string;
  profile: string;
  t: string;
};

const SubtitleDetails: React.FC<SubtitleDetailsProps> = ({
  word,
  translation,
  onClose,
  targetLang,
  sourceLang,
  accessToken,
  wordFull,
  setWords,
  setSelectedWord,
  initialLang,
  profile,
  t,
}) => {
  const [translationData, setTranslationData] = useState<any>(null);
  const [examplesData, setExamplesData] = useState<any>(null);
  const [synonymsData, setSynonymsData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'examples' | 'synonyms'>('examples');
  const [isPlaying, setIsPlaying] = useState(false);

  // Если язык из пропсов не совпадает с i18n.language, переключаем.

  const handleAudioPlay = () => {
    const voiceMap = {
      ru: 'Alyona22k', // Русский
      es: 'Maria22k', // Испанский
      de: 'Klaus22k', // Немецкий
      fr: 'Bruno22k', // Французский
      tr: 'Ipek22k', // Турецкий
      ar: 'Mehdi22k', // Арабский
      en: 'Heather22k', // Английский по умолчанию
    };

    // Определяем голос, соответствующий языку, или используем английский по умолчанию
    const voiceName = voiceMap[wordFull?.sourceLanguage] || 'Heather22k';

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

    setIsPlaying(true);

    audio.play();

    audio.addEventListener('ended', () => {
      setIsPlaying(false); // Сбрасываем состояние после завершения воспроизведения
    });

    audio.addEventListener('error', () => {
      setIsPlaying(false); // Сбрасываем состояние при ошибке воспроизведения
      console.error('Ошибка воспроизведения аудио');
    });
  };

  // Загружаем перевод
  useEffect(() => {
    if (!word || !sourceLang || !targetLang) return;
    console.log(wordFull, 'слово');
    const fetchTranslation = async (theWord, src, tgt) => {
      try {
        const apiUrl = `https://translate.googleapis.com/translate_a/single?dt=t&dt=bd&dt=qc&dt=rm&dt=ex&client=gtx&sl=${
          wordFull?.sourceLanguage
        }&tl=${wordFull?.targetLanguage}&q=${encodeURIComponent(
          theWord
        )}&dj=1&tk=767422.767422`;

        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Accept-Language': 'en', // Запрашиваем ответ на английском
          },
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        if (!data.sentences && !data.dict) {
          throw new Error('No translation data found');
        }

        // Массив переводов
        let translationsArray = [];
        // Массив транскрипций (IPA)
        let ipa_pronunciations = [];

        // 1) Если есть словарь (dict), собираем оттуда переводы
        if (Array.isArray(data.dict) && data.dict.length > 0) {
          data.dict.forEach(dictItem => {
            if (Array.isArray(dictItem.entry)) {
              dictItem.entry.forEach(entry => {
                translationsArray.push({
                  russian: entry.word,
                  english:
                    Array.isArray(entry.reverse_translation) &&
                    entry.reverse_translation.length > 0
                      ? entry.reverse_translation[0]
                      : theWord,
                  // Преобразуем pos (adjective → Adjective, noun → Noun, ...)
                  gender: dictItem.pos
                    ? dictItem.pos.charAt(0).toUpperCase() + dictItem.pos.slice(1)
                    : '',
                });
              });
            }
          });
        }

        // 2) Если словарь пуст, используем sentences
        if (translationsArray.length === 0 && Array.isArray(data.sentences)) {
          const firstSentence = data.sentences[0] || {};
          translationsArray.push({
            russian: firstSentence.trans || '',
            english: firstSentence.orig || theWord,
            gender: '',
          });
        }

        // 3) Ограничиваем максимум до 6 переводов
        translationsArray = translationsArray.slice(0, 6);

        // 4) Забираем транскрипцию из data.sentences[1].src_translit, если есть
        if (data.sentences && data.sentences[1] && data.sentences[1].src_translit) {
          ipa_pronunciations.push(data.sentences[1].src_translit);
        }

        // Формируем итоговый объект
        const finalResult = {
          word: theWord,

          translations: translationsArray,
          ipa_pronunciations,
        };

        // Устанавливаем данные в State или возвращаем
        setTranslationData(finalResult);
      } catch (error) {
        console.error('Error fetching translation:', error.message);

        // При ошибке возвращаем предсказуемую структуру
        const errorResult = {
          word: theWord,
          translation: {
            word: theWord,
            translations: [
              {
                russian: 'Ошибка перевода',
                english: 'Translation error',
                gender: '',
              },
            ],
            ipa_pronunciations: [],
          },
          error: true,
          message: 'Translation not found',
        };

        setTranslationData(errorResult);
      }
    };

    fetchTranslation(word, sourceLang, targetLang);
  }, [word, sourceLang, targetLang, t]);

  const toggleLearnedStatus = async (id: string, currentStatus: boolean) => {
    try {
      const response = await $api.patch(`/words/${id}/learned`, {
        learned: !currentStatus,
      });
      const updatedWord = response.data.word;

      // Обновляем список слов
      setWords(prevWords => prevWords.map(w => (w._id === id ? updatedWord : w)));

      // Обновляем выбранное слово
      setSelectedWord(updatedWord);
    } catch (err: any) {
      console.error('Ошибка при обновлении статуса слова:', err.message);
    }
  };

  // Скачиваем синонимы (активная вкладка "synonyms")
  useEffect(() => {
    if (activeTab !== 'synonyms' || !word) return;

    const fetchSynonyms = async () => {
      try {
        const response = await fetch('https://translate.subsentio.online/synonyms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ word, source_lang: wordFull?.targetLanguage }),
        });

        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        setSynonymsData(data.synonyms);
      } catch (error) {
        console.error('Error fetching synonyms:', error);
        setSynonymsData(null);
      }
    };

    fetchSynonyms();
  }, [activeTab, word, sourceLang]);

  // Скачиваем примеры (активная вкладка "examples")
  useEffect(() => {
    if (activeTab !== 'examples' || !word) return;

    const fetchExamples = async () => {
      try {
        const response = await fetch(
          'https://translate.subsentio.online/translate/examples',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              word,
              source_lang: wordFull?.targetLanguage,
              target_lang: wordFull?.sourceLanguage,
            }),
          }
        );

        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        setExamplesData(data.examples);
      } catch (error) {
        console.error('Error fetching examples:', error);
        setExamplesData(null);
      }
    };

    fetchExamples();
  }, [activeTab, word, sourceLang, targetLang]);

  const highlightWord = (text: string, w: string) => {
    // Экранируем спец.символы
    const escapedWord = w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedWord})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) =>
      part.toLowerCase() === w.toLowerCase() ? (
        <span key={index} className="highlight">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'synonyms':
        return (
          <div className="subtitle-synonyms">
            {synonymsData ? (
              synonymsData.map((synonym: string, index: number) => (
                <div className="synonym-item" key={index}>
                  {synonym}
                </div>
              ))
            ) : (
              <div className="loading-text">{t('subtitleDetails.loading')}</div>
            )}
          </div>
        );

      case 'examples':
        return (
          <div className="subtitle-examples">
            {examplesData ? (
              examplesData.map((example: any, index: number) => (
                <div className="example-item" key={index}>
                  <p className="example-source">
                    {highlightWord(example.source_example, word)}
                  </p>
                  <p className="example-target">{example.target_example}</p>
                </div>
              ))
            ) : (
              <div className="loading-text">{t('subtitleDetails.loading')}</div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const handleBackIconClick = () => {
    onClose();
  };

  return (
    <div className="subtitle-details-container">
      <div className="global-header">
        <div className="icon-back" onClick={handleBackIconClick}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="24"
            viewBox="0 -960 960 960"
            width="24"
            fill="rgba(255, 255, 255, 0.4)"
          >
            <path d="M480-424 284-228q-11 11-28 11t-28-11q-11-11-11-28t11-28l196-196-196-196q-11-11-11-28t11-28q11-11 28-11t28 11l196 196 196-196q11-11 28-11t28 11q11 11 11 28t-11 28L536-480l196 196q11 11 11 28t-11 28q-11 11-28 11t-28-11L480-424Z"></path>
          </svg>
        </div>
        <div className="global-header-content">
          <div>
            <h1 className="global-header_title">{t('subtitleDetails.title')}</h1>
          </div>
          {profile?.plan === 'free' && (
            <div className="premium-banner">
              <a className="btn-premium">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="27"
                  height="27"
                  viewBox="0 0 27 27"
                  fill="none"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M17.0097 5.14307L20.1932 9.38778L11.7038 19.9996L3.21436 9.38778L6.40744 5.14307H17.0097Z"
                    stroke="white"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M3.21436 9.38818H20.1932"
                    stroke="white"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M8.52002 9.38818L11.7036 20"
                    stroke="white"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M14.8874 9.38818L11.7039 20"
                    stroke="white"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M6.40771 5.14307L8.52052 9.38778L11.7041 5.14307L14.8876 9.38778L17.01 5.14307"
                    stroke="white"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>{t('subtitleDetails.upgradePremium')}</span>
              </a>
            </div>
          )}
        </div>
      </div>

      <div className="subtitle-header">
        <div className="subtitle-head-container">
          <div className="subtitle-head">
            <h2 className="word-title">{word}</h2>
            <button className="audio-button" onClick={handleAudioPlay}>
              <svg
                viewBox="0 0 24 24"
                fill={isPlaying ? 'rgb(240, 180, 0)' : 'rgba(255, 255, 255, 0.5)'}
              >
                <path d="M13 7.22049L9.60282 10H6V14H9.60282L13 16.7795V7.22049ZM8.88889 16H5C4.44772 16 4 15.5523 4 15V9.00001C4 8.44772 4.44772 8.00001 5 8.00001H8.88889L14.1834 3.66815C14.3971 3.49329 14.7121 3.52479 14.887 3.73851C14.9601 3.82784 15 3.93971 15 4.05513V19.9449C15 20.221 14.7761 20.4449 14.5 20.4449C14.3846 20.4449 14.2727 20.405 14.1834 20.3319L8.88889 16ZM18.8631 16.5911L17.4411 15.169C18.3892 14.4376 19 13.2901 19 12C19 10.5697 18.2493 9.31469 17.1203 8.6076L18.5589 7.169C20.0396 8.2616 21 10.0187 21 12C21 13.8422 20.1698 15.4904 18.8631 16.5911Z" />
              </svg>
            </button>
          </div>
          <button className="like-button">
            <Tooltip
              content={
                wordFull.learned
                  ? t('subtitleDetails.unlearnedMark')
                  : t('subtitleDetails.learnedMark')
              }
              placement="top"
              color={wordFull.learned ? 'success' : 'default'}
            >
              <Button
                isIconOnly
                variant="light"
                size="sm"
                className={wordFull?.learned ? 'text-green-500' : 'text-current'}
                onPress={() => toggleLearnedStatus(wordFull?._id, wordFull?.learned)}
              >
                <IconCheck size={20} strokeWidth={2} />
              </Button>
            </Tooltip>
          </button>
        </div>

        {/* IPA произношение (если доступно) */}
        {translationData?.ipa_pronunciations && translationData.ipa_pronunciations[0] && (
          <span className="pronunciation">{translationData.ipa_pronunciations[0]}</span>
        )}

        {/* Переводы (если есть) */}
        {translationData && (
          <div className="translations">
            {Array.isArray(translationData.translations) ? (
              Object.entries(
                translationData.translations.reduce((acc: any, trans: any) => {
                  const partOfSpeech = trans.gender ? trans.gender.split(' ')[0] : '';
                  if (!acc[partOfSpeech]) {
                    acc[partOfSpeech] = [];
                  }
                  acc[partOfSpeech].push(trans.russian);
                  return acc;
                }, {})
              ).map(([partOfSpeech, wordsArray]: [string, string[]], index) => {
                const posAbbreviations: Record<string, string> = {
                  Noun: 'n.',
                  Verb: 'v.',
                  Adjective: 'adj.',
                  Adverb: 'adv.',
                  Pronoun: 'pron.',
                  Preposition: 'prep.',
                  Conjunction: 'conj.',
                  Interjection: 'intj.',
                  Determiner: 'det.',
                  Numeral: 'num.',
                  Particle: 'part.',
                  Auxiliary: 'aux.',
                  Modal: 'mod.',
                  Gerund: 'ger.',
                  Infinitive: 'inf.',
                };

                const shortForm = posAbbreviations[partOfSpeech] || '';
                return (
                  <div className="translation-item" key={index}>
                    {shortForm && <span className="pos-tag">{shortForm}</span>}
                    <span className="translation-text">
                      {wordsArray.map((w, idx) => (
                        <span key={idx} className="word-item">
                          {w}
                          {idx < wordsArray.length - 1 && (
                            <span className="separator">;</span>
                          )}
                        </span>
                      ))}
                    </span>
                  </div>
                );
              })
            ) : translationData.error ? (
              <div className="error-message">{translationData.error}</div>
            ) : (
              <div className="error-message">
                {t('subtitleDetails.noTranslationsAvailable')}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'examples' ? 'active' : ''}`}
          onClick={() => setActiveTab('examples')}
        >
          {t('subtitleDetails.examplesTab')}
        </button>
        <button
          className={`tab ${activeTab === 'synonyms' ? 'active' : ''}`}
          onClick={() => setActiveTab('synonyms')}
        >
          {t('subtitleDetails.synonymsTab')}
        </button>
      </div>

      <div className="tab-content">{renderContent()}</div>
    </div>
  );
};

export default SubtitleDetails;
