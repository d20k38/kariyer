# v4.1 — Süreç Takibi ve Koordinatör Yönetimi

- Öğrenci/mezun, Öğrenci No/Kod + PIN ile başvurularının durumunu görebilir.
- Başvuru ekranında işyeri, pozisyon, durum ve koordinatör notu gösterilir.
- Kesin yerleştirmeler ayrıca gösterilir.
- Koordinatör, işyerlerini Aktif/Pasif yapabilir.
- Pasif ilanlara yeni öğrenci veya işletme tercihi alınmaz.
- İlan durumları için DB indeks desteği eklendi.

## Yeni API
`POST /api/student-status`

## Kurulum
v4 migration zaten çalıştırıldıysa ek SQL kısmını bir kez çalıştırın; dosyanın tamamını tekrar çalıştırmak da güvenlidir (`IF NOT EXISTS` kullanılmıştır).
