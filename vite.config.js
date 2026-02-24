export default {
  root: '.',
  publicDir: '.',
  base: './',
  build: {
    outDir: 'dist',
    copyPublicDir: false,
    target: ['es2015', 'chrome58', 'safari11', 'ios11'],
    rollupOptions: {
      input: 'index.html',
    },
  },
};
