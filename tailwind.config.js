/** Mirrors the former inline `tailwind.config` from dist/index.html. */
module.exports = {
  content: ['./dist/**/*.html', './dist/assets/*.js'],
  theme: {
    extend: {
      colors: {
        'ink-950': '#0B1720',
        'ink-900': '#102531',
        'ink-800': '#173542',
        'porcelain-50': '#FBF9F4',
        'porcelain-100': '#F5F3EE',
        'paper-100': '#F0EEE8',
        'mist-100': '#EAF1F1',
        'mist-200': '#DCE8E7',
        'teal-600': '#1D766E',
        'teal-500': '#2D8F85',
        'teal-400': '#14B8A6',
        'green-500': '#22C55E',
        'lime-500': '#84CC16',
        'text-primary': '#10212A',
        'text-secondary': '#4B5B62',
        'text-muted': '#5F6E75',
        'border-light': 'rgba(16, 37, 49, 0.1)',
        'border-dark': 'rgba(255, 255, 255, 0.14)',
      },
      fontFamily: {
        sans: ['Manrope', 'sans-serif'],
        serif: ['Newsreader', 'serif'],
      },
      borderRadius: {
        btn: '12px',
        'card-sm': '16px',
        card: '22px',
        'card-lg': '28px',
        hero: '32px',
      },
    },
  },
};
