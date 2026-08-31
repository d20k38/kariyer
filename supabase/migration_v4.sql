-- Kayseri Ticaret MTAL Kariyer Portalı v4.0 güvenlik/veri bütünlüğü ekleri
-- migration_v3.sql sonrasında bir kez çalıştırın.

-- Aynı adayın aynı ilana aynı kanaldan tekrar başvurmasını DB seviyesinde engeller.
create unique index if not exists student_applications_job_student_source_unique
on student_applications(request_id, student_id, source)
where student_id is not null and source is not null;

-- Bir adayın aynı anda birden fazla kesin yerleştirmeye sahip olmasını DB seviyesinde engeller.
create unique index if not exists student_placements_one_active_per_student_unique
on student_placements(student_id)
where status='Yerleştirildi' and student_id is not null;

create index if not exists student_applications_job_status_idx
on student_applications(request_id,status,created_at desc);

create index if not exists student_placements_student_status_idx
on student_placements(student_id,status,created_at desc);

-- Portal API service-role kullandığı için kişisel tablolar tarayıcıdan doğrudan açılmamalıdır.
alter table if exists students enable row level security;
alter table if exists workplace_requests enable row level security;
alter table if exists student_applications enable row level security;
alter table if exists student_placements enable row level security;

-- NOT: v4 uygulama katmanında rate-limit vardır. Vercel/Upstash gibi kalıcı rate-limit
-- kullanımı daha yüksek trafikte ayrıca önerilir.

-- v4.1 süreç yönetimi için ilan durumuna göre sorgu performansı
create index if not exists workplace_requests_status_created_idx
on workplace_requests(status,created_at desc);
