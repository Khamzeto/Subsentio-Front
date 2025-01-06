import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  setTokens: (accessToken: string, refreshToken: string) => void;
  clearTokens: () => void;
};

const useAuthStore = create(
  persist<AuthState>(
    set => ({
      accessToken: null,
      refreshToken: null,
      setTokens: (accessToken, refreshToken) => {
        set({ accessToken, refreshToken });

        // Сохранение токенов в cookies
        document.cookie = `auth-storage=${JSON.stringify({
          accessToken,
          refreshToken,
        })}; path=/; max-age=604800; SameSite=Lax`;
      },
      clearTokens: () => {
        set({ accessToken: null, refreshToken: null });

        // Очистка cookies
        document.cookie =
          'auth-storage=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
      },
    }),
    {
      name: 'auth-storage', // Имя ключа в localStorage
    }
  )
);

export default useAuthStore;
