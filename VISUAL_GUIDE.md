# 🎯 ALCHEMY WEBHOOK - VISUAL GUIDE FOR YOUR DASHBOARD

Based on your screenshot, here's exactly what to do:

---

## 📍 WHERE YOU ARE NOW

You're on the **"Endpoints"** page of your Alchemy dashboard.
- ✅ You can see: Base, Ethereum, Shape, etc.
- ✅ Your API Key: `ne3fYlyfNbK4pZG8zou_b`

---

## 🎯 STEP 1: Navigate to Notify

Look at the **LEFT SIDEBAR** of your Alchemy dashboard.

You should see these menu items:
```
🏠 App Dashboard
📦 Node
💾 Data
💳 Wallets
📊 Transactions
🔄 Rollups
🛠️  Tools
🔒 Security
🔌 Endpoints  ← YOU ARE HERE
⚙️  App Settings
```

**Look for one of these**:
- 📢 **Notify** (might be below "Endpoints")
- 🔔 **Webhooks** (alternative name)
- 📨 **Alerts** (some dashboards)

**Can't find it?**
- Try clicking **"Tools"** dropdown (🛠️)
- Or look for **"Advanced"** section
- Or search for "webhook" in the search bar

---

## 🎯 STEP 2: Create Webhook

Once you find **"Notify"** or **"Webhooks"**:

1. Click **"+ Create Webhook"** button (usually blue, top-right)

2. You'll see a form with these fields:

---

## 📝 WEBHOOK CONFIGURATION FORM

### Section 1: Webhook Type
```
○ Address Activity     ← SELECT THIS ONE ✅
○ Dropped Transaction
○ Mined Transaction
○ NFT Activity
○ Custom
```

### Section 2: Basic Info
```
App:         Naphtali's First App  [dropdown]
Network:     Ethereum Mainnet      [dropdown] ← SELECT THIS ✅
Description: Whale Transfer Tracking
```

### Section 3: Webhook URL (MOST IMPORTANT!)
```
┌─────────────────────────────────────────────────────────────┐
│ Webhook URL:                                                │
│                                                             │
│ https://vzupzqmkhlepgncyfpbv.supabase.co/functions/v1/     │
│ alchemy-webhook                                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
      👆 Copy this EXACTLY (no extra spaces!)
```

**COPY THIS URL**:
```
https://vzupzqmkhlepgncyfpbv.supabase.co/functions/v1/alchemy-webhook
```

### Section 4: Addresses to Monitor
```
┌─────────────────────────────────────────────────────────────┐
│ Addresses:                                                  │
│                                                             │
│ [+ Add addresses]  ← Click this button                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**After clicking "+ Add addresses", paste these 10 addresses** (one per line or comma-separated):

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

### Section 5: Activity Types
```
Select which types of transactions to track:

☑ External Transfers          ← CHECK THIS ✅
☑ Internal Transfers          ← CHECK THIS ✅
☑ Token Transfers (ERC-20)    ← CHECK THIS ✅
☐ NFT Transfers (ERC-721)     ← OPTIONAL
☐ NFT Transfers (ERC-1155)    ← OPTIONAL
```

### Section 6: Advanced Settings (SKIP THESE)
```
Authorization Header:  [empty]     ← Leave empty
Webhook Version:       v2 (latest) ← Leave default
Min Balance:          [empty]     ← Leave empty
```

---

## 🎯 STEP 3: Create & Test

1. **Scroll to bottom**
2. **Click "Create Webhook"** button (blue)
3. **You'll see**: Webhook created successfully! ✅

Then immediately:

4. **Click on your new webhook** (in the list)
5. **Click "Send Test Event"** button
6. **You should see**: ✅ Test event sent successfully

---

## 🧪 VERIFY IT WORKED

### In Your Terminal:
```powershell
# Open terminal and run:
supabase functions logs alchemy-webhook --follow
```

You should see logs like:
```
Processing Alchemy webhook...
Processing 1 transfers
From: 0x742d35... (whale)
To: 0x8315177... (normal)
Value: $X.XX USD
✅ Inserted 1 transfers
```

### Or Run Test:
```powershell
node test-webhook.js
```

Should print: `✅ SUCCESS! Webhook processed the test transfer`

---

## 🐛 TROUBLESHOOTING

### "I don't see Notify or Webhooks option"

**Possible causes**:
1. **Free plan limitation**: Webhooks require Growth plan or higher
   - Solution: Upgrade to Growth plan ($49/month)
   - Or use free trial

2. **New dashboard layout**: 
   - Try clicking "Tools" → "Notify"
   - Or search for "webhook" in search bar

3. **Wrong section**:
   - Make sure you're in your app dashboard
   - Not in the team/billing settings

### "Webhook test fails"

**Check**:
1. URL has no typos
2. URL has no trailing slash
3. Edge function is deployed: `supabase functions list`
4. Network is set to "Ethereum Mainnet"

### "Can't add addresses"

**Tips**:
- Paste one address per line
- Or comma-separated: `0xABC...,0xDEF...,0x123...`
- Make sure addresses start with `0x`
- No extra spaces

---

## 📊 WHAT YOUR DASHBOARD WILL LOOK LIKE AFTER

After creating the webhook, you'll see:

```
┌────────────────────────────────────────────────┐
│  Webhooks                                      │
├────────────────────────────────────────────────┤
│  Whale Transfer Tracking                       │
│  ● Active                                      │
│  Type: Address Activity                        │
│  Network: Ethereum Mainnet                     │
│  Addresses: 10                                 │
│  Last triggered: 2 minutes ago                 │
│                                                │
│  [Edit] [Delete] [Send Test Event] [View Logs]│
└────────────────────────────────────────────────┘
```

---

## ✅ SUCCESS CHECKLIST

After creating webhook:

- [ ] Webhook shows "Active" status
- [ ] Test event sent successfully
- [ ] Logs show webhook received: `supabase functions logs alchemy-webhook`
- [ ] Test script passes: `node test-webhook.js`
- [ ] Database has data: Check `wallet_transfers` table

---

## 🎉 YOU'RE DONE!

Once your webhook is active:

1. **Alchemy monitors** your 10 whale addresses
2. **When they move crypto**, webhook fires instantly
3. **Your edge function** processes and saves to database
4. **Your app shows** whale activity with BUY/SELL signals
5. **Your AI gets** smarter recommendations

**No more configuration needed!** 🚀

---

## 🚀 START YOUR APP

```powershell
# Start dev server
npm run dev

# Open browser: http://localhost:8080
# Chat: "Tell me about Bitcoin"
# Look for WhaleActivity component below the chart!
```

---

## 📞 STILL NEED HELP?

If you can't find the Notify/Webhooks option:

1. **Take a screenshot** of your left sidebar menu
2. **Check your plan**: Alchemy Dashboard → Billing
3. **Try search**: Look for search bar, type "webhook"
4. **Contact Alchemy**: They can help enable webhooks

Or just run: `node test-webhook.js` to test without creating in dashboard first!

---

**Your API Key** (for reference): `ne3fYlyfNbK4pZG8zou_b`

**Your Webhook URL** (copy exactly):
```
https://vzupzqmkhlepgncyfpbv.supabase.co/functions/v1/alchemy-webhook
```

**Good luck!** 🎯
