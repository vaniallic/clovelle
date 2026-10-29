-- Jalankan semua ini di Supabase: buka project kamu > SQL Editor > New query > paste > Run

create table if not exists settings (
  id int primary key default 1,
  starting_capital numeric not null default 0,
  constraint single_row check (id = 1)
);
insert into settings (id, starting_capital) values (1, 0) on conflict (id) do nothing;

create table if not exists batches (
  id uuid primary key default gen_random_uuid(),
  name text not null default '',
  date date not null default current_date,
  units_produced numeric not null default 0,
  units_sold numeric not null default 0,
  sell_price numeric not null default 0,
  note text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists purchases (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid not null references batches(id) on delete cascade,
  name text not null default '',
  qty numeric not null default 1,
  price numeric not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists withdrawals (
  id uuid primary key default gen_random_uuid(),
  date date not null default current_date,
  amount numeric not null default 0,
  note text not null default '',
  created_at timestamptz not null default now()
);

-- Nyalain sinkron real-time antar device
alter publication supabase_realtime add table settings, batches, purchases, withdrawals;

-- Keamanan baris (RLS) - diaktifkan tapi dibuka untuk siapa pun yang pegang anon key
-- (akses app-nya sendiri sudah dijagain pakai kata sandi di VITE_APP_PASSWORD)
alter table settings enable row level security;
alter table batches enable row level security;
alter table purchases enable row level security;
alter table withdrawals enable row level security;

create policy "allow all settings" on settings for all using (true) with check (true);
create policy "allow all batches" on batches for all using (true) with check (true);
create policy "allow all purchases" on purchases for all using (true) with check (true);
create policy "allow all withdrawals" on withdrawals for all using (true) with check (true);
