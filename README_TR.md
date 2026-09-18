# HANE 19.4.8 — Grup 2: Aylık Sistem ve Tarih Mantığı

Bu paket Grup 1 finansal çekirdeğin üzerine Grup 2 güncellemesini ekler.

Eklenen/düzeltilenler:
- Seçili ay kalıcı ve geçerli biçimde korunur.
- Giderler, Hareketler ve Raporlar ekranlarında önceki ay / sonraki ay / bugün kontrolü vardır.
- Normal giderler gerçek işlem tarihine göre doğru aya yazılır.
- Sabit gider ödemeleri gerçek ödeme tarihine göre aylık gider ve özel tarih aralığı raporlarına girer.
- Geçmiş ayda “Ödedim” denilen sabit giderin ödeme tarihi artık bugüne değil, seçilen aya göre oluşturulur.
- Kategori toplamları Giderler ekranında seçili aya göre hesaplanır.
- Kategori ayrıntısı Raporlar içinden açılırsa seçili rapor tarih aralığını, Giderler içinden açılırsa seçili ayı kullanır.
- Özel tarih aralığında başlangıç ve bitiş tarihi zorunludur.
- Takvimde ay değiştirildiğinde ana seçili ay da senkron kalır.
- Mevcut 19.4.8 ve Grup 1 verileri korunur; veri sıfırlama yapılmaz.

Finansal temel kural değişmez: HANE, evin gerçekte ne kadar para harcadığını gösterir.
