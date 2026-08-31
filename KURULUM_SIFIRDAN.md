# Kayseri Ticaret Kariyer Portalı v4.1 — Sıfırdan Kurulum

## Supabase sırası

1. Yeni/boş Supabase projesi oluşturun.
2. SQL Editor > New query açın.
3. `supabase/00_BASE_SCHEMA.sql` dosyasının tamamını çalıştırın.
4. Başarılıysa `supabase/migration_v3.sql` dosyasının tamamını çalıştırın.
5. Başarılıysa `supabase/migration_v4.sql` dosyasının tamamını çalıştırın.
6. Table Editor'da şu tabloları kontrol edin: `teachers`, `students`, `workplace_requests`, `student_applications`, `student_placements`, `external_jobs`.

## İlk personel hesabı

- Koordinatör / öğretmen: `Koordinatör`
- Yönetici: `Yönetici`
- Geçici şifre: `123456`

İlk girişten sonra daha güçlü şifre kullanılması önerilir. Uygulama şifreleri SHA-256 özetiyle doğrular.

## Vercel Environment Variables

`.env.example` içindeki adları birebir kullanın:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SESSION_SECRET`
- `EXTERNAL_JOBS_FEED_URL` (isteğe bağlı)

`SUPABASE_SERVICE_ROLE_KEY` yalnızca Vercel Environment Variables içinde tutulmalıdır; GitHub'a veya HTML/JS içine yazılmamalıdır.

## Vercel

GitHub repository'sini Vercel'e import edin, Environment Variables'ı ekleyin ve Deploy yapın.

Sonra:

`https://SİTENİZ.vercel.app/api/health`

adresini açın. `ok: true` dönmelidir.

## Önemli

`students does not exist` gibi hata alırsanız migration dosyalarını tekrar tekrar çalıştırmayın. Önce `00_BASE_SCHEMA.sql` başarılı şekilde çalışmış olmalıdır.

## Vercel Hobby plan notu
Bu sürüm API uçlarını tek bir catch-all Serverless Function altında toplar. Böylece Vercel Hobby planındaki 12 Serverless Function sınırına takılmaz. API kaynak kodları `server/` altında, tek Vercel Function ise `api/[...path].js` dosyasındadır.
