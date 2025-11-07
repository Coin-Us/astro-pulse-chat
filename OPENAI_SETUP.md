# Setting Up OpenAI Integration

## 🎉 Your Edge Function is Deployed!

The `chat-openai` edge function has been successfully deployed to your Supabase project and is ready to use GPT-4o-mini.

## 🔑 Add Your OpenAI API Key to Supabase

You need to add your OpenAI API key as a secret in Supabase. Here's how:

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard: https://supabase.com/dashboard/project/vzupzqmkhlepgncyfpbv
2. Click on **Edge Functions** in the left sidebar
3. Click on **Manage secrets** (or the settings icon)
4. Add a new secret:
   - **Name**: `OPENAI_API_KEY`
   - **Value**: Your OpenAI API key (starts with `sk-`)
5. Click **Save**

### Option 2: Using Supabase CLI

If you have the Supabase CLI installed:

```bash
supabase secrets set OPENAI_API_KEY=your-openai-api-key-here
```

## 🚀 How It Works

1. **User sends a message** → React app calls the edge function
2. **Edge function** → Forwards the request to OpenAI's GPT-4o-mini
3. **OpenAI responds** → Streams the response back in real-time
4. **React app** → Displays the streaming response to the user

## 📝 Edge Function Details

- **Function Name**: `chat-openai`
- **Model**: GPT-4o-mini
- **Features**: 
  - Streaming responses for real-time chat experience
  - Conversation history support
  - Specialized in cryptocurrency analysis
  - CORS enabled for browser requests

## 🔗 Function URL

Your edge function is available at:
```
https://vzupzqmkhlepgncyfpbv.supabase.co/functions/v1/chat-openai
```

## 🧪 Testing

Once you've added the OpenAI API key:

1. Start your dev server: `npm run dev`
2. Open the app and try asking questions about crypto
3. The AI will respond using GPT-4o-mini!

## 🛠️ Troubleshooting

### "OPENAI_API_KEY is not set" error
- Make sure you've added the secret in Supabase dashboard
- The edge function needs to be redeployed after adding secrets (it should auto-reload)

### CORS errors
- The function already has CORS headers configured
- Make sure you're calling it from your allowed origin

### No streaming response
- Check browser console for errors
- Verify the OpenAI API key is valid and has credits

## 💡 Next Steps

You can enhance the edge function by:
- Adding rate limiting
- Implementing user authentication
- Storing conversations in Supabase database
- Adding cost tracking for OpenAI usage
- Integrating real crypto market data APIs
