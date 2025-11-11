import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Known exchange addresses (add more as needed)
const EXCHANGE_ADDRESSES = new Set([
  '0x28c6c06298d514db089934071355e5743bf21d60', // Binance 14
  '0x21a31ee1afc51d94c2efccaa2092ad1028285549', // Binance 15
  '0x47ac0fb4f2d84898e4d9e7b4dab3c24507a6d503', // Binance-Peg
  '0x3f5ce5fbfe3e9af3971dd833d26ba9b5c936f0be', // Binance Hot
  '0xd551234ae421e3bcba99a0da6d736074f22192ff', // Binance Cold
  '0x5041ed759dd4afc3a72b8192c143f72f4724081a', // Kraken
  '0x267be1c1d684f78cb4f6a176c4911b741e4ffdc0', // Kraken 2
  '0xae2d4617c862309a3d75a0ffb358c7a5009c673f', // Kraken 3
  '0x0a869d79a7052c7f1b55a8ebabbea3420f0d1e13', // Kraken 4
  '0x53d284357ec70ce289d6d64134dfac8e511c8a3d', // Kraken 5
  '0x6cc5f688a315f3dc28a7781717a9a798a59fda7b', // OKX
  '0xda9dfa130df4de4673b89022ee50ff26f6ea73cf', // Coinbase
  '0x503828976d22510aad0201ac7ec88293211d23da', // Coinbase 2
  '0xddfabcdc4d8ffc6d5beaf154f18b778f892a0740', // Coinbase 3
]);

// Classify wallet type
function classifyWallet(address: string, value: number): string {
  const lowerAddress = address.toLowerCase();
  
  if (EXCHANGE_ADDRESSES.has(lowerAddress)) {
    return 'exchange';
  }
  
  // Whale threshold: > $100k USD
  if (value > 100000) {
    return 'whale';
  }
  
  // Smart money: $10k - $100k
  if (value > 10000) {
    return 'smart_money';
  }
  
  return 'normal';
}

// Determine transfer direction
function getTransferDirection(fromType: string, toType: string): string {
  if (fromType === 'exchange' && toType !== 'exchange') {
    return 'exchange_to_wallet';
  }
  if (fromType !== 'exchange' && toType === 'exchange') {
    return 'wallet_to_exchange';
  }
  if (fromType === 'exchange' && toType === 'exchange') {
    return 'exchange_to_exchange';
  }
  return 'wallet_to_wallet';
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      headers: { 
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      } 
    });
  }

  try {
    const webhookData = await req.json();
    console.log('Received Alchemy webhook:', JSON.stringify(webhookData, null, 2));

    // Alchemy sends activity in the 'event' field
    const { event } = webhookData;
    
    if (!event || !event.activity) {
      return new Response(
        JSON.stringify({ error: 'Invalid webhook format' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const activities = Array.isArray(event.activity) ? event.activity : [event.activity];
    const transfers = [];

    for (const activity of activities) {
      const {
        fromAddress,
        toAddress,
        value,
        asset,
        hash,
        blockNum,
        timestamp,
      } = activity;

      // Parse value (convert from hex if needed)
      let valueInWei: number;
      if (typeof value === 'string' && value.startsWith('0x')) {
        valueInWei = parseInt(value, 16);
      } else {
        valueInWei = parseFloat(value);
      }

      // Convert to decimal units (assuming 18 decimals for ETH)
      const decimals = asset?.decimals || 18;
      const valueDecimal = valueInWei / Math.pow(10, decimals);
      
      // Estimate USD value (you'd want to fetch real price from CoinGecko)
      // For now, using rough ETH price estimate
      const ethPriceUSD = 3000; // TODO: Fetch real price
      const valueUSD = valueDecimal * ethPriceUSD;

      // Classify wallets
      const fromType = classifyWallet(fromAddress, valueUSD);
      const toType = classifyWallet(toAddress, valueUSD);
      const direction = getTransferDirection(fromType, toType);

      // Determine if significant (whale activity or large value)
      const isSignificant = 
        valueUSD > 50000 || // > $50k
        fromType === 'whale' || 
        toType === 'whale' ||
        direction === 'exchange_to_wallet' && valueUSD > 10000; // Exchange withdrawal > $10k

      const transfer = {
        transaction_hash: hash,
        block_number: parseInt(blockNum, 16),
        timestamp: new Date(timestamp).toISOString(),
        from_address: fromAddress.toLowerCase(),
        to_address: toAddress.toLowerCase(),
        value: valueInWei.toString(),
        value_usd: valueUSD,
        asset_symbol: asset?.symbol || 'ETH',
        asset_address: asset?.address || null,
        token_decimals: decimals,
        from_wallet_type: fromType,
        to_wallet_type: toType,
        transfer_direction: direction,
        is_significant: isSignificant,
        chain_id: 1, // Ethereum mainnet
        network: 'ethereum',
      };

      transfers.push(transfer);
    }

    // Insert transfers into database
    if (transfers.length > 0) {
      const { data, error } = await supabase
        .from('wallet_transfers')
        .insert(transfers)
        .select();

      if (error) {
        console.error('Error inserting transfers:', error);
        throw error;
      }

      console.log(`Inserted ${transfers.length} transfers`);
      
      // Log significant transfers
      const significantTransfers = transfers.filter(t => t.is_significant);
      if (significantTransfers.length > 0) {
        console.log('🐋 Significant transfers detected:', significantTransfers.length);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: transfers.length,
        significant: transfers.filter(t => t.is_significant).length,
      }),
      { 
        status: 200, 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        } 
      }
    );

  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        } 
      }
    );
  }
});
