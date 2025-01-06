import { create } from 'zustand';

// Тип для состояния
interface LanguageState {
  language: string; // Текущий язык
  setLanguage: (lang: string) => void; // Метод для изменения языка
  initLanguage: () => void; // Метод для инициализации языка из куки
}

// Создаем Zustand-хранилище
const useLanguageStore = create<LanguageState>(set => ({
  language: 'en', // Язык по умолчанию

  // Метод для установки языка
  setLanguage: (lang: string) => {
    // Обновляем куку с языком
    document.cookie = `lang=${lang}; path=/; max-age=${60 * 60 * 24 * 365}`;

    // Обновляем Zustand-состояние
    set({ language: lang });
  },

  // Метод для инициализации языка из куки
  initLanguage: () => {
    try {
      const langCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('lang='))
        ?.split('=')[1];

      // Если кука отсутствует, используем язык по умолчанию
      set({ language: langCookie || 'en' });
    } catch (error) {
      set({ language: 'en' }); // Устанавливаем язык по умолчанию в случае ошибки
    }
  },
}));

export default useLanguageStore;
