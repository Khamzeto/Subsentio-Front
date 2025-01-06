'use client';

import React, { useEffect } from 'react';
import { Sidebar } from './sidebar.styles';
import { Button, Tooltip } from '@nextui-org/react';
import { SettingsIcon } from '../icons/sidebar/settings-icon';
import { SidebarItem } from './sidebar-item';
import { useSidebarContext } from '../layout/layout-context';
import { usePathname, useRouter } from 'next/navigation';
import {
  IconBrain,
  IconDiamond,
  IconHeadset,
  IconLayoutDashboardFilled,
  IconSettings,
  IconSettings2,
  IconSettingsAutomation,
  IconSettingsBolt,
  IconSettingsFilled,
  IconVocabulary,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import useLanguageStore from '../store/useLanguageStore';

interface SidebarWrapperProps {
  lang: string; // Принимаем язык как prop
  t: (key: string) => string;
}

export const SidebarWrapper = ({ t }: SidebarWrapperProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const { collapsed, setCollapsed } = useSidebarContext();

  const handleSettingsClick = () => {
    router.push('/settings'); // Переход на страницу настроек
  };

  return (
    <aside className="h-screen bg-green z-[600] sticky top-0">
      {collapsed ? <div className={Sidebar.Overlay()} onClick={setCollapsed} /> : null}
      <div className={Sidebar({ collapsed })}>
        <div className="flex pl-4 mt-2  items-center gap-[8px]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="36"
            height="36"
            viewBox="0 0 36 36"
            fill="none"
          >
            <rect width="36" height="36" rx="10" fill="white" />
            <path
              d="M18.665 28.2384C20.3034 27.9377 21.6877 27.3481 23.0934 26.3411C23.9355 25.7346 25.0385 24.5834 25.621 23.7001C25.9998 23.1215 26.5739 21.9945 26.7413 21.5007C26.779 21.3863 26.8438 21.1935 26.8875 21.0789C27.0116 20.7115 27.2067 19.8119 27.2923 19.1899C27.4441 18.0716 27.3342 16.4444 27.0178 15.2114C26.7905 14.3204 25.9955 12.5027 25.7449 12.3149C25.7021 12.2807 25.4987 12.4246 25.1294 12.7588C24.0208 13.7496 22.436 14.7389 21.2076 15.1921C20.9196 15.2973 20.6617 15.4134 20.633 15.4442C20.5813 15.4995 21.1707 16.8779 21.6444 17.8377C21.6954 17.9372 21.792 18.1481 21.8632 18.3123C21.9343 18.4765 22.0502 18.7285 22.1205 18.8689C22.2165 19.062 22.9562 20.6554 23.2008 21.1886C23.2203 21.2356 22.5317 21.2892 20.4455 21.3792C17.8128 21.5 17.4745 21.5296 16.6305 21.7374C14.8423 22.1802 13.3042 22.9715 11.9285 24.156C11.3275 24.6768 10.3713 25.7694 9.93568 26.4273C9.58518 26.9633 8.82723 28.4538 8.83238 28.6024C8.83587 28.7035 17.9669 28.3637 18.665 28.2384Z"
              fill="black"
            />
            <path
              d="M17.6051 7.35172C15.9573 7.59562 14.5534 8.13697 13.1138 9.09472C12.2512 9.67175 11.109 10.7842 10.4963 11.6468C10.0977 12.2119 9.485 13.3184 9.30059 13.8062C9.25895 13.9192 9.18756 14.1096 9.13997 14.2226C9.00315 14.5855 8.77709 15.4778 8.67002 16.0964C8.47965 17.2089 8.53319 18.8388 8.80684 20.0821C9.00315 20.9804 9.73485 22.8245 9.97875 23.0208C10.0204 23.0565 10.2286 22.9197 10.6093 22.5985C11.7515 21.6467 13.3696 20.7127 14.6129 20.3022C14.9043 20.2071 15.1661 20.1 15.1958 20.0702C15.2494 20.0167 14.708 18.6187 14.2678 17.6431C14.2202 17.542 14.131 17.3278 14.0656 17.1613C14.0001 16.9947 13.8931 16.7389 13.8276 16.5961C13.7384 16.3998 13.0543 14.7818 12.8282 14.2404C12.8104 14.1928 13.5004 14.1631 15.5885 14.1452C18.2238 14.1155 18.5629 14.0977 19.4135 13.9192C21.216 13.5385 22.7806 12.8008 24.1964 11.6646C24.815 11.1649 25.8085 10.106 26.2665 9.46355C26.6354 8.94005 27.4444 7.47665 27.4444 7.32793C27.4444 7.2268 18.3071 7.2506 17.6051 7.35172Z"
              fill="#A50AFF"
            />
          </svg>
          <div className="font-[800] text-[20px]">
            <span className="text-[#A50AFF]">sub</span>sentio
          </div>
        </div>

        <div className="flex flex-col justify-between h-full">
          <div className={Sidebar.Body()}>
            {/* Главная панель */}
            <SidebarItem
              isActive={pathname === '/dashboard'}
              title={t('sidebar.mainPanel')} // <-- Локализация
              icon={
                <IconLayoutDashboardFilled
                  size={24}
                  strokeWidth={2}
                  className={
                    pathname === '/dashboard'
                      ? ' text-[hsl(212,92%,58%)] '
                      : 'text-gray-500 fill-gray-500'
                  }
                />
              }
              href="/dashboard"
            />

            {/* Словарь */}
            <SidebarItem
              isActive={pathname === '/vocabulary'}
              title={t('sidebar.vocabulary')} // <-- Локализация
              icon={
                <IconVocabulary
                  size={24}
                  strokeWidth={2}
                  className={
                    pathname === '/vocabulary'
                      ? ' text-[hsl(212,92%,58%)] '
                      : 'text-gray-500 fill-transparent'
                  }
                />
              }
              href="/vocabulary"
            />

            {/* Практика */}
            <SidebarItem
              isActive={pathname === '/practice'}
              title={t('sidebar.practice')} // <-- Локализация
              href="/practice"
              icon={
                <IconBrain
                  size={24}
                  strokeWidth={2}
                  className={
                    pathname === '/practice'
                      ? 'text-[hsl(212,92%,58%)] '
                      : 'text-gray-500 fill-transparent'
                  }
                />
              }
            />

            {/* Планы */}
            <SidebarItem
              isActive={pathname === '/plans'}
              title={t('sidebar.plans')} // <-- Локализация
              href="/plans"
              icon={
                <IconDiamond
                  size={24}
                  strokeWidth={2}
                  className={
                    pathname === '/plans'
                      ? 'text-[hsl(212,92%,58%)] '
                      : 'text-gray-500 fill-transparent'
                  }
                />
              }
            />
          </div>

          <div className={Sidebar.Footer()}>
            <div
              // Переход на страницу премиум
              className="w-full px-6 py-6 border-2 border-blue-400 rounded-[20px] cursor-pointer bg-transparent  text-center flex flex-col items-center gap-3"
            >
              <div className="text-[26px]">💎</div> {/* Смайлик сверху */}
              <h2 className="text-[15px]  font-[600] w-full dark:text-blue-400 text-blue-500">
                {t('plans.upgradeToPremium')}
              </h2>
              <p className="text-[13px] text-gray-600 dark:text-gray-400 w-[100%]">
                {t('other.descPremium')}
              </p>
              <Button
                onClick={() => router.push('/plans')}
                className="bg-blue-500  text-white w-full mt-2"
              >
                {t('other.to')}
              </Button>
            </div>

            <Button
              leftIcon={<IconHeadset size={24} />}
              onClick={() => router.push('/support')}
              radius="md" // Радиус скругления
              size="md" // Размер кнопки
              color="warning"
              className={' w-full  px-4 py-2 '}
            >
              <IconHeadset size={24} />
              {t('other.problem')}
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
};
