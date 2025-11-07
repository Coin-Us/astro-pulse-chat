import { supabase } from './supabase';
import { getMarketAnalysisData } from './crypto-api';

export type ChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

/**
 * Extract coin name from user message
 */
function extractCoinId(message: string): string | null {
  const lowerMessage = message.toLowerCase();
  const coinMap: { [key: string]: string } = {
    'bitcoin': 'bitcoin',
    'btc': 'bitcoin',
    'ethereum': 'ethereum',
    'eth': 'ethereum',
    'cardano': 'cardano',
    'ada': 'cardano',
    'solana': 'solana',
    'sol': 'solana',
    'ripple': 'ripple',
    'xrp': 'ripple',
    'dogecoin': 'dogecoin',
    'doge': 'dogecoin',
    'polkadot': 'polkadot',
    'dot': 'polkadot',
    'avalanche': 'avalanche',
    'avax': 'avalanche',
    'polygon': 'matic-network',
    'matic': 'matic-network',
    'chainlink': 'chainlink',
    'link': 'chainlink',
  };

  for (const [key, value] of Object.entries(coinMap)) {
    if (lowerMessage.includes(key)) {
      return value;
    }
  }
  
  return null;
}

export async function sendChatMessage(
  message: string,
  conversationHistory: ChatMessage[] = []
): Promise<Response> {
  // Get the Supabase URL and anon key
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://vzupzqmkhlepgncyfpbv.supabase.co';
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6dXB6cW1raGxlcGduY3lmcGJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1MDQ4NTAsImV4cCI6MjA3ODA4MDg1MH0.I7572vgAfeYniHyriHmMrwFmDUk7liUzzdO8YgapqnY';

  // Try to extract coin ID from message
  const coinId = extractCoinId(message);
  let marketData = '';
  
  // Fetch live market data if analyzing a specific coin
  if (coinId) {
    try {
      marketData = await getMarketAnalysisData(coinId);
    } catch (error) {
      console.error('Failed to fetch market data:', error);
    }
  }

  // Build enhanced system message with market data
  const systemMessage = marketData 
    ? `You are CryptoSentiment AI, an expert cryptocurrency analyst and trading advisor. You have access to live market data from CoinGecko.

ANALYSIS FRAMEWORK:
When analyzing cryptocurrencies, you MUST provide:
1. **SIGNAL**: Clearly state BUY, SELL, or HOLD
2. **CURRENT PRICE**: Reference the live price data provided
3. **TECHNICAL ANALYSIS**: Analyze 24h change, 7d trends, volume, market cap
4. **KEY LEVELS**: Support and resistance levels based on recent highs/lows
5. **RISK ASSESSMENT**: Rate risk level (Low/Medium/High)
6. **JUSTIFICATION**: 3-5 clear bullet points explaining your signal
7. **TIMEFRAME**: Specify if this is short-term (1-7 days), medium-term (1-4 weeks), or long-term (1-3+ months)

SIGNAL CRITERIA:
- **BUY**: Strong upward momentum, breaking resistance, positive sentiment, good volume
- **HOLD**: Consolidation phase, mixed signals, await clearer direction
- **SELL**: Downward momentum, breaking support, negative sentiment, profit-taking opportunity

FORMAT YOUR RESPONSE:
🎯 **SIGNAL: [BUY/SELL/HOLD]**
💰 **Current Price**: $X,XXX.XX
📊 **24h Change**: +X.XX%
⚠️ **Risk Level**: [Low/Medium/High]

**Technical Analysis:**
[Your analysis here]

**Key Levels:**
- Support: $X,XXX
- Resistance: $X,XXX

**Justification:**
1. [Reason 1]
2. [Reason 2]
3. [Reason 3]

**Timeframe**: [Short/Medium/Long-term]

${marketData}

Always use the live market data context provided above. Be decisive but acknowledge uncertainty. Include risk warnings.`
    : `You are CryptoSentiment AI, an expert cryptocurrency analyst and trading advisor.

When users ask about specific cryptocurrencies, provide trading signals (BUY/SELL/HOLD) with clear justification based on market trends, technical analysis, and sentiment.

Ask the user which specific cryptocurrency they want to analyze to provide detailed signals with live market data.`;

  // Call the edge function directly with fetch for streaming support
  const response = await fetch(`${supabaseUrl}/functions/v1/chat-openai`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseAnonKey}`,
    },
    body: JSON.stringify({
      message,
      model: 'gpt-5-mini',
      messages: [
        {
          role: 'system',
          content: systemMessage,
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
