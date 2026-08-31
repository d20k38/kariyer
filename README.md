# Kayseri Ticaret MTAL Kariyer ve Yönlendirme Portalı v4.0 — Vercel + Supabase

Bu paket, portalı telefon/tablet/PC üzerinden tek internet adresinden kullanmak için hazırlanmıştır.

## Yapı

- `index.html` — mobil uyumlu portal
- `api/` — Vercel Functions
- `api/external-jobs.js` — ana ekrandaki dış iş ilanları servisi
- `api/cron/refresh-external-jobs.js` — günlük dış ilan güncelleme görevi
- `supabase/migration_v4.sql` — mevcut Supabase tablolarına v4 alanlarını ekler
- `vercel.json` — Vercel yapılandırması + günlük cron

## 1. Supabase

Supabase Dashboard > SQL Editor bölümünde `supabase/migration_v4.sql` dosyasını çalıştırın.

Mevcut `teachers`, `students`, `workplace_requests`, `student_applications`, `student_placements` tabloları korunur.

## 2. Vercel Environment Variables

Vercel > Project > Settings > Environment Variables:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`  **GİZLİDİR; HTML içine yazmayın**
- `SESSION_SECRET`  en az 32-64 karakter rastgele bir değer
- `EXTERNAL_JOBS_FEED_URL`  isteğe bağlı; sizin kontrolünüzdeki JSON ilan beslemesi

`SESSION_SECRET` örneği üretmek için: `openssl rand -hex 32`

## 3. Vercel'e yükleme

En kolay yöntem:

1. Bu klasörü GitHub'a yükleyin veya Vercel'e proje olarak import edin.
2. Environment Variables alanlarını girin.
3. Deploy edin.
4. `/api/health` adresinde `ok:true` görünüyorsa Supabase bağlantısı çalışıyor.

## Güvenlik

v4'te koordinatör/yönetim şifre doğrulaması Vercel Function içinde yapılır. Şifre portal HTML'ine gönderilmez. Başarılı girişte 8 saatlik `HttpOnly + Secure + SameSite=Lax` oturum çerezi oluşturulur.

Öğrenci 4 haneli PIN'i veritabanında düz metin tutulmaz; SHA-256 özeti saklanır. Daha yüksek güvenlik istenirse ileride PIN yerine Supabase Auth / OTP kullanılabilir.

## Dış iş ilanları

Portal `/api/external-jobs` üzerinden `external_jobs` tablosunu okur. `EXTERNAL_JOBS_FEED_URL` tanımlanırsa günlük cron bu JSON beslemesinden kayıtları günceller ve 15 günden eski ilanları pasife alır.

Beklenen JSON örneği:

```json
[
  {
    "id":"kayseri-001",
    "title":"Ön Muhasebe Elemanı",
    "company":"Örnek Firma",
    "district":"Melikgazi",
    "source":"İŞKUR",
    "url":"https://...",
    "kind":"ön muhasebe",
    "description":"...",
    "published_at":"2026-08-19T08:00:00+03:00"
  }
]
```

İŞKUR/Kariyer.net/Indeed sayfalarını izinsiz ve kırılgan HTML kazıma ile doğrudan taramak yerine, izin verilen bir API/feed veya okulun kontrolündeki ara besleme kullanılması önerilir.
