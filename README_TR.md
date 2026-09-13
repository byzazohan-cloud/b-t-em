# HANE Premium Clean V3

GitHub Pages için temiz paket. Repository kökünde sadece bu dosyaları tutun.

- index.html
- app-v3.js
- styles.css
- manifest.json
- icons/

Bu sürüm DOM tamamen hazır olmadan dosya inputlarına event bağlamaz; `Cannot set properties of null (setting onchange)` hatası giderildi. Service worker kullanılmıyor, böylece eski cache tekrar devreye girmez.
