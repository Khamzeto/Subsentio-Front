// app/page.tsx (Server Component)
import { cookies } from 'next/headers';
import WordsList from '@/components/vocabulary/Vocabulary';
import fs from 'fs';
import path from 'path';

// Функция для генерации метаданных
export async function generateMetadata() {
  const lang = cookies().get('lang')?.value || 'en'; // Получаем язык из куков

  // Путь к файлу перевода
  const translationsPath = path.join(
    process.cwd(),
    'public',
    'locales',
    lang,
    'common.json'
  );

  // Загружаем переводы
  let translations;
  try {
    const fileContents = fs.readFileSync(translationsPath, 'utf8');
    translations = JSON.parse(fileContents);
  } catch (error) {
    console.error(`Ошибка загрузки перевода для языка ${lang}:`, error);
    translations = { vocabulary: { title: 'Vocabulary' } }; // Значение по умолчанию
  }

  return {
    title: `📚${translations.dashboard?.dictionary || 'Vocabulary'}`, // Динамический заголовок с переводом и смайликом
  };
}

export default async function HomePage() {
  // Получаем язык и токен из куков
  const lang = cookies().get('lang')?.value || 'en';
  const authStorage = cookies().get('auth-storage')?.value;

  let accessToken = null;

  // Если кука с токенами существует, парсим её
  if (authStorage) {
    try {
      const parsedStorage = JSON.parse(authStorage);
      accessToken = parsedStorage.accessToken;
    } catch (err) {
      console.error('Ошибка при парсинге куки auth-storage:', err);
    }
  }

  // Возвращаем клиентский компонент (WordsList) и передаём ему пропы
  return <WordsList initialLang={lang} />;
}
