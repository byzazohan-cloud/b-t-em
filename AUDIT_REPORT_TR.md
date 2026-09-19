# HANE V25 Güçlendirme Taraması

- Ekstre tekrar uzlaştırması yalnız tek ve açıklanabilir tekrar kümesi banka toplamına tam oturursa otomatik satır azaltır.
- Aynı tarih + aynı açıklama + aynı tutar tek başına mükerrer sayılmaz.
- PDF metin katmanı ile OCR arasında seçim yalnız satır sayısına göre değil; işlem satırları, banka harcama/ödeme toplamları ve muhasebe eşitliği puanıyla yapılır.
- Ekstre özeti artık ancak banka eşitliği ve işlem satırı toplamları birlikte uyuşursa `doğrulandı` kabul edilir.
- Runtime CDN fallback kaldırıldı. PDF/OCR motorları yalnız Service Worker tarafından SHA-512 doğrulanmış paketlerden yerel cache'e hazırlanır.
- Cross-origin runtime istekleri tamamen engellenir.
- Para gösterimi kuruşlu olarak korunur.
- JS, Service Worker, JSON ve ZIP kontrolleri paketleme sırasında çalıştırıldı.
