import Dashboard from '@/components/dashboard/Dashboard';
import Profile from '@/components/profile/Profile';
import { cookies } from 'next/headers'; // Импорт функции cookies

export default function ProfilePage() {
  const lang = cookies().get('lang')?.value || 'en'; // Получаем язык из куки на сервере
  // @ts-ignore
  return <Profile initialLang={lang} key={lang} />;
}
