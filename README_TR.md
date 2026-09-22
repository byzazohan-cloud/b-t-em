# HANE V113 — PROFILE RESTORE

- V108 rapor tasarımı sırasında yanlışlıkla silinen `profile()` görünüm fonksiyonu geri getirildi.
- `view()` nesnesi artık `profile` referansını güvenle çözebiliyor; PIN sonrası `PROFILE IS NOT DEFINED` açılış hatası giderildi.
- Service Worker, bootstrap, uygulama ve asset sürüm kimlikleri V113 altında eşitlendi.
- Kullanıcı verisi / localStorage silinmez.
- Raporlar, sabit gider gerçek ödeme, Finans ve Takvim işlevleri korunmuştur.


## S3 FIX3
- Sabit gelir gelecek tarihliyse takvimde plan olarak görünür.
- Vade günü gelmeden ana gelir toplamına, kalan bakiyeye, son hareketlere, hareketler ekranına ve gerçekleşen raporlara dahil edilmez.
- Vade günü geldiğinde otomatik olarak gerçekleşen gelire dahil edilir.
