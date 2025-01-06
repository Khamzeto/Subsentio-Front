const { nextui } = require('@nextui-org/react');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',

    // Если вы используете директорию `src`:
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      screens: {
        'max-sm': { max: '639px' },
        // => @media (max-width: 639px) { ... }

        'max-md': { max: '767px' },
        // => @media (max-width: 767px) { ... }
        'max-two': { max: '968px' },
        // => @media (max-width: 767px) { ... }

        'max-lg': { max: '1023px' },
        // => @media (max-width: 1023px) { ... }

        'max-xl': { max: '1279px' },
        // => @media (max-width: 1279px) { ... }

        'max-2xl': { max: '1535px' },
        // => @media (max-width: 1535px) { ... }
      },
    },
  },
  darkMode: 'class',
  plugins: [nextui()],
};
