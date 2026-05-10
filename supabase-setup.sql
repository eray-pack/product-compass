-- Run this in Supabase → SQL Editor

-- Profiles
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  name text,
  created_at timestamptz default now()
);

-- Addictions
create table if not exists addictions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  emoji text not null,
  start_date bigint not null,
  total_clean_days int default 0,
  urges_survived int default 0,
  created_at timestamptz default now()
);

-- Relapses
create table if not exists relapses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  addiction_id uuid references addictions on delete cascade not null,
  ts bigint not null,
  note text,
  reframe_shown boolean default false,
  created_at timestamptz default now()
);

-- User state (XP, points, badges, onboarding)
create table if not exists user_state (
  user_id uuid references auth.users on delete cascade primary key,
  points int default 0,
  tree_xp int default 0,
  badges text[] default '{}',
  total_returns int default 0,
  last_login_at bigint default 0,
  onboarding jsonb,
  updated_at timestamptz default now()
);

-- Community messages
create table if not exists community_messages (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  room text not null default 'global',
  content text not null,
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table profiles enable row level security;
alter table addictions enable row level security;
alter table relapses enable row level security;
alter table user_state enable row level security;
alter table community_messages enable row level security;

-- Policies: users can only see/edit their own data
create policy "Users can manage own profile" on profiles for all using (auth.uid() = id);
create policy "Users can manage own addictions" on addictions for all using (auth.uid() = user_id);
create policy "Users can manage own relapses" on relapses for all using (auth.uid() = user_id);
create policy "Users can manage own state" on user_state for all using (auth.uid() = user_id);
create policy "Anyone can read messages" on community_messages for select using (true);
create policy "Users can insert own messages" on community_messages for insert with check (auth.uid() = user_id);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, email, name)
  values (new.id, new.email, new.raw_user_meta_data->>'name');
  insert into user_state (user_id) values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();
