-- Add a users table to store wallet-related app data
create table public.users (
  id uuid default gen_random_uuid() primary key,
  wallet_address text unique not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  last_login_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Optional user preferences
  preferences jsonb default '{}'::jsonb,
  
  -- Constraints
  constraint wallet_address_format check (wallet_address ~* '^0x[a-f0-9]{40}$')
);

-- Enable Row Level Security
alter table public.users enable row level security;

-- Policy: Users can read their own data
create policy "Users can view own data"
  on public.users for select
  using (wallet_address = current_setting('request.jwt.claim.wallet_address', true));

-- Policy: Users can update their own data
create policy "Users can update own data"
  on public.users for update
  using (wallet_address = current_setting('request.jwt.claim.wallet_address', true));

-- Policy: Anyone can insert (for first-time sign-in)
create policy "Anyone can create user"
  on public.users for insert
  with check (true);

-- Update conversations table to link with wallet addresses (optional)
alter table public.conversations
  add column wallet_address text;

-- Add index for faster lookups
create index conversations_wallet_address_idx on public.conversations(wallet_address);

-- Policy: Users can only see their own conversations
create policy "Users can view own conversations"
  on public.conversations for select
  using (
    wallet_address = current_setting('request.jwt.claim.wallet_address', true)
    or wallet_address is null  -- Allow viewing conversations without wallet link (backward compatibility)
  );
