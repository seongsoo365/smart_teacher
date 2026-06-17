-- ============================================================
-- 스마트티처 DB 초기화
-- Supabase Dashboard → SQL Editor에서 실행하세요
-- ============================================================

-- ── 1. 회원 프로필 ──────────────────────────────────────────
create table if not exists public.profiles (
  id           uuid references auth.users(id) on delete cascade primary key,
  name         text not null default '학생',
  school_level text not null default 'middle'
                 check (school_level in ('middle', 'high')),
  grade_level  text not null default 'middle-1',
  total_problems int not null default 0,
  total_correct  int not null default 0,
  last_studied   timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ── 2. 단원별 학습 진도 ──────────────────────────────────────
create table if not exists public.topic_progress (
  id                uuid default gen_random_uuid() primary key,
  user_id           uuid references auth.users(id) on delete cascade not null,
  topic_id          text not null,
  basic_attempts    int not null default 0,
  basic_correct     int not null default 0,
  advanced_attempts int not null default 0,
  advanced_correct  int not null default 0,
  applied_attempts  int not null default 0,
  applied_correct   int not null default 0,
  mastery_level     int not null default 0,
  last_studied      timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique(user_id, topic_id)
);

-- ── 3. Row Level Security ────────────────────────────────────
alter table public.profiles      enable row level security;
alter table public.topic_progress enable row level security;

-- profiles: 본인만 조회·수정
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- topic_progress: 본인 데이터만 전체 접근
create policy "progress_all_own" on public.topic_progress
  for all using (auth.uid() = user_id);

-- ── 4. 소셜 로그인 후 프로필 자동 생성 트리거 ─────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      split_part(new.email, '@', 1),
      '학생'
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── 5. updated_at 자동 갱신 ──────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

create trigger topic_progress_updated_at
  before update on public.topic_progress
  for each row execute procedure public.set_updated_at();
