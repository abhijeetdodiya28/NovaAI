// D:\abhijeetthinks\chatBot\frontend\vite.config.js

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react'; // Example: Assuming you are using React

export default defineConfig({
  plugins: [
    // Include your framework plugin (e.g., React, Vue, Svelte)
    react(), 
    // Do NOT add 'tailwindcss()' here. PostCSS handles the injection.
  ],
  // You do not need to manually configure CSS/PostCSS here
});