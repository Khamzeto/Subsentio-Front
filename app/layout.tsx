import '@/styles/globals.css';
import type { Metadata } from 'next';
import { Providers } from './providers';
import { fontSans } from '@/config/fonts';
import clsx from 'clsx';

export const metadata = {
  title: 'Subsentio',
  icons: {
    icon: [
      { rel: 'icon', url: '/favicon-32x32.svg', type: 'image/svg' },
      { rel: 'icon', url: '/favicon-16x16.svg', type: 'image/svg' },
    ],
  },
};

export default function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string }; // Получаем локаль через параметры
}) {
  return (
    <html lang={params.locale || 'en'}>
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
      />

      <body
        className={clsx('font-sans antialiased dark:bg-[#121212]', fontSans.className)}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
