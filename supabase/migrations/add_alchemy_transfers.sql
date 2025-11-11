-- Table to store wallet transfer activity from Alchemy
create table public.wallet_transfers (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Transaction details
  transaction_hash text unique not null,
  block_number bigint not null,
  timestamp timestamp with time zone not null,
  
  -- Transfer details
  from_address text not null,
  to_address text not null,
  value numeric not null, -- Amount transferred in wei
  value_usd numeric, -- USD value at time of transfer
  
  -- Token/Asset details
  asset_symbol text not null, -- e.g., 'ETH', 'USDC', 'BTC'
  asset_address text, -- null for native ETH
  token_decimals integer default 18,
  
  -- Wallet classification
  from_wallet_type text, -- 'whale', 'exchange', 'smart_money', 'normal'
  to_wallet_type text,
  
  -- Analysis metadata
  is_significant boolean default false, -- Large transfers worth analyzing
  transfer_direction text, -- 'inflow', 'outflow', 'exchange_to_wallet', 'wallet_to_exchange'
  
  -- Network
  chain_id integer not null, -- 1 for Ethereum, 8453 for Base, etc.
  network text not null, -- 'ethereum', 'base', 'polygon', etc.
  
  -- Indexes for fast queries
  constraint valid_direction check (transfer_direction in ('inflow', 'outflow', 'exchange_to_wallet', 'wallet_to_exchange'))
);

-- Indexes for performance
create index wallet_transfers_timestamp_idx on public.wallet_transfers(timestamp desc);
create index wallet_transfers_from_address_idx on public.wallet_transfers(from_address);
create index wallet_transfers_to_address_idx on public.wallet_transfers(to_address);
create index wallet_transfers_asset_symbol_idx on public.wallet_transfers(asset_symbol);
create index wallet_transfers_significant_idx on public.wallet_transfers(is_significant) where is_significant = true;
create index wallet_transfers_chain_idx on public.wallet_transfers(chain_id, network);

-- Enable Row Level Security
alter table public.wallet_transfers enable row level security;

-- Policy: Anyone can read transfer data (public blockchain data)
create policy "Transfer data is public"
  on public.wallet_transfers for select
  using (true);

-- Policy: Only service role can insert (from Alchemy webhook)
create policy "Service can insert transfers"
  on public.wallet_transfers for insert
  with check (true);


-- Table to track whale wallets we're monitoring
create table public.whale_wallets (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Wallet details
  address text unique not null,
  label text, -- e.g., 'Binance Hot Wallet', 'Vitalik', 'Unknown Whale #1'
  wallet_type text not null, -- 'whale', 'exchange', 'smart_money'
  
  -- Balance tracking
  last_known_balance numeric,
  last_known_balance_usd numeric,
  
  -- Activity metrics
  total_transfers_24h integer default 0,
  total_volume_24h_usd numeric default 0,
  
  -- AI insights
  trading_pattern text, -- 'accumulating', 'distributing', 'holding', 'active_trader'
  risk_score numeric, -- 0-100, higher = more risky to follow
  
  -- Status
  is_active boolean default true,
  
  constraint valid_wallet_type check (wallet_type in ('whale', 'exchange', 'smart_money', 'institution'))
);

-- Indexes
create index whale_wallets_address_idx on public.whale_wallets(address);
create index whale_wallets_active_idx on public.whale_wallets(is_active) where is_active = true;

-- Enable RLS
alter table public.whale_wallets enable row level security;

-- Policy: Whale wallet data is public
create policy "Whale wallet data is public"
  on public.whale_wallets for select
  using (true);


-- Table to store AI trading signals based on transfer activity
create table public.transfer_signals (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Signal details
  asset_symbol text not null,
  signal_type text not null, -- 'BUY', 'SELL', 'HOLD'
  confidence numeric not null, -- 0-100
  
  -- Reasoning
  reason text not null,
  whale_activity_summary jsonb not null, -- Recent whale transfers analyzed
  
  -- Related transfers
  analyzed_transfers_count integer not null,
  total_volume_analyzed_usd numeric not null,
  
  -- Signal metadata
  timeframe text not null, -- '1h', '4h', '24h'
  expires_at timestamp with time zone not null,
  
  constraint valid_signal check (signal_type in ('BUY', 'SELL', 'HOLD'))
);

-- Indexes
create index transfer_signals_asset_idx on public.transfer_signals(asset_symbol, created_at desc);
create index transfer_signals_expires_idx on public.transfer_signals(expires_at);

-- Enable RLS
alter table public.transfer_signals enable row level security;

-- Policy: Signals are public
create policy "Signals are public"
  on public.transfer_signals for select
  using (true);


-- Function to update whale wallet activity metrics
create or replace function update_whale_activity_metrics()
returns trigger as $$
begin
  -- Update FROM wallet metrics if it's a whale
  if exists (select 1 from whale_wallets where address = NEW.from_address) then
    update whale_wallets
    set 
      total_transfers_24h = (
        select count(*) 
        from wallet_transfers 
        where (from_address = NEW.from_address or to_address = NEW.from_address)
        and timestamp > now() - interval '24 hours'
      ),
      total_volume_24h_usd = (
        select coalesce(sum(value_usd), 0)
        from wallet_transfers
        where (from_address = NEW.from_address or to_address = NEW.from_address)
        and timestamp > now() - interval '24 hours'
      ),
      updated_at = now()
    where address = NEW.from_address;
  end if;
  
  -- Update TO wallet metrics if it's a whale
  if exists (select 1 from whale_wallets where address = NEW.to_address) then
    update whale_wallets
    set 
      total_transfers_24h = (
        select count(*) 
        from wallet_transfers 
        where (from_address = NEW.to_address or to_address = NEW.to_address)
        and timestamp > now() - interval '24 hours'
      ),
      total_volume_24h_usd = (
        select coalesce(sum(value_usd), 0)
        from wallet_transfers
        where (from_address = NEW.to_address or to_address = NEW.to_address)
        and timestamp > now() - interval '24 hours'
      ),
      updated_at = now()
    where address = NEW.to_address;
  end if;
  
  return NEW;
end;
$$ language plpgsql;

-- Trigger to auto-update whale metrics
create trigger update_whale_metrics_trigger
  after insert on wallet_transfers
  for each row
  execute function update_whale_activity_metrics();
