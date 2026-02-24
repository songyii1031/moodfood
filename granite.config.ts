import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'mood-food',
  brand: {
    displayName: '무드푸드',
    primaryColor: '#3182F6',
    icon: 'https://raw.githubusercontent.com/user/moodfood/main/logo.png',
  },
  web: {
    host: 'localhost',
    port: 5173,
    commands: {
      dev: 'vite',
      build: 'vite build',
    },
  },
  permissions: [],
  outdir: 'dist',
});
