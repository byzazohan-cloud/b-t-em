# Bütçem Premium — Güvenli PWA

Bu sürüm GitHub Pages için hazırlanmıştır.

## Güvenlik
- Finansal veriler AES-GCM 256-bit ile şifrelenir.
- Anahtar uygulama parolasından PBKDF2-SHA256 ile türetilir (310.000 iterasyon).
- Düz metin finansal veri localStorage'a yazılmaz.
- Yedek dosyaları şifreli olarak dışa aktarılır.
- Uygulama belirlenen süre sonunda otomatik kilitlenir ve kilitte çözülen veri bellekten bırakılır.
- Arka plana geçince uygulama içeriği gizlilik perdesiyle kapatılır.
- Harici script, font, reklam, analitik veya ağ servisi kullanılmaz.
- Kredi kartı için yalnızca son 4 hane tutulur; tam kart numarası/CVV/banka şifresi kaydedilmemelidir.

## İlk giriş
İlk demo parola: `1234`

İlk girişte uygulama en az 8 karakterli yeni parola belirlemenizi ister. Bu yeni parolayı unutursanız şifreli veriler geri açılamaz.

## GitHub Pages
Dosyaların tamamını repository köküne yükleyin. Settings > Pages > Deploy from a branch > main / root seçin.
