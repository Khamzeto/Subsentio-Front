'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@nextui-org/react';
import { motion } from 'framer-motion';
import { IconVolume2 } from '@tabler/icons-react';

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

type Translation = {
  english: string;
  russian: string;
  gender: string;
};

type FlashcardProps = {
  word: {
    _id: string;
    word: string;
    transcription: string;
    partOfSpeech: string;
    translation: string;
    ipa_pronunciations?: string[];
    sourceLanguage: string;
    translations?: Translation[];
  };
  onMark: (known: boolean) => void;
};

const Flashcard: React.FC<FlashcardProps> = ({ word, onMark }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Сбрасываем состояние переворота, если карточка заново отображается
  useEffect(() => {
    setIsFlipped(false);
  }, [word._id]);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleAudioPlay = (event: React.MouseEvent) => {
    event.stopPropagation(); // Предотвращаем переворачивание карточки

    const voiceMap: Record<string, string> = {
      ru: 'Alyona22k',
      en: 'Heather22k',
      fr: 'Bruno22k',
      es: 'Maria22k',
      de: 'Klaus22k',
      tr: 'Ipek22k',
      ar: 'Mehdi22k',
    };

    const voiceName = voiceMap[word.sourceLanguage] || 'Heather22k';
    const encodedWord = btoa(word.word);
    const audio = new Audio(
      `https://voice.reverso.net/RestPronunciation.svc/v1/output=json/GetVoiceStream/voiceName=${voiceName}?voiceSpeed=80&inputText=${encodeURIComponent(
        encodedWord
      )}`
    );
    setIsPlaying(true);

    audio.play();

    audio.addEventListener('ended', () => {
      setIsPlaying(false);
    });

    audio.addEventListener('error', () => {
      console.error('Ошибка воспроизведения аудио');
      setIsPlaying(false);
    });
  };

  return (
    <motion.div
      onClick={handleFlip}
      className="relative w-full max-w-[540px] h-96 cursor-pointer"
      style={{ perspective: '1000px' }}
    >
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6 }}
        className="w-full h-full relative"
        style={{
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Front Side */}
        <div
          className="absolute pt-2 w-full h-full flex items-center justify-center"
          style={{
            backfaceVisibility: 'hidden',
          }}
        >
          <Card className="w-full  h-full dark:bg-[#222222] rounded-[30px] flex items-center justify-center">
            <div className="text-center">
              <div className="flex gap-2 justify-center w-full items-center">
                <p className="text-3xl text-center font-bold text-black dark:text-white">
                  {word?.word}
                </p>
                <button
                  className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                  aria-label="Play pronunciation"
                  onClick={handleAudioPlay}
                >
                  <IconVolume2
                    size={24}
                    strokeWidth={2}
                    className={isPlaying ? 'text-yellow-500' : 'text-gray-600'}
                  />
                </button>
              </div>
              <p className="text-xl text-gray-500 dark:text-gray-400 mt-2">
                {word?.transcription}
              </p>
              {word?.ipa_pronunciations && word.ipa_pronunciations.length > 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  {word?.ipa_pronunciations.join(', ')}
                </p>
              )}
            </div>
          </Card>
        </div>

        {/* Back Side */}
        <div
          className="absolute w-full h-full flex items-center justify-center"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <Card className="w-full dark:bg-[#222222] rounded-[30px] h-full flex flex-col items-center justify-center shadow-lg">
            <div className="text-center w-[90%]">
              {word?.translations?.map((translation, index) => (
                <span key={index}>
                  <span className="font-bold">
                    {translation?.gender
                      ? translation?.gender
                          .split('/')
                          .map(part => {
                            const trimmedPart = part.trim();
                            if (trimmedPart.startsWith('Noun')) {
                              return 'n';
                            }
                            if (trimmedPart.startsWith('Adjective')) {
                              return 'adj';
                            }
                            return partOfSpeechMap[trimmedPart] || '';
                          })
                          .join(' / ') + ': '
                      : ''}
                  </span>
                  <span>{translation.russian || 'Нет перевода'}</span>
                  {index < word.translations.length - 1 && <span>, </span>}
                </span>
              ))}
            </div>
          </Card>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Flashcard;
