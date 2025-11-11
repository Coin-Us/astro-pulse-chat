# 🔑 WHERE TO PUT YOUR ALCHEMY API KEY

## Quick Answer

Paste your Alchemy API key in **TWO** places:

1. **`.env` file** (for frontend - optional)
2. **Alchemy Dashboard** (for webhook - required)

---

## 📍 Location 1: .env File (Optional)

### Where?
File: `c:\Users\User\astro-pulse-chat\.env`

### What to add?
```bash
# Your existing environment variables
VITE_SUPABASE_URL=https://vzupzqmkhlepgncyfpbv.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_ONCHAINKIT_API_KEY=your_onchainkit_key_here

# ADD THIS LINE (replace with your actual key)
VITE_ALCHEMY_API_KEY=your_alchemy_api_key_here
```

### Example:
```bash
VITE_ALCHEMY_API_KEY=alch_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

### When to use?
- Future features that need to call Alchemy directly from frontend
- Currently optional (not used yet)

---

## 📍 Location 2: Alchemy Dashboard (Required)

### Where?
https://dashboard.alchemy.com

### Steps:

1. **Login to Alchemy**
   - Go to: https://dashboard.alchemy.com
   - Sign in with your account

2. **Select Your App**
   - Click on your app name (or create new if needed)
   - You'll see the dashboard for that app

3. **Find Your API Key**
   - Look for **"API KEY"** section (usually top right)
   - Or click **"API Keys"** in left sidebar
   - Copy the API key (starts with `alch_`)

4. **Create Webhook** (if not done yet)
   - Click **"Notify"** in left sidebar
   - Click **"Create Webhook"** button
   - Configure webhook (see SETUP_INSTRUCTIONS.md)

### What you're looking for:
```
API Key: alch_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
         👆 Copy this entire string
```

---

## 📋 Full Setup Walkthrough

### Step 1: Get Your Alchemy API Key

1. Go to: https://dashboard.alchemy.com
2. If you don't have an app, create one:
   - Click **"+ Create App"**
   - Name: "Crypto Whale Tracker"
   - Chain: Ethereum
   - Network: Mainnet
   - Click **"Create App"**

3. Click on your app name
4. Look for **"API KEY"** section
5. Copy the API key (it's a long string starting with `alch_`)

### Step 2: Add to .env File (Optional)

1. Open file: `c:\Users\User\astro-pulse-chat\.env`
2. Add new line at the end:
   ```bash
   VITE_ALCHEMY_API_KEY=paste_your_key_here
   ```
3. Save the file
4. Restart your dev server:
   ```powershell
   npm run dev
   ```

### Step 3: Configure Webhook in Alchemy

1. In Alchemy Dashboard, click **"Notify"** (left sidebar)
2. Click **"Create Webhook"**
3. Fill in:
   - **Type**: Address Activity
   - **Webhook URL**: 
     ```
     https://vzupzqmkhlepgncyfpbv.supabase.co/functions/v1/alchemy-webhook
     ```
   - **Network**: Ethereum Mainnet
   - **Addresses**: (copy whale addresses from SETUP_INSTRUCTIONS.md)
   - **Activity Types**: Check all (External, Internal, Token)

4. Click **"Create Webhook"**
5. Test it: Click **"Send Test Event"**

---

## 🔒 Security Notes

### ✅ Safe to use in .env:
- `VITE_ALCHEMY_API_KEY` - Frontend calls (limited permissions)
- Only exposed to your frontend code
- Can't access sensitive operations

### ⚠️ Keep SECRET (don't put in .env):
- Alchemy **Admin API Key** - Has full permissions
- Should only be used in backend/edge functions
- Never commit to git

### What we're using:
- **Regular API Key** - Safe for frontend
- **Webhook** - Alchemy pushes data to us (no key needed)
- **Edge Function** - Supabase handles auth automatically

---

## 🧪 Test It Works

### After adding to .env:

```powershell
# Restart dev server
npm run dev

# In browser console, check if key is loaded:
console.log(import.meta.env.VITE_ALCHEMY_API_KEY)
# Should print your key (or undefined if not added)
```

### After configuring webhook:

```powershell
# Check if webhook receives data
supabase functions logs alchemy-webhook --follow

# Send test event from Alchemy Dashboard
# You should see logs appear in terminal
```

---

## 📊 What Each Key Does

| Key | Where | Used For | Required? |
|-----|-------|----------|-----------|
| `VITE_ALCHEMY_API_KEY` | .env file | Future frontend features | Optional |
| Alchemy Webhook | Alchemy Dashboard | Receive transfer events | **Required** |
| Supabase Anon Key | .env file | Database access | **Required** |
| OnchainKit Key | .env file | Wallet connection | **Required** |

---

## ✅ Checklist

- [ ] Got Alchemy API key from dashboard
- [ ] Added to .env file (optional)
- [ ] Created webhook in Alchemy Dashboard
- [ ] Webhook URL is correct: `https://vzupzqmkhlepgncyfpbv.supabase.co/functions/v1/alchemy-webhook`
- [ ] Added whale addresses to monitor
- [ ] Tested webhook with "Send Test Event"
- [ ] Checked function logs: `supabase functions logs alchemy-webhook`

---

## 🆘 Troubleshooting

### Can't find API key in Alchemy
1. Make sure you created an app first
2. Click on the app name to open it
3. Look in top right corner or "API Keys" section

### Added key but getting "undefined"
1. Make sure you restarted dev server after editing .env
2. Check the key name is exactly: `VITE_ALCHEMY_API_KEY`
3. No spaces around the `=` sign

### Webhook not receiving data
1. The API key in .env is optional and not related to webhooks
2. Webhook auth is automatic via Supabase
3. Check webhook status in Alchemy (should be "Active")
4. Verify addresses are correct and have recent activity

---

## 🎯 What You Need Right Now

**MINIMUM REQUIRED**:
✅ Alchemy webhook configured (no key needed in code!)

**OPTIONAL FOR LATER**:
⏸️ `VITE_ALCHEMY_API_KEY` in .env (future features)

**The webhook works WITHOUT the API key in .env!** The webhook authentication is handled automatically by Supabase. The API key is only needed if you want to make direct API calls to Alchemy from the frontend (which we're not doing yet).

---

## 📞 Quick Help

**I have my Alchemy API key, what do I do?**
1. Open `.env` file
2. Add: `VITE_ALCHEMY_API_KEY=your_key_here`
3. Save
4. Restart dev server: `npm run dev`
5. Done! (This is optional though)

**I configured the webhook, but no transfers appearing**
- This is normal! Whale transfers don't happen every minute
- Check back in a few hours
- Or send a test event from Alchemy Dashboard
- Or monitor more active addresses

**Where do I paste the actual API key code you mentioned?**
- If you mean the API key string: goes in `.env` file
- If you mean webhook URL: goes in Alchemy Dashboard webhook settings
- See SETUP_INSTRUCTIONS.md for detailed steps

---

**Need more help?** Check `SETUP_INSTRUCTIONS.md` for full step-by-step guide!
