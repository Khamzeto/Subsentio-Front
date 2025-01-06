import $api from '@/config/api/api';
import { create } from 'zustand';
import useLanguageStore from './useLanguageStore';

// Тип данных профиля (с учётом Mongoose схемы)
type UserProfile = {
  email: string;
  username: string;
  plan: 'free' | 'premium' | 'enterprise';
  nativeLanguage?: string;
  learningLanguage?: string;
  seeTranslate: boolean;
  avatar?: string; // Можно добавить для расширения
  dayWords: number; // Поле для ежедневной цели
};

// Тип состояния Zustand
type ProfileState = {
  profile: UserProfile | null; // Состояние профиля
  loading: boolean; // Состояние загрузки
  error: string | null; // Ошибки
  fetchProfile: () => Promise<void>; // Метод для получения профиля
  updateProfile: (updatedData: Partial<UserProfile>) => Promise<void>; // Обновление профиля
  updateDayWords: (dayWords: number) => Promise<void>; // Обновление dayWords
};

const useProfileStore = create<ProfileState>(set => ({
  profile: null,
  loading: false,
  error: null,

  // Метод для получения профиля
  fetchProfile: async () => {
    set({ loading: true, error: null });
    try {
      const response = await $api.get('/users/profile'); // Запрос на сервер
      const profile = response.data;

      // Устанавливаем куку lang на основе nativeLanguage
      if (profile.nativeLanguage) {
        document.cookie = `lang=${profile.nativeLanguage}; path=/; max-age=${
          60 * 60 * 24 * 365
        }`;

        // Обновляем язык в LanguageStore
        const { setLanguage } = useLanguageStore.getState(); // Получаем метод setLanguage
        setLanguage(profile.nativeLanguage); // Устанавливаем новый язык
      }

      set({ profile, loading: false }); // Сохраняем профиль
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Не удалось загрузить профиль',
        loading: false,
      });
    }
  },

  // Метод для обновления профиля
  updateProfile: async updatedData => {
    set({ loading: true, error: null });
    try {
      const response = await $api.put('/users/settings', updatedData); // Запрос на обновление
      const updatedProfile = response.data; // Получаем обновленный профиль

      // Устанавливаем куку lang, если поле nativeLanguage существует
      if (updatedProfile.nativeLanguage) {
        document.cookie = `lang=${updatedProfile.nativeLanguage}; path=/; max-age=${
          60 * 60 * 24 * 365
        }`;

        // Обновляем язык в LanguageStore
        const { setLanguage } = useLanguageStore.getState(); // Получаем метод setLanguage
        setLanguage('ru'); // Устанавливаем новый язык
      }

      // Обновляем профиль в Zustand
      set({ profile: updatedProfile, loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Не удалось обновить профиль',
        loading: false,
      });
    }
  },

  // Метод для обновления dayWords
  updateDayWords: async dayWords => {
    set(state => ({
      loading: true,
      error: null,
      profile: state.profile ? { ...state.profile, dayWords } : null, // Локальное обновление
    }));

    try {
      await $api.put('/users/daywords', { dayWords }); // Запрос к серверу
      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Не удалось обновить dayWords',
        loading: false,
      });
    }
  },
}));

export default useProfileStore;
