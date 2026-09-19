# HANE V19.4.8 – Verified Fallback V31

Bu sürüm V30 üzerine güvenlik ve kararlılık iyileştirmesi olarak hazırlanmıştır.

- Doğrudan doğrulanmamış CDN kodu çalıştırma kaldırıldı.
- Service Worker motor hazırlığı başarısız olursa uygulama, yalnız sabit npm paketlerini indirir.
- İndirilen paketlerin SHA-512 özeti sabit beklenen değerle eşleşmeden hiçbir motor dosyası çalıştırılmaz.
- Doğrulanan dosyalar HANE cache'ine yazılır ve aynı-origin sanal motor yollarından çalıştırılır.
- Ekstre seçilmeden önce motor hazırlığı tamamlanır; kişisel ekstre, PIN veya HANE verisi dışarı gönderilmez.
- Runtime dış ağ erişimi yalnız üç sabit npm paket arşiviyle sınırlıdır.
