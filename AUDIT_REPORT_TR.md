# HANE V11 Ekstre Zekâsı - Audit

- JS sözdizimi: geçti
- Manifest/update JSON: geçti
- Ekstre banka özeti: Devreden Bakiye + Harcamalar + Faiz/Ücret - Ödemeler = Dönem Borcu olarak ayrıştırılıyor.
- Kart ödeme satırları: gider değil cardPayments kaydı olarak işleniyor.
- Taksitli işlem: yalnız ekstreye yansıyan taksit tutarı gider; taksit no/adet bilgisi saklanıyor.
- Önceki aydan devir: harcama olarak eklenmiyor.
- İade: negatif harcama/İADE olarak tutuluyor.
- Aynı ekstre dönemi tekrar içe aktarıldığında önceki ekstre kayıtları değiştiriliyor.
- Banka özeti ile HANE bulunan işlem toplamı ayrı ve anlaşılır gösteriliyor.
- Örnek Bankkart özeti 15.890,61 + 22.004,59 + 0,00 - 15.933,65 = 21.961,55 ayrıştırma testi geçti.
- Örnek otomatik ödeme satırı kart ödemesi olarak tanındı.
- ONUR MRKT -> Market; toplu taşıma -> Ulaşım; GİYİM geçen işyeri -> Giyim.
