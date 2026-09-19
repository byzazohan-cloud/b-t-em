# HANE V19.4.8 – Controller First V34

- Ekstre motoru için ağ isteği yapılmadan önce sayfanın tam V34 HANE Service Worker tarafından kontrol edildiği doğrulanır.
- PDF seçilince yalnız PDF motoru; fotoğraf seçilince yalnız OCR motoru hazırlanır.
- Motor paketleri sabit npm sürümlerinden alınır ve SHA-512 doğrulaması geçmeden cache'e yazılmaz veya çalıştırılmaz.
- Kişisel ekstre, PIN ve HANE verileri dışarı gönderilmez.
- Parser ve 66 harcama + 3 ödeme uzlaştırma düzeltmeleri korunur.
