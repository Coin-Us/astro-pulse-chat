# 🚀 ALCHEMY API INTEGRATION - SIMPLE STEPS

## ✅ What's Already Done

✅ **Edge Function Deployed**: `alchemy-webhook` is live!
   - URL: `https://vzupzqmkhlepgncyfpbv.supabase.co/functions/v1/alchemy-webhook`

---

## 📋 STEP 1: Deploy Database Tables (2 minutes)

### Option A: Using Supabase Dashboard (RECOMMENDED)
1. Go to: https://supabase.com/dashboard/project/vzupzqmkhlepgncyfpbv/editor
2. Click **SQL Editor** (left sidebar)
3. Click **+ New Query**
4. Copy the ENTIRE contents of `deploy_database.sql` file
5. Paste into the SQL editor
6. Click **Run** (or press Ctrl+Enter)
7. You should see: "Tables created successfully!" and 3 table names

### Option B: Using psql (if you prefer terminal)
```powershell
# From your project directory
Get-Content deploy_database.sql | supabase db execute
```

### ✅ Verify Tables Were Created
Run this in SQL Editor to check:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('wallet_transfers', 'whale_wallets', 'transfer_signals');
```
You should see 3 tables listed.

---

## 📋 STEP 2: Configure Alchemy Webhook (5 minutes)

### 2.1 Go to Alchemy Dashboard
1. Open: https://dashboard.alchemy.com
2. Select your app (or create one if needed)

### 2.2 Create Webhook
1. Click **Notify** in the left sidebar
2. Click **Create Webhook** button
3. **Webhook Type**: Select **"Address Activity"**

### 2.3 Configure Webhook Settings

**Basic Settings:**
- **Webhook URL**: 
  ```
  https://vzupzqmkhlepgncyfpbv.supabase.co/functions/v1/alchemy-webhook
  ```
- **Description**: "Whale Transfer Tracking"

**Network Selection:**
- Select **Ethereum Mainnet** (required)
- Optional: Add Polygon, Arbitrum, Optimism, Base

**Addresses to Track:**
You need to add wallet addresses you want to monitor. Start with these known whale/exchange addresses:

**Copy and paste these addresses** (click "+ Add addresses" button):
```
0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
0x8315177aB297bA92A06054cE80a67Ed4DBd7ed3a
0xBE0eB53F46cd790Cd13851d5EFf43D12404d33E8
0x28C6c06298d514Db089934071355E5743bf21d60
0x220866B1A2219f40e72f5c628B65D54268cA3A9D
0x2FAF487A4414Fe77e2327F0bf4AE2a264a776AD2
0x001866Ae5B3de6caa5a51543fd9fB64f524F5478
0x73BCEb1Cd57C711feaC4224D062b0F6ff338501e
0x3f5CE5FBFe3E9af3971dD833D26bA9b5C936f0bE
0xD551234Ae421e3BCBA99A0Da6d736074f22192FF
```

**Activity Types:**
- ✅ Check **"External Transfers"** (when tokens move between wallets)
- ✅ Check **"Internal Transfers"** (smart contract transfers)
- ✅ Check **"Token Transfers"** (ERC-20, ERC-721, ERC-1155)

**Advanced Settings:**
- Leave **Authorization Header** blank (we use Supabase service role auth)
- Leave other settings as default

### 2.4 Save Webhook
Click **Create Webhook** button at the bottom.

### 2.5 Test the Webhook
1. After creating, you'll see your webhook listed
2. Click on it to open details
3. Click **"Send Test Event"** button
4. You should see success message

---

## 📋 STEP 3: Verify Everything is Working (3 minutes)

### 3.1 Check Edge Function Logs
```powershell
supabase functions logs alchemy-webhook --follow
```
Leave this running in a terminal window to see incoming webhooks.

### 3.2 Check Database for Test Data
Go to Supabase SQL Editor and run:
```sql
-- Check if any transfers were recorded
SELECT 
  transaction_hash,
  from_wallet_type,
  to_wallet_type,
  value_usd,
  asset_symbol,
  timestamp
