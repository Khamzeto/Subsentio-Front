import Dashboard from '@/components/dashboard/Dashboard';
import { cookies } from 'next/headers'; // Импорт функции cookies

export default function HomePage() {
  const lang = cookies().get('lang')?.value || 'en'; // Получаем язык из куки на сервере

  return <Dashboard initialLang={lang} />;
}
