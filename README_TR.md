# HANE V19.4.8 – Controller Ready V33

- Lazy Engine korunur: dosya seçici hemen açılır.
- PDF seçilirse yalnız PDF motoru, fotoğraf seçilirse yalnız OCR motoru hazırlanır.
- Motor kullanılmadan önce bu sayfanın tam V33 HANE Service Worker tarafından kontrol edildiği doğrulanır.
- Doğru worker zaten aktifse ağ güncellemesi yapılmadan hızlı yol kullanılır.
- Motor paketleri sabit npm sürümlerinden alınır ve SHA-512 doğrulaması geçmeden çalıştırılmaz/cache'e yazılmaz.
- HANE dışı cache ve Service Worker kayıtlarına dokunulmaz.
