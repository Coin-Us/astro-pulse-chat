-- Quick verification query
-- Run this in Supabase SQL Editor to check if tables exist

SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
AND table_name IN ('wallet_transfers', 'whale_wallets', 'transfer_signals')
ORDER BY table_name;
