import { supabase } from './supabase';

export type ChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export async function sendChatMessage(
  message: string,
  conversationHistory: ChatMessage[] = []
): Promise<Response> {
  // Get the Supabase URL and anon key
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://vzupzqmkhlepgncyfpbv.supabase.co';
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6dXB6cW1raGxlcGduY3lmcGJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1MDQ4NTAsImV4cCI6MjA3ODA4MDg1MH0.I7572vgAfeYniHyriHmMrwFmDUk7liUzzdO8YgapqnY';

  // Call the edge function directly with fetch for streaming support
  const response = await fetch(`${supabaseUrl}/functions/v1/chat-openai`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseAnonKey}`,
    },
    body: JSON.stringify({
      message,
      messages: [
        {
          role: 'system',
          content: 'You are CryptoSentiment AI, a helpful assistant specialized in cryptocurrency analysis, market sentiment, and trading insights. Provide clear, actionable information about crypto markets, sentiment analysis, and price predictions when asked. Be concise but informative.',
        },
        ...conversationHistory,
        {
          role: 'user',
          content: message,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to send message: ${errorText}`);
  }

  return response;
}

export async function* streamOpenAIResponse(response: Response): AsyncGenerator<string> {
  if (!response.body) {
    throw new Error('Response body is null');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  try {
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n').filter(line => line.trim() !== '');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          
          if (data === '[DONE]') {
            return;
          }

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            
            if (content) {
              yield content;
            }
          } catch (e) {
            // Skip invalid JSON
            console.warn('Failed to parse SSE data:', e);
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}
