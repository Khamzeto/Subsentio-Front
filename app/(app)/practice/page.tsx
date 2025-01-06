import Practice from '@/components/practice/Practice';
import { cookies } from 'next/headers'; // Импорт функции cookies

export default function HomePage() {
  const lang = cookies().get('lang')?.value || 'en'; // Получаем язык из куки на сервере
  // @ts-ignore
  return <Practice initialLang={lang} key={lang} />;
}
