import useAuthStore from '@/components/auth/authStore';
import axios from 'axios';

// Базовый URL вашего API
const $api = axios.create({
  baseURL: 'http://localhost:5001/api', // Замените на ваш URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Интерсептор для добавления токена
$api.interceptors.request.use(
  config => {
    const accessToken = useAuthStore.getState().accessToken; // Получаем токен из Zustand
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`; // Добавляем токен в заголовки
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Интерсептор для обработки ошибок и обновления токена
$api.interceptors.response.use(
  response => response, // Если запрос успешный, возвращаем ответ
  async error => {
    const originalRequest = error.config;

    // Если ошибка 401 и запрос ещё не был повторен
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Устанавливаем флаг, чтобы предотвратить рекурсию

      try {
        const refreshToken = useAuthStore.getState().refreshToken; // Получаем refreshToken из Zustand
        if (!refreshToken) {
          throw new Error('Refresh token отсутствует');
        }

        // Запрос для обновления токена
        const { data } = await axios.post('http://localhost:5001/api/users/refresh', {
          refreshToken,
        });

        // Обновляем токены в Zustand
        useAuthStore.getState().setTokens(data.accessToken, data.refreshToken);

        // Повторяем оригинальный запрос с новым токеном
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return $api(originalRequest);
      } catch (refreshError) {
        // Если обновить токен не удалось, очищаем хранилище и перенаправляем на страницу входа
        useAuthStore.getState().clearTokens();
        window.location.href = '/auth/login'; // Перенаправляем на страницу входа
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error); // Если ошибка не 401, возвращаем её
  }
);

export default $api;
