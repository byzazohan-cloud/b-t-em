module.exports = {
  globDirectory: 'dist/',
  globPatterns: ['**/*.{html,js,css,json,png,ico,svg}'],
  swDest: 'dist/sw.js',
  cleanupOutdatedCaches: true,
  clientsClaim: true,
  skipWaiting: true
};
