'use client';

import React, { useEffect, useState } from 'react';
import { useLockedBody } from '../hooks/useBodyLock';
import { NavbarWrapper } from '../navbar/navbar';
import { SidebarWrapper } from '../sidebar/sidebar';
import { SidebarContext } from './layout-context';
import { useTranslation } from 'react-i18next';
import useLanguageStore from '../store/useLanguageStore';

interface Props {
  children: React.ReactNode;
  lang: string; // Язык из SSR
}

export const Layout = ({ children, lang }: Props) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [_, setLocked] = useLockedBody(false);
  const { i18n, t } = useTranslation();
  const { language, setLanguage, initLanguage } = useLanguageStore();
  const [isHydrated, setIsHydrated] = useState(false); // Флаг для отслеживания гидратации

  // Используем серверный язык до полной инициализации клиента
  const effectiveLanguage = isHydrated ? language : lang;

  // Обновляем состояние i18n только при полной гидратации
  if (i18n.language !== effectiveLanguage) {
    i18n.changeLanguage(effectiveLanguage);
  }

  // После гидратации включаем клиентскую логику
  useEffect(() => {
    if (!isHydrated) {
      initLanguage(); // Инициализация языка из куки
      setIsHydrated(true); // Помечаем, что гидратация завершена
    }
  }, [isHydrated, initLanguage]);

  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
    setLocked(!sidebarOpen);
  };

  return (
    <SidebarContext.Provider
      value={{
        collapsed: sidebarOpen,
        setCollapsed: handleToggleSidebar,
      }}
    >
      <section className="flex">
        {/* @ts-ignore */}
        <SidebarWrapper t={t} /> {/* Sidebar автоматически получит язык через i18n */}
        {/* @ts-ignore */}
        <NavbarWrapper t={t}>{children}</NavbarWrapper>
      </section>
    </SidebarContext.Provider>
  );
};
