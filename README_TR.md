# HANE Premium Clean V3

GitHub Pages için temiz paket. Repository kökünde sadece bu dosyaları tutun.

- index.html
- app-v3.js
- styles.css
- manifest.json
- icons/

Bu sürüm DOM tamamen hazır olmadan dosya inputlarına event bağlamaz; `Cannot set properties of null (setting onchange)` hatası giderildi. Service worker kullanılmıyor, böylece eski cache tekrar devreye girmez.

## V4 Tasarım düzeltmesi
Çalışan V3 JavaScript altyapısı değiştirilmedi. Yalnızca onaylanan tam siyah + az ama belirgin gold premium görsel diline göre CSS yeniden düzenlendi. iPhone ekranı, grafik, önerilen kart ve alt menü oranları iyileştirildi.


## V5 Kayıt düzeltmesi
Gelir/Gider/Kart formlarında Kaydet işlemi await + hata yakalama ile sağlamlaştırıldı. Başarılı kayıt mesajı ve depolama hatası bildirimi eklendi. Tasarım değiştirilmedi.


## V6 Kaydet düzeltmesi
Form submit bağlayıcılarında paylaşılan değişken kullanımı kaldırıldı. Her form artık `event.currentTarget` ile kendi formunu kaydeder. Tasarım değiştirilmedi.


## V7 Tema Stüdyosu
Renkler Kaydet düğmesine basmadan uygulamaya uygulanmaz. Önizleme taslak üzerinde çalışır. Varsayılana Dön siyah + gold varsayılanını yalnızca önizlemeye getirir; Kaydetmeden kalıcı olmaz. İptal değişiklikleri atar.

## V8 — Harcanan / Ödenen + düşük pil tüketimi
- Ana ekrana “Bu Ay Harcanan” ve “Bu Ay Ödenen” ayrımı eklendi.
- Kart harcaması yapıldığı ayın giderine eklenir.
- Kart ödemesi ikinci kez gider sayılmaz; “Bu Ay Ödenen” ve Hareketler içinde borç kapatma olarak görünür.
- Kartın hesap kesim tarihi, harcamanın hangi ekstreye ait olduğunu arka planda hesaplar.
- Kart ekranına Harcama Ekle ve Ödeme Yap eklendi.
- Uygulama arka planda sürekli sorgulama yapmaz; GPS kullanmaz; kamera yalnızca kullanıcı açınca çalışır; grafik yalnızca rapor ekranında çizilir.
- Hareketli efektler minimumdur ve cihazın azaltılmış hareket tercihine uyar.

## V9
- Ayarlar > Tema Stüdyosu satırı doğrudan `openTheme` aksiyonuna bağlandı; tıklama güvenilir hale getirildi.
- “Bu Ay Harcanan / Bu Ay Ödenen” kartı yaklaşık %20–25 daha kompakt yapıldı.
- Ana siyah + gold tasarım ve diğer yerleşimler değiştirilmedi.


## V10
Tema Stüdyosu değişken hatası giderildi. Kart ödeme süresi gerçek ekstre takvimine göre düzeltildi. Kartlar ve butonlar küçültüldü. Görünen/metin girişleri büyük harf yapıldı. iPhone autocorrect/autocomplete açık. Hareket filtreleri ve Gün/Hafta/Ay/Yıl rapor seçimleri çalışır.

## V11
- Kredi kartı Hesap Kesim ve Son Ödeme artık takvimden gerçek tarih olarak seçilir.
- HANE bu tarihleri sonraki aylara aynı günlerle otomatik taşır.
- Normal Gider Ekle ekranından Son Ödeme kaldırıldı; yalnız Harcama Tarihi var.
- Sabit gider/fatura için ayrı form ve Ödeme Tarihi var.
- Kira, Aidat, İnternet, Elektrik, Su, Doğalgaz, Cep Telefonu sabit gider mantığındadır.
- Kart Ekle ve Gider Ekle aksiyonları belirgin buton oldu.
- Siyah + gold tasarım korunmuştur.
