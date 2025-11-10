// D:\abhijeetthinks\chatBot\frontend\tailwind.config.js

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    // This ensures Tailwind scans your main HTML file
    "./index.html",
    // This line ensures Tailwind scans all your React components (.js, .jsx, .ts, .tsx)
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};