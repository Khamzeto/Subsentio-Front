import WordsList from '@/components/vocabulary/Vocabulary';
import { cookies } from 'next/headers'; // Импорт функции cookies

export default function HomePage() {
  const lang = cookies().get('lang')?.value || 'en'; // Получаем язык из куки на сервере
  // @ts-ignore
  return <WordsList initialLang={lang} />;
}
