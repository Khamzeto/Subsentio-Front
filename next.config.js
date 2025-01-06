/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  i18n: {
    defaultLocale: 'en', // Язык по умолчанию
    locales: ['en', 'ru', 'es', 'fr', 'de', 'it', 'pt', 'zh', 'ja', 'ko'], // Список поддерживаемых языков
    localeDetection: false,
  },
};

module.exports = nextConfig;
