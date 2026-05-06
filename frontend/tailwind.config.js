/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        nt: {
          // Legacy tokens — retained for backwards compat during the branding
          // pass. New code should prefer nt-green-*, nt-text-*, nt-border, nt-bgSubtle.
          primary: '#00bf63',
          'primary-dark': '#009b50',
          'primary-light': '#33d180',
          // Brand color scale (matches Neighbors Trailer dashboard).
          green: {
            50: '#E8F5EA',
            100: '#D4EDD8',
            500: '#2D8C3C',
            600: '#236E2E',
            700: '#1F7A2E',
          },
          text: {
            primary: '#0F172A',
            secondary: '#64748B',
          },
          border: '#E2E8F0',
          bgSubtle: '#F8FAFC',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
