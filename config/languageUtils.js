// src/utils/languageUtils.js
export const getLanguage = navigatorLanguage => {
  const languageMap = {
    ru: 'ru',
    es: 'es',
    fr: 'fr',
    de: 'de',
    it: 'it',
    pt: 'pt',
    zh: 'zh',
    ja: 'ja',
    ko: 'ko',
  };

  for (const [key, value] of Object.entries(languageMap)) {
    if (navigatorLanguage.startsWith(key)) {
      return value;
    }
  }

  return 'en';
};
