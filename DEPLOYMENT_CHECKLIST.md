# ✅ DEPLOYMENT CHECKLIST

Use this checklist to ensure everything is set up correctly.

## 🎯 Quick Status Check

Run these commands to check current status:

```powershell
# 1. Check if edge function is deployed
supabase functions list
# Should show: alchemy-webhook | ACTIVE

# 2. Check if tables exist (run in Supabase SQL Editor)
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('wallet_transfers', 'whale_wallets', 'transfer_signals');
# Should return 3 rows
```

---

## 📋 Deployment Steps

### ✅ Step 1: Database Tables
- [ ] Open Supabase SQL Editor: https://supabase.com/dashboard/project/vzupzqmkhlepgncyfpbv/editor
- [ ] Copy contents of `deploy_database.sql`
- [ ] Paste and run in SQL Editor
- [ ] Verify: See "Tables created successfully!" message
- [ ] Verify: 3 table names listed (wallet_transfers, whale_wallets, transfer_signals)

**Status**: ___ (✅ Done / ⏸️ Pending / ❌ Error)

---

### ✅ Step 2: Edge Function
- [x] Edge function deployed: `alchemy-webhook`
- [x] Status: ACTIVE
- [x] URL: https://vzupzqmkhlepgncyfpbv.supabase.co/functions/v1/alchemy-webhook

**Status**: ✅ Done (deployed automatically)

---

### ✅ Step 3: Test Webhook (Optional but Recommended)
- [ ] Run test: `node test-webhook.js`
- [ ] Expected: ✅ SUCCESS message
- [ ] Verify: Check database for test transfer
- [ ] SQL: `SELECT * FROM wallet_transfers ORDER BY created_at DESC LIMIT 1;`

**Status**: ___ (✅ Done / ⏸️ Pending / ⏭️ Skipped)

---

### ✅ Step 4: Configure Alchemy
- [ ] Go to: https://dashboard.alchemy.com
- [ ] Click: Notify → Create Webhook
- [ ] Type: Address Activity
- [ ] URL: https://vzupzqmkhlepgncyfpbv.supabase.co/functions/v1/alchemy-webhook
- [ ] Network: Ethereum Mainnet (required)
- [ ] Add addresses (copy from SETUP_INSTRUCTIONS.md)
- [ ] Activity types: External, Internal, Token Transfers (all checked)
- [ ] Click: Create Webhook
- [ ] Test: Send Test Event button

**Status**: ___ (✅ Done / ⏸️ Pending)

---

### ✅ Step 5: Add API Key to .env
- [ ] Open `.env` file
- [ ] Add: `VITE_ALCHEMY_API_KEY=your_key_here`
- [ ] Get key from: Alchemy Dashboard → Your App → API Keys
- [ ] Save file
- [ ] Restart dev server: `npm run dev`

**Status**: ___ (✅ Done / ⏸️ Pending / ⏭️ Optional)

---

## 🧪 Verification Tests

### Test 1: Database Tables Exist
```sql
-- Run in Supabase SQL Editor
SELECT 
  COUNT(*) as table_count
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('wallet_transfers', 'whale_wallets', 'transfer_signals');
```
**Expected**: `table_count: 3`
**Result**: ___ (✅ Pass / ❌ Fail)

---

### Test 2: Edge Function is Live
```powershell
# Run in terminal
curl https://vzupzqmkhlepgncyfpbv.supabase.co/functions/v1/alchemy-webhook
```
**Expected**: `{"error":"Method not allowed"}` (GET not allowed, POST only)
**Result**: ___ (✅ Pass / ❌ Fail)

---

### Test 3: RLS Policies Work
```sql
-- Run in Supabase SQL Editor (as anon user)
SELECT COUNT(*) FROM wallet_transfers;
```
**Expected**: Returns count (0 or more) without error
**Result**: ___ (✅ Pass / ❌ Fail)

---

### Test 4: Webhook Processes Transfer
```powershell
# Run test script
node test-webhook.js
```
**Expected**: "✅ SUCCESS! Webhook processed the test transfer"
**Result**: ___ (✅ Pass / ❌ Fail / ⏭️ Skipped)

