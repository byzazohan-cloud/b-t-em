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
