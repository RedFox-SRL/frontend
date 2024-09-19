module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'primary-bg': '#5B21B6',  // Fondo oscuro
        'primary-text': '#ffffff',  // Texto claro
        'button-bg': '#1a1a1a',  // Color de fondo de los botones
        'button-border-hover': '#646cff',  // Borde del botón al hacer hover
        'secondary-bg': '#F1E9FE',  // Fondo claro
      },
    },
  },
  plugins: [],
};
