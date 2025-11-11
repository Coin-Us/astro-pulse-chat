# 🎯 ALCHEMY WEBHOOK SETUP - YOUR DASHBOARD

## ✅ What You Already Have
- Alchemy API Key: `ne3fYlyfNbK4pZG8zou_b`
- Networks enabled: Base, Ethereum (and more available)
- Database tables: Already created ✅

---

## 📋 STEP-BY-STEP: Create Webhook in Your Alchemy Dashboard

### 1. Click "Endpoints" in Left Sidebar
(I can see you're currently on the "Endpoints" page - perfect!)

### 2. Click on "Notify" Tab
Look for **"Notify"** option in the left sidebar menu (below "Endpoints")

### 3. Click "Create Webhook" Button
You should see a "+ Create Webhook" button

### 4. Fill in Webhook Configuration

#### **Step 4a: Webhook Type**
Select: **"Address Activity"**

#### **Step 4b: Webhook Details**

| Field | Value |
|-------|-------|
| **App** | Naphtali's First App |
| **Network** | Ethereum Mainnet (required) |
| **Description** | Whale Transfer Tracking |

#### **Step 4c: Webhook URL** (IMPORTANT!)
```
https://vzupzqmkhlepgncyfpbv.supabase.co/functions/v1/alchemy-webhook
```

Copy this EXACTLY ☝️ (no trailing slash!)

#### **Step 4d: Add Addresses to Monitor**

Click **"+ Add addresses"** and paste these whale addresses:

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

**What these addresses are:**
- Major exchange wallets (Binance, Kraken, Coinbase)
- Known whale wallets (large holders)
- Smart money addresses

#### **Step 4e: Activity Types to Track**

✅ Check ALL of these:
- ✅ **External Transfers**
- ✅ **Internal Transfers**  
- ✅ **Token Transfers (ERC-20)**
- ✅ **NFT Transfers** (optional)

#### **Step 4f: Advanced Settings** (Optional)

Leave these as default:
- **Min Balance**: Leave empty
- **Webhook Version**: Latest (v2)
- **Authorization Header**: Leave empty

### 5. Click "Create Webhook"

### 6. Test Your Webhook
After creation:
1. Click on your webhook to open details
2. Click **"Send Test Event"** button
3. You should see: ✅ Success message

---

## 🧪 VERIFY IT'S WORKING

### Option 1: Check Supabase Logs (Real-time)
Open terminal and run:
```powershell
supabase functions logs alchemy-webhook --follow
```

Leave this running. When the test event fires, you'll see:
```
Processing transfer from 0x... to 0x...
Classified as: exchange → whale
Value: $X.XX USD
```

### Option 2: Check Database
Go to Supabase Dashboard → SQL Editor and run:
```sql
SELECT 
  transaction_hash,
  from_wallet_type,
  to_wallet_type,
  value_usd,
  asset_symbol,
  is_significant,
  timestamp
FROM wallet_transfers
ORDER BY created_at DESC
LIMIT 5;
```

If you see data = **IT'S WORKING!** 🎉

### Option 3: Run Test Script
In your project terminal:
```powershell
node test-webhook.js
```

Should see: "✅ SUCCESS! Webhook processed the test transfer"

---

## 🔑 Your API Key

Your Alchemy API Key: `ne3fYlyfNbK4pZG8zou_b`

### Do you need to add it to your code?
**NO!** The webhook works without adding the API key to your code. 

But if you want to add it anyway (for future features):

1. Open `.env` file
2. Add this line:
   ```bash
   VITE_ALCHEMY_API_KEY=ne3fYlyfNbK4pZG8zou_b
   ```
3. Save and restart: `npm run dev`

---

## 📊 What Happens After Setup

```
1. Whale moves crypto (e.g., 500 ETH)
   ↓
2. Alchemy detects it instantly
   ↓
3. Webhook fires to: 
   https://vzupzqmkhlepgncyfpbv.supabase.co/functions/v1/alchemy-webhook
   ↓
4. Your edge function processes:
   - Classifies wallets (whale, exchange, etc.)
   - Calculates USD value
   - Saves to database
   ↓
5. Frontend updates (every 60 seconds)
   ↓
6. WhaleActivity component shows:
   - BUY/SELL/HOLD signal
   - Exchange flows
   - Whale accumulation
   ↓
7. AI sees transfer data for smarter recommendations
```

---

## ✅ CHECKLIST

- [ ] Clicked "Notify" in Alchemy sidebar
- [ ] Clicked "Create Webhook"
- [ ] Selected "Address Activity" type
- [ ] Selected "Ethereum Mainnet" network
- [ ] Pasted webhook URL: `https://vzupzqmkhlepgncyfpbv.supabase.co/functions/v1/alchemy-webhook`
- [ ] Added 10 whale addresses
- [ ] Checked all activity types (External, Internal, Token)
- [ ] Clicked "Create Webhook"
- [ ] Clicked "Send Test Event"
- [ ] Verified in logs or database

---

## 🐛 TROUBLESHOOTING

### Can't find "Notify" option?
- Look in left sidebar below "Endpoints"
- Or look for "Webhooks" section
- If not visible, your plan might not include webhooks (upgrade to Growth plan)

### Webhook test fails?
Check:
1. URL is exactly: `https://vzupzqmkhlepgncyfpbv.supabase.co/functions/v1/alchemy-webhook`
2. No extra spaces or characters
3. Edge function is deployed: `supabase functions list` (shows ACTIVE)

### No transfers appearing?
This is normal! Whales don't move crypto every minute.
- Check back in a few hours
- Or run: `node test-webhook.js` to insert test data

---

## 🎉 YOU'RE DONE!

Once you create the webhook, you'll have:
✅ Real-time whale tracking
✅ Automatic BUY/SELL signals
✅ Beautiful UI in your app
✅ Smarter AI recommendations

**Your webhook will automatically start receiving data when your monitored addresses make transactions!** 🐋

---

## 📞 NEXT STEPS

1. **Create the webhook** (follow steps above)
2. **Test it** (Send Test Event button)
3. **Start your app**: `npm run dev`
4. **Chat about Bitcoin or Ethereum** - you'll see WhaleActivity appear!

**Total time: 5 minutes** ⏱️

---

**Questions?** Run `node test-webhook.js` to verify everything works!
