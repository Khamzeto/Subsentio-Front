import Profile from '@/components/profile/Profile';
import { cookies } from 'next/headers';
import fs from 'fs';
import path from 'path';
import SignIn from '@/components/auth/login';
import SignUp from '@/components/auth/register';

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
    translations = { profile: { title: 'Sign up | Subsentio' } }; // Значение по умолчанию
  }

  return {
    title: `${`${translations.signIn.signup} | Subsentio` || 'Sign up'}`, // Динамический заголовок с переводом и смайликом
  };
}

export default function ProfilePage() {
  return (
    <>
      {/* @ts-ignore */}
      <SignUp />
    </>
  );
}
