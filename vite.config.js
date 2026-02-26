export default {
  root: '.',
  publicDir: 'public',
  base: './',
  build: {
    outDir: 'dist/web',
    copyPublicDir: true,
    target: ['es2015', 'chrome58', 'safari11', 'ios11'],
    rollupOptions: {
      input: 'index.html',
    },
  },
};
