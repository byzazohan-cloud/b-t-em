# HANE iOS v0.5 — FINAL PREMIUM TEST SÜRÜMÜ

Bu sürümde kullanıcıyla seçilen tasarım dili çalışan uygulamaya uygulandı.

## Tasarım
- Siyah ağırlıklı premium görünüm.
- Altın rengi yalnızca çok küçük vurgu detaylarında kullanılır.
- Ana ekran; büyük halka grafik, GELİR/GİDER/KALAN karşılaştırmaları ve kompakt bölüm kartlarından oluşur.
- Emoji yok. Tutarlı premium Ionicons ikon sistemi kullanılır.
- Aktif alt menü altın tonuyla vurgulanır.
- Fatura ikonları küçük ve sade tutulur.
- Kartlar ve iç ekranlar aynı siyah-premium tasarım sistemine bağlandı.

## Ana ekran
- GELİR / GİDER / KARTLAR / FATURALAR / SABİT GİDERLER / HATIRLATMALAR.
- Ana ekranda hızlı ekleme butonu yok.
- Ana ekranda büyük ödeme alarm kutusu yok.
- Alarm sayısı bildirim ikonunda ve HATIRLATMALAR bölümünde görülür.
- GELİR / GİDER / KALAN altında geçen aya göre karşılaştırma vardır.
- SON İŞLEMLER özeti vardır.

## Bölüm mantığı
- GELİR'e gir → ekle / düzenle / sil.
- GİDER'e gir → gider veya harçlık ekle / düzenle / sil.
- KARTLAR'a gir → KART EKLE / HARCAMA EKLE.
- Kart harcamasına KAMERA veya FOTOĞRAF eklenebilir.
- FATURALAR'a gir → ekle / düzenle / sil / ödendi / kamera / fotoğraf.
- SABİT GİDERLER → ekle / düzenle / sil / ödendi.
- HATIRLATMALAR → ödeme alarmı + özel hatırlatmalar.
- Her kayıt sonradan düzenlenebilir veya silinebilir.
- Kart ve sabit gider AKTİF / PASİF durumu düzenlenebilir.

## Bugün hangi kart?
Ana sayfadan kaldırıldı; KARTLAR ekranına taşındı.
Aktif kartlar arasından tahmini en uzun ödeme süresini veren kartı gösterir.

## Analiz
GÜN / HAFTA / AY / YIL:
- Son 7 gün
- Son 6 hafta
- Son 6 ay
- Son 5 yıl

Seçime göre:
- GELİR
- GİDER
- KALAN
- GELİR/GİDER grafiği
- Gider dağılımı

otomatik değişir.

## Gizlilik
- HANE sunucusu yok.
- Supabase yok.
- Kişisel finans kayıtları cihazda kalır.
- Fotoğraf/belgeler test sürümünde HANE'nin yerel kaydına eklenir.
- Yedekleme kullanıcı tarafından manuel başlatılır.
- Aylık JSON, tüm veri JSON ve CSV dışa aktarma vardır.

## Alarm
Ücretsiz web/PWA testinde HANE açıldığında uygulama içi ödeme uyarıları çalışır.
Uygulama kapalıyken gerçek iPhone yerel bildirimi, Apple Developer / native iOS aşamasında eklenecektir.
Bu bildirimler de bulutsuz, cihaz içi olacaktır.

## Çalıştırma
ZIP'i ayıkla ve `BASLAT_HANE.bat` dosyasına çift tıkla.

Manuel:
```powershell
npm.cmd install
npm.cmd run web
```

v0.1–v0.4 yerel verileri v0.5'e otomatik taşınmaya çalışılır.


## v0.5.2 ekleri
- 4 haneli PIN kilidi eklendi.
- PIN SHA-256 özeti olarak yerelde tutulur.
- Ayarlar > Güvenlik: PIN değiştirilebilir, kilitlenebilir veya kapatılabilir.
- iPhone PWA build sırası düzeltildi.
- Build hatasında HANE_BUILD_LOG.txt otomatik oluşur.
- Offline service worker kurulumu güçlendirildi.


## v0.5.5 Güvenlik ve düzenleme
Kayıt satırına dokunarak düzenleme açılır. Web/PWA yerel finans verileri PIN tabanlı AES-256-GCM ile şifrelenir. JSON/CSV dışa aktarımları şifreli değildir; güvenli saklayın.


## v0.5.6 — Şifreli yedek

HANE v0.5.6 — ŞİFRELİ YEDEK

- Aylık ve tüm veri yedekleri artık .hane uzantılıdır.
- Yedek içerikleri AES-256-GCM ile şifrelenir.
- Anahtar, o anda kullandığın 4 haneli HANE PIN'inden PBKDF2-SHA256 ile türetilir (310.000 iterasyon).
- Yedek dosyasını metin editörüyle açan biri finans verilerini okuyamaz.
- Geri yükleme için yedeği oluşturduğun PIN gerekir.
- PIN'i daha sonra değiştirirsen eski yedekler eski PIN ile korunmaya devam eder.
- CSV dışa aktarma bilerek okunabilir formatta kalır; CSV güvenli yedek değildir.
