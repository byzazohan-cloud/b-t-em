# HANE V19.4.8 – V36 READ FIX

Ekstre dosyası seçildikten sonra `MAX_STATEMENT_FILE_BYTES` tanımsızlığı nedeniyle okumanın başlamamasına yol açan kritik runtime hatası düzeltildi. Mevcut parser, 66 harcama + 3 ödeme uzlaştırması ve güvenli motor yapısı korundu.


## V38 SAFE STORAGE LOCK düzeltmeleri
- Şifreli normal kayıtlar sıra kuyruğuna alındı; hızlı peş peşe işlemlerde eski kaydın yeni kaydın üstüne yazma riski giderildi.
- PIN değiştirme ve yedek geri yükleme işlemlerine kesinti güvenli işlem günlüğü eklendi. Yarım yazma algılanırsa önceki şifreli veri/meta çifti geri yüklenir.
- OCR hazırlığı Service Worker controller zorunluluğundan çıkarıldı; PDF gibi doğrulanmış paketleri sayfa tarafında hazırlar.
- Kredi kartında fazla ödeme/iade sonucu oluşan alacak bakiyesi artık 0 TL'ye zorlanmaz.
- PDF sayfa sınırı değiştirilmedi; mevcut parser davranışı korunmuştur.
