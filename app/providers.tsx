'use client';
import * as React from 'react';
import { NextUIProvider } from '@nextui-org/system';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { ThemeProviderProps } from 'next-themes/dist/types';
import { I18nextProvider } from 'react-i18next'; // Импортируем I18nextProvider
import i18n from '@/config/i18n';

export interface ProvidersProps {
  children?: React.ReactNode; // Сделано обязательным
  themeProps?: ThemeProviderProps;
}

export function Providers({ children, themeProps }: ProvidersProps) {
  return (
    <NextThemesProvider defaultTheme="system" attribute="class" {...themeProps}>
      <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
    </NextThemesProvider>
  );
}
