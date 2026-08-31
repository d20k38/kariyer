# v4.0 değişiklikleri

- Personel girişine temel brute-force/rate-limit katmanı eklendi.
- Öğrenci profil, başvuru, işletme talebi ve işletme tercihi uçlarına temel rate-limit eklendi.
- İşletme talebinde e-posta ve kontenjan doğrulaması eklendi.
- İşletme tercihi pasif/olmayan ilanlara kapatıldı.
- Koordinatör başvuru durumları whitelist ile sınırlandı.
- Olumsuz veya zaten yerleştirilmiş başvurunun tekrar yerleştirilmesi engellendi.
- Supabase migration_v4.sql ile DB seviyesinde mükerrer başvuru ve mükerrer aktif yerleştirme engeli eklendi.
- v3'teki istemci tarafı PIN/şifre mantığının yerine server-side API akışı korunmuştur.

## Kurulum
1. Önce `supabase/migration_v3.sql` çalıştırıldıysa ardından `supabase/migration_v4.sql` çalıştırın.
2. Vercel Environment Variables: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SESSION_SECRET`, tercihen `CRON_SECRET`.
3. Deploy sonrası `/api/health` kontrol edin.
