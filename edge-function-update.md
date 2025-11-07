# Updated Edge Function for gpt-5-mini

## Deploy this to Supabase

Run this command to deploy the updated edge function:

```bash
supabase functions deploy chat-openai
```

Or manually update via Supabase dashboard with this code:

## File: supabase/functions/chat-openai/index.ts

```typescript
import "https://deno.land/x/xhr@0.3.0/mod.ts";

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    const { messages, model = 'gpt-5-mini' } = await req.json();

    const openAIKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIKey) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    console.log(`Using model: ${model}`);

    // Call OpenAI API with streaming
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openAIKey}`,
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        stream: true,
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI API error: ${error}`);
    }

    // Stream the response back to the client
    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
});
```

## What Changed:

1. ✅ Default model changed from `gpt-4o-mini` to `gpt-5-mini`
2. ✅ Model parameter is now dynamic (accepts any model from client)
3. ✅ Added console logging to track which model is being used

## Pricing Comparison (Standard tier):

- **gpt-4o-mini**: $0.15/1M input, $0.60/1M output
- **gpt-5-mini**: $0.25/1M input, $2.00/1M output ✨ (newer, more capable)

## Benefits of gpt-5-mini:

- Latest GPT-5 series model
- Better reasoning and analysis
- Improved accuracy for trading signals
- More context understanding
- Better at following complex instructions

## Cost per 1000 API calls (assuming 500 input + 1000 output tokens each):

- gpt-4o-mini: ~$0.68
- gpt-5-mini: ~$2.13

The upgrade to gpt-5-mini provides better analysis quality for crypto trading signals at reasonable cost.
