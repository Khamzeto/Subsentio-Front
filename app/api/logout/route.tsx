import { NextResponse } from 'next/server';

export async function POST() {
  try {
    console.log('Получен запрос на logout');

    // Очистка cookies
    const response = NextResponse.json({ success: true });
    response.cookies.set('auth-storage', '', {
      path: '/',
      expires: new Date(0), // Установка истёкшего времени
    });

    console.log('Cookies успешно очищены');
    return response;
  } catch (error) {
    console.error('Ошибка при выполнении logout:', error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}