---

### Test 5: Frontend Displays Data
- [ ] Start dev server: `npm run dev`
- [ ] Open: http://localhost:8080
- [ ] Chat: "Tell me about Bitcoin"
- [ ] Check: LiveCryptoChart appears
- [ ] Check: WhaleActivity component appears below chart
- [ ] Expected: Either whale data OR "No recent whale activity detected"

**Result**: ___ (✅ Pass / ❌ Fail / ⏸️ Pending)

---

## 🔍 Debugging Commands

If something isn't working, use these:

### Check Function Logs
```powershell
supabase functions logs alchemy-webhook --follow
```
Leave this running to see real-time webhook calls.

### Check Database Contents
```sql
-- See recent transfers
SELECT 
  transaction_hash,
  from_wallet_type,
  to_wallet_type,
  value_usd,
  asset_symbol,
  timestamp
FROM wallet_transfers
ORDER BY created_at DESC
LIMIT 10;

-- Count total transfers
SELECT COUNT(*) as total_transfers FROM wallet_transfers;

-- Check whale wallets
SELECT * FROM whale_wallets;
```

### Test Edge Function Directly
```powershell
# Send a test POST request
curl -X POST https://vzupzqmkhlepgncyfpbv.supabase.co/functions/v1/alchemy-webhook \
  -H "Content-Type: application/json" \
  -d "{\"test\": true}"
```

### Redeploy Edge Function
```powershell
supabase functions deploy alchemy-webhook --no-verify-jwt
```

---

## 🎯 Success Criteria

Your integration is fully working when:

✅ All database tables exist (wallet_transfers, whale_wallets, transfer_signals)
✅ Edge function shows ACTIVE status
✅ Alchemy webhook is created and enabled
✅ Test webhook returns success
✅ At least one transfer appears in database (from test or real activity)
✅ Frontend shows WhaleActivity component when coin is mentioned
✅ No errors in function logs or browser console

---

## 📊 Current Status

**Overall Progress**: ___% complete

- Database: ___ (✅ Done / ⏸️ Pending)
- Edge Function: ✅ Done
- Webhook Config: ___ (✅ Done / ⏸️ Pending)
- Testing: ___ (✅ Done / ⏸️ Pending)
- API Key: ___ (✅ Done / ⏸️ Optional)

---

## 🆘 Common Issues & Solutions

### Issue: "Table already exists" error
**Solution**: This is OK! It means tables were already created. Ignore the error.

### Issue: No transfers appearing after 1 hour
**Possible causes**:
1. Monitored addresses haven't made transactions yet (normal)
2. Alchemy webhook is disabled (check dashboard)
3. Webhook URL has typo (verify URL in Alchemy)
4. Network not enabled (enable Ethereum Mainnet)

**Solutions**:
- Send a test event from Alchemy dashboard
- Check function logs for incoming requests
- Verify webhook status in Alchemy

### Issue: "Failed to reach webhook" in test
**Solutions**:
1. Check internet connection
2. Verify function is deployed: `supabase functions list`
3. Try accessing URL in browser (should see "Method not allowed")

### Issue: Frontend shows loading forever
**Possible causes**:
1. Supabase connection issue
2. RLS policies blocking read access

**Solutions**:
- Check browser console for errors
- Verify VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env
- Check RLS policies allow SELECT for anon role

---

## 📞 Get Help

**Check logs first**:
```powershell
supabase functions logs alchemy-webhook --follow
```

**Verify configuration**:
1. Supabase Dashboard: https://supabase.com/dashboard/project/vzupzqmkhlepgncyfpbv
2. Alchemy Dashboard: https://dashboard.alchemy.com
3. Function logs above

**Documentation**:
- `SETUP_INSTRUCTIONS.md` - Detailed setup guide
- `ALCHEMY_INTEGRATION.md` - Technical overview
- `test-webhook.js` - Test script

---

**Last Updated**: $(Get-Date)
**Next Review**: After completing all steps above
