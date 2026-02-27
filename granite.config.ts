import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'mood-food',
  brand: {
    displayName: '무드푸드',
    primaryColor: '#3182F6',
    icon: 'https://static.toss.im/appsintoss/18177/f7692818-aecf-4a41-bf7b-c753e0c72c3a.png',
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
