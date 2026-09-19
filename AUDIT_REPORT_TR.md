# V36 Audit

- Kritik runtime hata: `MAX_STATEMENT_FILE_BYTES` artık tanımlı.
- Dosya seçimi sonrası `readStatementFile()` boyut kontrolünden geçebilir.
- Doğru Service Worker fast-path korunur; yanlış worker için bekleme üst sınırı 5 saniyeye indirildi.
- Parser ve banka özeti uzlaştırması değiştirilmedi.
