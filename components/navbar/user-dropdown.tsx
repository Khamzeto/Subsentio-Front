import {
  Avatar,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Navbar,
  NavbarItem,
} from '@nextui-org/react';
import { useTheme as useNextTheme } from 'next-themes';
import React, { useCallback, useEffect } from 'react';
import { DarkModeSwitch } from './darkmodeswitch';
import { useRouter } from 'next/navigation';
import { deleteAuthCookie } from '@/actions/auth.action';
import useAuthStore from '../auth/authStore';
import useProfileStore from '../store/useProfileStore';

interface UserDropdownProps {
  lang: string; // Принимаем язык как prop
  t: (key: string) => string;
}
export const UserDropdown = ({ t }: UserDropdownProps) => {
  const router = useRouter();
  const { profile, fetchProfile } = useProfileStore();
  console.log(profile, 'prof');
  const { setTheme, resolvedTheme } = useNextTheme();
  const clearTokens = useAuthStore(state => state.clearTokens); // Получаем clearTokens из Zustand
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);
  const handleLogout = useCallback(async () => {
    clearTokens(); // Очищаем токены в Zustand и cookies
    await deleteAuthCookie(); // Выполняем дополнительное удаление на сервере
    router.replace('/auth/login'); // Перенаправляем на страницу входа
  }, [clearTokens, router]);

  return (
    <>
      {/* @ts-ignore */}
      <Dropdown>
        <NavbarItem>
          <DropdownTrigger>
            <div className="w-11 h-11 rounded-full cursor-pointer bg-blue-500 flex items-center justify-center text-[20px] text-white">
              {profile?.avatar}
            </div>
          </DropdownTrigger>
        </NavbarItem>

        <DropdownMenu
          aria-label="User menu actions"
          onAction={actionKey => console.log({ actionKey })}
        >
          <DropdownItem
            key="profile"
            className="flex flex-col justify-start w-full items-start"
            onClick={() => router.push('/profile')}
          >
            {t('profile.profile')}
          </DropdownItem>
          <DropdownItem
            key="settings"
            className="flex flex-col justify-start w-full items-start"
            onClick={() => router.push('/settings')}
          >
            {t('profile.settings')}
          </DropdownItem>
          <DropdownItem
            key="logout"
            color="danger"
            className="text-danger"
            onPress={handleLogout} // Добавляем обработчик выхода
          >
            {t('profile.logOut')}
          </DropdownItem>
          <DropdownItem
            key="switch"
            className="flex justify-center"
            onClick={e => setTheme(e ? 'dark' : 'light')}
          >
            <DarkModeSwitch />
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </>
  );
};
