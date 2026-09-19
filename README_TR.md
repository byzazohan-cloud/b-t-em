# HANE 19.4.8 — LOCAL DATA ONLY V29 FORCE UPDATE ISOLATED

Bu sürüm V28 üzerine hazırlanmıştır.

- Normal Service Worker güncellemesi yalnız HANE scope'una uygulanır.
- Zorunlu güncelleme de yalnız HANE scope'undaki Service Worker kaydını kaldırır.
- Cache temizliği yalnız `hane-*` cache'leriyle sınırlıdır.
- Ekstre motoru build handshake ve single-flight hazırlama korunur.
- Kişisel ekstre/veri tarayıcı dışına gönderilmez.
