# V33 Denetim Özeti

- Lazy PDF/OCR motor kullanımından hemen önce V33 controller doğrulaması eklendi.
- Doğru controller zaten aktifse hızlı yol kullanılır; gereksiz reg.update çağrısı yapılmaz.
- Yeni worker gerektiğinde clients.claim sonrası controller beklenir; otomatik sayfa yenileme yoktur.
- Build/cache/manifest/update-config referansları V33 ile eşlendi.
- Parser ve 66 harcama + 3 ödeme uzlaştırma mantığı korunur.
