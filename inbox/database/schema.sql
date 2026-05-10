create table conversations (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  source_user_id text,
  source_username text,
  customer_name text,
  status text default 'new',
  last_message text,
  created_at timestamp default now()
);

create table messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references conversations(id),
  sender text,
  source text,
  content text,
  created_at timestamp default now()
);

create table instagram_comments (
  id uuid primary key default gen_random_uuid(),
  comment_id text,
  post_id text,
  username text,
  message text,
  processed boolean default false,
  created_at timestamp default now()
);

create table automations (
  id uuid primary key default gen_random_uuid(),
  channel text,
  trigger_keyword text,
  response_message text,
  active boolean default true
);