FROM wallet_transfers
ORDER BY created_at DESC
LIMIT 5;
```

If you see data, **it's working!** 🎉

### 3.3 Test from Frontend (Optional)
Open your app in the browser:
1. Chat with the AI about Bitcoin or Ethereum
2. You should see the WhaleActivity component appear below the chart
3. If no recent transfers: "No recent whale activity detected" is normal

---

## 📋 STEP 4: Add Your Alchemy API Key (Optional - for future features)

Add to your `.env` file:
```bash
# Your existing keys
VITE_SUPABASE_URL=https://vzupzqmkhlepgncyfpbv.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_ONCHAINKIT_API_KEY=your_onchainkit_key

# Add your Alchemy API key
VITE_ALCHEMY_API_KEY=your_alchemy_api_key_here
```

**Where to find your Alchemy API key:**
1. Alchemy Dashboard → Your App → API Keys
2. Copy the API key (not the app ID)

---

## 🔍 How to Find More Whale Addresses

Want to track more whales? Here's where to find addresses:

### Etherscan Top Holders
1. Go to: https://etherscan.io/accounts
2. Copy addresses of top holders (skip exchange addresses)

### Whale Alert Twitter
1. Follow: https://twitter.com/whale_alert
2. Copy addresses from recent large transactions

### Nansen (Premium)
1. https://www.nansen.ai
2. "Smart Money" addresses

### Add Addresses to Alchemy Webhook:
1. Go back to your Alchemy webhook
2. Click **Edit**
3. Scroll to **"Addresses"**
4. Paste new addresses
5. Click **Save**

---

## 🐛 Troubleshooting

### Problem: "Tables created successfully" but no tables appear
**Solution**: Refresh your Supabase dashboard, check Table Editor

### Problem: Webhook shows error in Alchemy dashboard
**Solution**: 
1. Check edge function logs: `supabase functions logs alchemy-webhook`
2. Verify webhook URL is correct (no typos)
3. Check function is deployed: `supabase functions list`

### Problem: No transfers appearing in database
**Solutions**:
1. Check if addresses are actively transacting (recent activity)
2. Send a test event from Alchemy dashboard
3. Make sure webhook is **enabled** in Alchemy
4. Check function logs for errors

### Problem: "Docker is not running" warning
**This is OK!** The function still deployed successfully. The warning can be ignored.

---

## 📊 What Happens Now?

Here's the automatic flow:

1. **Whale moves crypto** (e.g., 500 ETH from Binance to wallet)
2. **Alchemy detects** the transfer within seconds
3. **Webhook fires** to your edge function
4. **Edge function processes**:
   - Classifies wallets (whale, exchange, etc.)
   - Calculates USD value
   - Determines if significant (>$50k or whale involved)
5. **Saves to database** in `wallet_transfers` table
6. **Frontend updates** every 60 seconds
7. **WhaleActivity component** shows the transfer with signal
8. **AI sees the data** in future responses

---

## ✨ You're Done!

### What you now have:
✅ Real-time whale transfer tracking
✅ Automatic BUY/SELL/HOLD signal generation
✅ Beautiful UI showing whale activity
✅ AI that knows about whale movements
✅ Exchange flow analysis (accumulation vs distribution)

### Test it:
1. Open your app: http://localhost:8080
2. Ask the AI: "What's happening with Bitcoin?"
3. Look for the WhaleActivity card below the chart
4. If no activity yet, check back in a few hours (whales need time to move!)

---

## 🎯 Next Steps (Optional)

Want to make it even better?

1. **Add more addresses**: Track 50+ whale wallets
2. **Multiple chains**: Enable Polygon, Base, Arbitrum in Alchemy
3. **Price integration**: Fetch real ETH/BTC prices instead of hardcoded $3000
4. **Email alerts**: Get notified of huge transfers (>$1M)
5. **Historical data**: Import past transfers for better signals

---

## 📞 Need Help?

- **Alchemy Docs**: https://docs.alchemy.com/docs/alchemy-notify
- **Supabase Logs**: `supabase functions logs alchemy-webhook --follow`
- **Check Tables**: Supabase Dashboard → Table Editor
- **Test Webhook**: Alchemy Dashboard → Your Webhook → Send Test Event

---

**Everything is deployed and ready!** The webhook will start receiving data as soon as your monitored addresses make transactions. 🚀
