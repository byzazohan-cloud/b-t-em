HANE PREMIUM V19.4.8 — CLEAN FINAL

Bu paket FINAL AUDIT sürümünün temizlenmiş ve tamamlanmış devamıdır.

Tamamlanan ana noktalar:
- 28 maddelik HANE güncelleme planındaki finans, ay/tarih, kart/ekstre, hane üyesi, hareket, form güvenliği, takvim ve tema sistemi korunur.
- Ana ekrana seçili ayın en yeni 12 kaydını gösteren tıklanabilir SON HAREKETLER bölümü eklendi.
- Türkiye saatinde gece yarısı tarihinin önceki güne kayabilmesine yol açan UTC tarih üretimi yerel tarih üretimiyle değiştirildi.
- Rapor/özel tarih aralığındaki sabit gider kategori detayları tam ödeme kaydını açar.
- Artık kullanılmayan eski ayrı sabit-gider form/kaydetme akışı ve kullanılmayan render yardımcısı kaldırıldı.
- İşlevsiz Bildirimler ayar satırı kaldırıldı.
- Referansı olmayan eski logo/icon dosyaları temizlendi.
- Mevcut kullanıcı verileri, şifreli localStorage anahtarları ve veri şeması korunur; veri sıfırlaması yapılmaz.
- PWA/cache kimliği Clean Final olarak yenilendi.

Build: 20260918-CLEAN-FINAL


## LOCAL DATA ONLY 5 GÜVENLİK NOTU
- Çalışma anında HANE kontrollü sayfa/worker istekleri ağ yerine yalnızca doğrulanmış cache'ten karşılanır.
- Cross-origin istekler, tüm POST/PUT/PATCH/DELETE istekleri ve izin listesinde olmayan GET istekleri engellenir.
- OCR/PDF motor paketleri sadece Service Worker kurulurken sabit npm paket URL'lerinden indirilir; SHA-512 bütünlük değeri doğrulanmadan çalıştırılabilir dosyalar cache'e alınmaz.
- Uygulama kabuğu veya doğrulanmış motorlardan biri eksikse yeni Service Worker aktive olmaz ve eski çalışan cache silinmez.
- Ekstre PDF/fotoğraf içeriği ağa gönderilmez; okuma cihaz tarafında yapılır.


## Local Data Only 6 – Akıllı Kategoriler
- Hazır kategori kataloğu 50 kategoriye çıkarıldı.
- Kullanılmayan hazır kategoriler Kategoriler ekranında gösterilmez; kullanılmaya başlayınca otomatik görünür.
- Gider ve ekstre önizleme seçimlerinde tüm hazır kategoriler kullanılabilir.
- Ekstre otomatik sınıflandırması Getir/GetirYemek, online alışveriş, abonelik, araç, kargo, seyahat, kişisel bakım ve diğer yaygın işyeri türleri için genişletildi.
