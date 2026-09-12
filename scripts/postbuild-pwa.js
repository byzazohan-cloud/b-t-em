const fs = require('fs');
const path = require('path');

const dist = path.join(__dirname, '..', 'dist');
const index = path.join(dist, 'index.html');
if (!fs.existsSync(index)) { console.error('dist/index.html bulunamadı.'); process.exit(1); }
let html = fs.readFileSync(index, 'utf8');

// GitHub Pages proje alt yolu (ör. /b-t-em/) için root-relative Expo asset yollarını göreli yap.
html = html.replaceAll('href="/_expo/', 'href="./_expo/');
html = html.replaceAll('src="/_expo/', 'src="./_expo/');

const headExtras = `
<meta name="theme-color" content="#020304">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="HANE">
<link rel="manifest" href="./manifest.json">
<link rel="apple-touch-icon" href="./icon-192.png">
`;
if (!html.includes('apple-mobile-web-app-title')) html = html.replace('</head>', `${headExtras}\n</head>`);

const sw = `
<script>
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('./sw.js').catch(function(){});
  });
}
</script>`;
if (!html.includes("navigator.serviceWorker.register('./sw.js')")) html = html.replace('</body>', `${sw}\n</body>`);
fs.writeFileSync(index, html, 'utf8');

for (const file of ['manifest.json','icon-192.png','icon-512.png']) {
  const src = path.join(__dirname, '..', 'public', file);
  const dst = path.join(dist, file);
  if (fs.existsSync(src)) fs.copyFileSync(src, dst);
}
console.log('HANE GitHub Pages PWA ayarlari tamamlandi.');
