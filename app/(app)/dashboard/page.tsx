import Dashboard from '@/components/dashboard/Dashboard';
import { cookies } from 'next/headers';
import fs from 'fs';
import path from 'path';

// Функция для генерации метаданных
export async function generateMetadata() {
  const lang = cookies().get('lang')?.value || 'en'; // Получаем язык из куки

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
    translations = { dashboard: { title: 'Dashboard' } }; // Значение по умолчанию
  }

  return {
    title: `🧑‍💻${translations.dashboard?.mainPanel || 'Dashboard'}`, // Динамический заголовок с переводом и смайликом
  };
}

export default function HomePage() {
  const lang = cookies().get('lang')?.value || 'en'; // Получаем язык из куки на сервере

  return (
    <>
      <Dashboard initialLang={lang} key={lang} />
    </>
  );
}
