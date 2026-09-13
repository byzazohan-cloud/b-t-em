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


## V12
- Gider Ekle tek ekran: NORMAL GİDER / SABİT GİDER.
- Normal gider seçilirse yalnız HARCAMA TARİHİ görünür.
- Sabit gider seçilirse yalnız sabit kategori listesi ve SON ÖDEME TARİHİ görünür.
- Önerilen kartta gösterilen gün sayısı HESAP KESİM → SON ÖDEME arasındaki gerçek farktır.
- Uygulama Ayarları içindeki KARANLIK MOD kaldırıldı.
- Profil resmi büyütüldü; profil ekranına PROFİLİ DÜZENLE butonu eklendi.
- İsim ve profil resmi düzenlenebilir.
- Siyah + gold ana tasarım değiştirilmedi.


## V13
- Aynı kategoriden birden fazla sabit gider desteklenir. Örn. CEP TELEFONU · HAT 1 / HAT 2 / HAT 3 / HAT 4.
- Önerilen Kart bölümündeki TÜMÜNÜ GÖR doğrudan KARTLAR sekmesine gider.
- Kart stili seçenekleri artırıldı: BLACKGOLD, TITANIUM, BLUE, BURGUNDY, GREEN, PURPLE, SILVER.
- Ayrıntılı grafiğin altında GELİR / GİDER / KALAN renk açıklaması gösterilir.
- Günün sözü yerel güne göre her gün otomatik değişir.
- Profil motto alanı günlük sözden bağımsızdır.

## V14 — Yalnız Ana Sayfa Üst Alanı
- V13 özelliklerinin tamamı korunmuştur.
- Yalnız ana sayfanın üst alanı değiştirildi.
- Küçük üst-bar profil fotoğrafı kaldırıldı.
- Profil fotoğrafı ana başlıkta büyütüldü ve sola alındı.
- Sağında MERHABA / PROFİL ADI / TARİH gösterilir.
- HANE başlığı, ayar ve bildirim düğmeleri korunur.
- BUGÜNÜN SÖZÜ ve onun altındaki bütün ekran yapısı/değerler/fonksiyonlar değiştirilmemiştir.

## V15
- Kartlar sekmesindeki bütün kartlar daha kompakt hale getirildi.
- Ana ekrandaki önerilen kart daha küçük tutuldu.
- Önerilen kart, Kartlarım bölümünde seçilen kart stilini kullanır.
- Harcama Ekle / Ödeme Yaptım düğmeleri daha kompakt.
- Hızlı İşlemler düğmeleri ve ikonları biraz küçültüldü.
- V14 ana ekran üst alanı ve diğer tasarım/işlevler korunmuştur.

## V16
- V15'te yanlış hedeflenen mini kart sınıfı düzeltildi.
- Ana ekrandaki gerçek `miniCard` küçültüldü.
- Önerilen kart artık seçilen kartın stilini gerçekten miras alır.
- Kartlar sekmesindeki kredi kartları belirgin şekilde daha kompakt.
- Harcama Ekle / Ödeme Yaptım butonları küçültüldü.
- Hızlı İşlemler butonları ve ikonları belirgin şekilde küçültüldü.
- Ana tasarımın geri kalanına dokunulmadı.


## V17 — Native iPhone Görünümü
V16 kilitli tasarım, yerleşim, kart ölçüleri ve siyah + gold stil korunmuştur.

Yalnızca uygulama hissi güçlendirildi:
- iPhone safe-area ve standalone PWA davranışı iyileştirildi.
- Ana ekrana eklendiğinde içerik tam uygulama yüksekliğinde çalışır.
- Üst bar ve alt tab bar iOS benzeri blur/sabit yüzey davranışı kazanır.
- Buton/tab dokunma geri bildirimi eklendi.
- Modal alt-sheet ve scroll davranışı native uygulamaya yaklaştırıldı.
- Scrollbar ve Safari web-sayfası hissi azaltıldı.
- Form kontrollerinin iOS görünümü sadeleştirildi.
- İş mantığına ve V16 tasarımına dokunulmadı.

## V18 — iPhone Yedek Geri Yükleme Düzeltmesi
- Yedek dosya seçicide `.hane` / MIME filtresi kaldırıldı.
- iPhone Dosyalar uygulamasında HANE yedeği görünür hale gelir.
- Dosya uzantısı yerine içerik doğrulanır.
- Yalnız geçerli `HANE-LOCKED-BACKUP` yedekleri geri yüklenir.
- Bozuk/yanlış dosya seçilirse açık hata mesajı gösterilir.
- Aynı yedek dosyası tekrar seçilebilir.
- V17 native görünüm ve V16 kilitli tasarım korunmuştur.


## V19
- V18 BACKUP FIX temel alındı.
- V5 HANE amblemi.
- Klasik premium parola ekranı ve ince TAMAM.
- BU AY HARCANAN / BU AY ÖDENEN tutarlı butonları ve grafikli detay ekranları.
- Sabit giderlerde ÖDEDİM / yeşil tik ve sürükle-bırak sıralama.
- Profil fotoğrafında zoom/kadraj.
