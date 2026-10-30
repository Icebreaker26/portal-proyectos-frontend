import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Paleta institucional UCP (ver docs/adr/0007-identidad-visual-portal.md en el backend)
        ucp: {
          granate: '#86191C',
          verde: '#00804E',
          dorado: '#DBA630',
          rojo: '#D83135',
        },
      },
    },
  },
  plugins: [typography],
};
