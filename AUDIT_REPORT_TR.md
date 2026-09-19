# HANE LOCAL DATA ONLY 5 - EKSTRE PARSER DENETİMİ

- Çok satırlı PDF/OCR ekstreleri için işlem blokları yeniden yazıldı.
- Tarih, işyeri ve tutar farklı satırlarda olsa bile tek işlem olarak birleştirilir.
- Aynı işlemde iki tarih (işlem/provizyon) desteklenir; ilk tarih işlem tarihi olarak korunur.
- Döviz tutarı + TL karşılığı birlikteyse TL tutarı tercih edilir.
- İade/iptal ve sondan eksi işaretli tutarlar korunur.
- PDF text katmanı çok sayıda tarih içerip az işlem çıkarırsa otomatik OCR karşılaştırması yapılır; daha çok gerçek işlem bulan sonuç kullanılır.
- 70 işlemlik çok satırlı ve tek satıra düzleşmiş sentetik testlerde 70/70 işlem bulundu.
- 35 adet çift tarihli işlem testinde 35/35 bulundu.
- JS/JSON kontrolleri, duplicate function kontrolü ve outbound runtime API kontrolü geçti.
