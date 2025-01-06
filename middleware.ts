import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const defaultLocale = 'en';
const locales = ['en', 'ru', 'es', 'fr', 'de', 'it', 'pt', 'zh', 'ja', 'ko']; // Поддерживаемые языки

export function middleware(request: NextRequest) {
  // Проверяем наличие токена авторизации
  const authStorage = request.cookies.get('auth-storage')?.value;

  if (authStorage) {
    try {
      const { accessToken } = JSON.parse(authStorage);
      if (accessToken) {
        // Если есть accessToken, перенаправляем на /dashboard
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    } catch (error) {
      console.error('Failed to parse auth-storage cookie:', error);
    }
  }

  // Если токена нет, определяем язык пользователя
  let userLocale = request.cookies.get('lang')?.value;
  if (!userLocale) {
    const acceptLanguage = request.headers.get('accept-language') || '';
    userLocale =
      locales.find(locale => acceptLanguage.startsWith(locale)) || defaultLocale;
  }

  // Устанавливаем (или обновляем) cookie 'lang'
  const response = NextResponse.redirect(new URL('/auth/login', request.url));
  response.cookies.set('lang', userLocale, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365, // Срок жизни куки - 1 год
  });

  return response;
}

// Применение middleware только к маршрутам root
export const config = {
  matcher: ['/'], // Применяется ко всем маршрутам
};
