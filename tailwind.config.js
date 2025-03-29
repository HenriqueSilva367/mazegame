/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1D4ED8", // Azul
        secondary: "#F59E0B", // Amarelo
        accent: "#10B981", // Verde
        background: "#F3F4F6", // Cinza claro
        // Adicione outras cores conforme necessário
      },
    },
  },
  plugins: [],
};
