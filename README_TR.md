# HANE 19.4.8 — Grup 3: Kart / Nakit / Ekstre

Bu paket G2.5 üzerine Grup 3 güncellemesini ekler. Mevcut veriler korunur.

Eklenenler:
- Giderler ekranında seçili ay için Toplam Nakit Harcama ve Toplam Kredi Kartı Harcama özetleri.
- Özet kartlarına dokununca toplamı oluşturan gerçek gider hareketleri açılır.
- Her kartta EKSTRE butonu.
- Ekstrede aylar arasında ileri/geri gezinme.
- Harcamalar, sabit gider kart ödemeleri, kart ödemeleri ve kalan güncel borç birlikte gösterilir.
- Ekstre hareketlerinden doğrudan düzenleme/silme akışına geçilir.
- Kart adı ödeme yönteminde açıkça gösterilir.
- Kart borcu ayrı bir kopya kayıt üzerinden değil mevcut merkezi yeniden hesaplama mantığı üzerinden korunur.
- Geçmiş ay sabit gider kart ödemesi ekstre içinden düzenlenirken tam ilgili ödeme kaydı açılır.

Finansal temel kural: HANE, evin gerçekte ne kadar para harcadığını gösterir.


G3.1
- Kredi kartinin tamami tiklanabilir; karta dokununca dogrudan aylik ekstre acilir.
- Kart icindeki Harcama/Odeme/Ekstre/Duzenle butonlari kendi islevlerini korur.
- Giderler ekranindaki Toplam Nakit Harcama ve Toplam Kredi Karti Harcama kartlari telefonda da yan yana kalir.


## G4 - Hane Üyesi Sistemi
- Gider ve sabit gider formlarına isteğe bağlı Hane Üyesi seçimi eklendi.
- Doğrudan kredi kartı harcamalarında da Hane Üyesi seçilebilir.
- Üye seçilmeyen kayıtlar Hane Geneli / Atanmamış altında tutulur.
- Hane Üyeleri ekranında seçili aya göre kişi toplamı, nakit/kart kırılımı ve hareket sayısı gösterilir.
- Üyeye dokununca hareketleri açılır; kayıtlar Düzenle/Sil yapılabilir.
- Üye silinirse bağlı kayıtlar silinmez, Atanmamış durumuna geçer.
- Mevcut veriler korunur.
