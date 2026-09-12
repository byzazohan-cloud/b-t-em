# HANE Premium V1

Bu paket sıfırdan hazırlanmış, GitHub Pages'e doğrudan yüklenebilen iPhone uyumlu bir PWA'dır.

## İçindekiler
- İlk kurulum: profil resmi, isim, 4-6 haneli PIN
- AES-256-GCM şifreli yerel veri
- Ana ekran: günlük söz, gelir/gider/kalan halka grafik
- Gün / hafta / ay / yıl rapor görünümü
- Gelir, gider, sabit gider, kart ve kart harcaması ekle/düzenle/sil
- Geçmiş ay kayıtlarını düzenleme
- Sabit emekli maaşı ve sabit giderlerin yeni aylara otomatik taşınması
- Kira, aidat, internet, elektrik, su, doğalgaz, cep telefonu vb. kategoriler
- Ödendi / ödenmedi takibi
- Kredi kartı limit/borç/hesap kesim/son ödeme bilgileri
- Hesap kesim tarihine göre önerilen kart
- Kamera veya galeriden fiş fotoğrafı ekleme
- Şifreli `.hane` yedek oluşturma ve geri yükleme
- 15 dakika varsayılan otomatik kilit; profil ekranından değiştirilebilir
- Uygulama içi ödeme uyarıları
- Bildirim izni verilirse uygulama açıldığında yaklaşan ödeme bildirimi

## iPhone bildirimi hakkında
Sunucusuz ve ücretsiz PWA olduğu için uygulama tamamen kapalıyken kesin zamanlı arka plan bildirimi garanti edilemez. iOS'ta Ana Ekrana eklenen PWA web bildirimlerini destekler; HANE açıldığında yaklaşan ödemeleri kontrol eder.

## Fiş okuma hakkında
Kamera/galeri ile fiş fotoğrafı eklenir ve kayda bağlanır. iPhone Safari'de güvenilir cihaz-içi OCR standart olmadığı için tutar/tarih alanı manuel onaylanır; fotoğraf dış servise gönderilmez.

## GitHub Pages kurulumu
1. ZIP'i açın.
2. İçindeki `index.html`, `app.js`, `styles.css`, `manifest.json`, `sw.js`, `icons` klasörü ve diğer dosyaları repository köküne yükleyin.
3. Settings > Pages > Deploy from a branch > main > /(root).
4. iPhone Safari'de siteyi açın > Paylaş > Ana Ekrana Ekle.
