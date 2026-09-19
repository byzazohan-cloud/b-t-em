# HANE V24 – Ekstre Parser Audit

- JavaScript sözdizimi kontrolü: başarılı.
- Service Worker sözdizimi kontrolü: başarılı.
- update-config.json doğrulaması: başarılı.
- Banka özetinde PDF metin sırası bozulduğunda muhasebe eşitliği ile yeniden doğrulama eklendi.
- Referans Bankkart testi: 15.890,61 + 22.004,59 + 0,00 - 15.933,65 = 21.961,55 doğrulandı.
- Üç kart ödeme satırının toplamı 15.933,65 TL olarak işlem satırlarından doğrulanıyor.
- Harcama toplamında 91,00 TL fazlalık varsa 45,50 TL tekrarlı kümeden tam iki parser kopyasının çıkarılması regresyon testiyle doğrulandı.
- Gerçek aynı gün/aynı tutarlı tekrarlar yalnızca banka harcama toplamına tam uzlaşma varsa azaltılıyor.
- Kart ödemeleri gider listesine değil cardPayments alanına kaydediliyor; aynı tarih/tutar/açıklamadaki gerçek birden fazla ödeme adet bazında korunuyor.
- Para gösterimi 2 kuruş basamağıyla sabit.
- Ekstre özet kutusu dar HANE panelinde iki sütun + tam genişlik dönem borcu şeklinde düzenlendi; taşma engellendi.
- Geliştirme amaçlı parser_test dosyaları final ZIP'ten çıkarıldı.
