-- Create push_subscriptions table
create table public.push_subscriptions (
  id uuid not null default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  subscription_data jsonb not null,
  endpoint text not null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  
  -- Ensure one subscription per user
  unique(user_id)
);

-- Enable RLS
alter table public.push_subscriptions enable row level security;

-- Create policies for regular users
create policy "Users can view own subscriptions" 
  on public.push_subscriptions for select 
  using (auth.uid() = user_id);

-- Create policies for service role (bypass RLS for server actions)
create policy "Service role can manage all push subscriptions" 
  on public.push_subscriptions 
  for all 
  using (auth.role() = 'service_role');

-- Create function to automatically update updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create trigger for updated_at
create trigger update_push_subscriptions_updated_at
  before update on public.push_subscriptions
  for each row execute function update_updated_at_column();
