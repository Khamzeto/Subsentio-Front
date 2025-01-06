import { Layout } from '@/components/layout/layout';

import '@/styles/globals.css';
import { cookies } from 'next/headers';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = cookies().get('lang')?.value || 'en';
  // @ts-ignore
  return <Layout lang={lang}>{children}</Layout>;
}
