# HANE 19.4.8 — Local Data Only 4 Audit

## İlk taramada bulunan ve düzeltilenler
- Alt klasörde yayınlandığında OCR/PDF sanal motor yollarının Service Worker tarafından eşleşmemesi düzeltildi.
- Ekstre motoru hazırlanamadığında sonsuza kadar bekleme riski kaldırıldı; kontrollü zaman aşımı eklendi.
- Ekstre dosyaları için tür ve 20 MB boyut kontrolü eklendi.
- Çok büyük fotoğraflar OCR öncesi cihaz içinde küçültülerek bellek riski azaltıldı.
- Ekstre önizlemesinden kaydedilecek tarihler tekrar doğrulanıyor; geçersiz tarih kaydı engellendi.
- Türkçe binlik ayırıcıyla yazılmış 1.250 TL gibi tutarların 1,25 TL okunması düzeltildi.
- Modal başlıklarında kullanıcı kaynaklı metin HTML olarak yorumlanmıyor.
- OCR/PDF npm paketleri sabit SHA-512 bütünlük değerleriyle doğrulanmaya devam ediyor.

## Son tarama
- JavaScript sözdizimi: geçti.
- manifest.json / update-config.json: geçti.
- data-action -> action handler eşleşmesi: geçti.
- Form -> submit handler eşleşmesi: geçti.
- Tekrarlanan fonksiyon tanımı: bulunmadı.
- Uygulama çalışma kodunda harici ağ URL/fetch/XHR/WebSocket/sendBeacon: bulunmadı.
- Service Worker runtime: cache-only; cross-origin ve yazma metodları bloklu.
- ZIP bütünlük testi: geçti.

Not: OCR/PDF motor paketlerinin ilk güvenli kurulumu internet gerektirir; kişisel ekstre seçilmeden önce yapılır. Ekstre dosyası uygulama tarafından dışarı yüklenmez.
