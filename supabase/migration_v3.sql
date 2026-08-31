-- Kayseri Ticaret MTAL Kariyer ve Yönlendirme Portalı v3.0
-- Mevcut portal tablolarını bozmadan v3 için gerekli alanları ekler.
-- Supabase SQL Editor içinde bir kez çalıştırın.

create extension if not exists pgcrypto;

-- Öğrenci / mezun alanları
alter table if exists students add column if not exists student_no text;
alter table if exists students add column if not exists pin_hash text;
alter table if exists students add column if not exists candidate_kind text default 'Öğrenci';
alter table if exists students add column if not exists target_area text default 'Muhasebe';
alter table if exists students add column if not exists scales_json jsonb default '{}'::jsonb;
alter table if exists students add column if not exists status text default 'Aktif aday';
create unique index if not exists students_student_no_unique on students(student_no) where student_no is not null and student_no <> '';

-- İşyeri ilan alanları
alter table if exists workplace_requests add column if not exists email text;
alter table if exists workplace_requests add column if not exists skill_levels jsonb default '{}'::jsonb;
alter table if exists workplace_requests add column if not exists status text default 'Aktif';

-- Başvuru / yerleştirme alanları
alter table if exists student_applications add column if not exists student_id text;
alter table if exists student_applications add column if not exists source text default 'Aday';
alter table if exists student_applications add column if not exists teacher text;
alter table if exists student_applications add column if not exists created_at timestamptz default now();
alter table if exists student_placements add column if not exists created_at timestamptz default now();

-- Dış kaynak iş ilanları
create table if not exists external_jobs (
  id text primary key,
  title text not null,
  company text,
  district text default 'Kayseri',
  source text,
  url text not null,
  kind text default 'muhasebe',
  description text,
  published_at timestamptz default now(),
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists external_jobs_active_date_idx on external_jobs(is_active,published_at desc);

-- Vercel Functions SERVICE ROLE ile erişir. Tarayıcıdan kişisel tabloları doğrudan açmayın.
alter table if exists students enable row level security;
alter table if exists workplace_requests enable row level security;
alter table if exists student_applications enable row level security;
alter table if exists student_placements enable row level security;
alter table if exists external_jobs enable row level security;

-- Önceden tanımlanmış geniş anon politikaları varsa aşağıdaki örnek isimlerle çakışmaz.
-- v3 istemcisi kişisel veriye doğrudan Supabase'den erişmez; server-side service role kullanır.

-- Dış ilanlara salt-okunur anon izin verilebilir (zorunlu değil; portal API üzerinden okur).
drop policy if exists "v3 external jobs public read" on external_jobs;
create policy "v3 external jobs public read" on external_jobs for select using (is_active = true);

-- Öğretmen tablosu mevcut eski portaldan gelir.
-- Güvenliği artırmak için öğretmen şifresini SHA-256 olarak saklamak isterseniz:
-- update teachers set password='sha256:' || encode(digest('YENI_SIFRE','sha256'),'hex') where name='ÖĞRETMEN ADI';

-- Eski student_applications kayıtlarında student_id boşsa ad+sınıf üzerinden eşleştirmeyi deneyin.
update student_applications a
set student_id=s.id
from students s
where (a.student_id is null or a.student_id='')
  and lower(trim(a.student_name))=lower(trim(s.name))
  and lower(trim(coalesce(a.student_class,'')))=lower(trim(coalesce(s.class_name,'')));

-- Eski özelliklerden v3 skill_levels üretimi (yalnızca boş olanlarda).
update workplace_requests
set skill_levels = coalesce((
  select jsonb_object_agg(split_part(x,':',1), (split_part(x,':',2))::int)
  from unnest(coalesce(features,array[]::text[])) x
  where x ~ ':.+(25|50|75|100)$' or x ~ ':(25|50|75|100)$'
),'{}'::jsonb)
where skill_levels is null or skill_levels='{}'::jsonb;
