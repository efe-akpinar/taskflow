create extension if not exists "pgcrypto";

create table public.boards (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 120),
  created_at timestamptz not null default now()
);

create table public.columns (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references public.boards(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 120),
  position text not null,
  created_at timestamptz not null default now()
);

create table public.cards (
  id uuid primary key default gen_random_uuid(),
  -- board_id is denormalized so RLS can authorize in one hop
  board_id uuid not null references public.boards(id) on delete cascade,
  column_id uuid not null references public.columns(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 240),
  description text,
  start_date date,
  due_date date,
  position text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_columns_board on public.columns(board_id, position);
create index idx_cards_column on public.cards(column_id, position);
create index idx_cards_board on public.cards(board_id);

create or replace function public.touch_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger cards_touch_updated_at
  before update on public.cards
  for each row execute function public.touch_updated_at();

-- RLS
alter table public.boards  enable row level security;
alter table public.columns enable row level security;
alter table public.cards   enable row level security;

-- boards: owner-only
create policy "boards_owner_select" on public.boards
  for select using (owner_id = auth.uid());
create policy "boards_owner_insert" on public.boards
  for insert with check (owner_id = auth.uid());
create policy "boards_owner_update" on public.boards
  for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "boards_owner_delete" on public.boards
  for delete using (owner_id = auth.uid());

-- columns: must belong to a board the user owns
create policy "columns_owner_select" on public.columns
  for select using (
    exists (select 1 from public.boards b where b.id = columns.board_id and b.owner_id = auth.uid())
  );
create policy "columns_owner_insert" on public.columns
  for insert with check (
    exists (select 1 from public.boards b where b.id = columns.board_id and b.owner_id = auth.uid())
  );
create policy "columns_owner_update" on public.columns
  for update using (
    exists (select 1 from public.boards b where b.id = columns.board_id and b.owner_id = auth.uid())
  ) with check (
    exists (select 1 from public.boards b where b.id = columns.board_id and b.owner_id = auth.uid())
  );
create policy "columns_owner_delete" on public.columns
  for delete using (
    exists (select 1 from public.boards b where b.id = columns.board_id and b.owner_id = auth.uid())
  );

-- cards: same one-hop check via denormalized board_id
create policy "cards_owner_select" on public.cards
  for select using (
    exists (select 1 from public.boards b where b.id = cards.board_id and b.owner_id = auth.uid())
  );
create policy "cards_owner_insert" on public.cards
  for insert with check (
    exists (select 1 from public.boards b where b.id = cards.board_id and b.owner_id = auth.uid())
  );
create policy "cards_owner_update" on public.cards
  for update using (
    exists (select 1 from public.boards b where b.id = cards.board_id and b.owner_id = auth.uid())
  ) with check (
    exists (select 1 from public.boards b where b.id = cards.board_id and b.owner_id = auth.uid())
  );
create policy "cards_owner_delete" on public.cards
  for delete using (
    exists (select 1 from public.boards b where b.id = cards.board_id and b.owner_id = auth.uid())
  );
