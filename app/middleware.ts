import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Извлекаем куки из запроса
  const authStorage = request.cookies.get('auth-storage')?.value;

  if (authStorage) {
    try {
      const { accessToken } = JSON.parse(authStorage);

      // Если есть accessToken, перенаправляем на /dashboard
      if (accessToken) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    } catch (error) {
      console.error('Failed to parse auth-storage cookie:', error);
    }
  }

  // Продолжаем выполнение запроса, если токена нет
  return NextResponse.next();
}

// Указываем, на какие маршруты применять middleware
export const config = {
  matcher: ['/auth/:path*'], // Применяется ко всем путям в папке /auth
};
