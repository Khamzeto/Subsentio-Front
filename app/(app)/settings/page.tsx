import Dashboard from '@/components/dashboard/Dashboard';
import Profile from '@/components/profile/Profile';
import EditProfilePage from '@/components/settings/Settings';
import { cookies } from 'next/headers'; // Импорт функции cookies

export default function SettingsPage() {
  const lang = cookies().get('lang')?.value || 'en'; // Получаем язык из куки на сервере
  // @ts-ignore
  return <EditProfilePage initialLang={lang} key={lang} />;
}
