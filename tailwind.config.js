import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
    './storage/framework/views/*.php',
    './resources/views/**/*.blade.php',
    './resources/js/**/*.tsx',
  ],

  theme: {
    extend: {
      colors: {
        main: '#84994F',
        secondary: '#FFE797',
        warning: '#FCB53B',
        danger: '#A72703',
        'info-tandur': '#1055C9',
        'dark-tandur': '#061E29',
        // 'white-tandur': '#F5F2F2',
        'white-tandur': '#fffafa',
      },
      fontFamily: {
        sans: ['Figtree', ...defaultTheme.fontFamily.sans],
      },
    },
  },

  plugins: [forms],
};
