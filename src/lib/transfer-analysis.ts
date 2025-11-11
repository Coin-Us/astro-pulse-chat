import { supabase } from './supabase';

export interface WalletTransfer {
  id: string;
  created_at: string;
  transaction_hash: string;
  block_number: number;
  timestamp: string;
  from_address: string;
  to_address: string;
  value: string;
  value_usd: number;
  asset_symbol: string;
  asset_address: string | null;
  token_decimals: number;
  from_wallet_type: string;
  to_wallet_type: string;
  is_significant: boolean;
  transfer_direction: string;
  chain_id: number;
  network: string;
}

export interface WhaleWallet {
  address: string;
  label: string | null;
  wallet_type: string;
  last_known_balance_usd: number | null;
  total_transfers_24h: number;
  total_volume_24h_usd: number;
  trading_pattern: string | null;
}

export interface TransferAnalysis {
  asset_symbol: string;
  signal: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  reasoning: string;
  whale_activity: {
    inflows_usd: number;
    outflows_usd: number;
    net_flow_usd: number;
    exchange_withdrawals_usd: number;
    exchange_deposits_usd: number;
    whale_accumulating: boolean;
    whale_distributing: boolean;
  };
  transfer_count: number;
  timeframe: string;
}

/**
 * Get recent significant transfers for an asset
 */
export async function getRecentTransfers(
  assetSymbol: string,
  hours: number = 24
): Promise<WalletTransfer[]> {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from('wallet_transfers')
    .select('*')
    .eq('asset_symbol', assetSymbol.toUpperCase())
    .eq('is_significant', true)
    .gte('timestamp', since)
    .order('timestamp', { ascending: false })
    .limit(100);

  if (error) {
    console.error('Error fetching transfers:', error);
    return [];
  }

  return data || [];
}

/**
 * Analyze transfer activity and generate trading signal
 */
export async function analyzeTransferActivity(
  assetSymbol: string,
  hours: number = 24
): Promise<TransferAnalysis | null> {
  const transfers = await getRecentTransfers(assetSymbol, hours);

  if (transfers.length === 0) {
    return null;
  }

  // Calculate flows
  let exchangeWithdrawals = 0; // exchange -> wallet (bullish)
  let exchangeDeposits = 0;    // wallet -> exchange (bearish)
  let whaleInflows = 0;
  let whaleOutflows = 0;

  transfers.forEach(transfer => {
    const value = transfer.value_usd;

    if (transfer.transfer_direction === 'exchange_to_wallet') {
      exchangeWithdrawals += value;
    } else if (transfer.transfer_direction === 'wallet_to_exchange') {
      exchangeDeposits += value;
    }

    // Track whale activity
    if (transfer.from_wallet_type === 'whale') {
      whaleOutflows += value;
    }
    if (transfer.to_wallet_type === 'whale') {
      whaleInflows += value;
    }
  });

  const netFlow = exchangeWithdrawals - exchangeDeposits;
  const whaleNetFlow = whaleInflows - whaleOutflows;

  // Generate signal based on flows
  let signal: 'BUY' | 'SELL' | 'HOLD' = 'HOLD';
  let confidence = 50;
  let reasoning = '';

  const totalVolume = exchangeWithdrawals + exchangeDeposits;
  const whaleAccumulating = whaleNetFlow > 0 && Math.abs(whaleNetFlow) > totalVolume * 0.1;
  const whaleDistributing = whaleNetFlow < 0 && Math.abs(whaleNetFlow) > totalVolume * 0.1;

  // Bullish signals
  if (netFlow > 0 && exchangeWithdrawals > 500000) {
    signal = 'BUY';
    confidence = Math.min(90, 50 + (netFlow / totalVolume) * 40);
    reasoning = `Strong exchange outflows detected: $${(exchangeWithdrawals / 1000000).toFixed(2)}M withdrawn vs $${(exchangeDeposits / 1000000).toFixed(2)}M deposited. `;
    
    if (whaleAccumulating) {
      confidence = Math.min(95, confidence + 10);
      reasoning += `Whales are accumulating (+$${(whaleNetFlow / 1000000).toFixed(2)}M). `;
    }
  }
  // Bearish signals
  else if (netFlow < 0 && exchangeDeposits > 500000) {
    signal = 'SELL';
    confidence = Math.min(90, 50 + (Math.abs(netFlow) / totalVolume) * 40);
    reasoning = `Strong exchange inflows detected: $${(exchangeDeposits / 1000000).toFixed(2)}M deposited vs $${(exchangeWithdrawals / 1000000).toFixed(2)}M withdrawn. `;
    
    if (whaleDistributing) {
      confidence = Math.min(95, confidence + 10);
      reasoning += `Whales are distributing (-$${(Math.abs(whaleNetFlow) / 1000000).toFixed(2)}M). `;
    }
  }
  // Neutral
  else {
    signal = 'HOLD';
    confidence = 60;
    reasoning = `Balanced flow activity: $${(totalVolume / 1000000).toFixed(2)}M total volume with neutral sentiment. `;
  }

  reasoning += `Based on ${transfers.length} significant transfers in the last ${hours}h.`;

  return {
    asset_symbol: assetSymbol,
    signal,
    confidence,
    reasoning,
    whale_activity: {
      inflows_usd: whaleInflows,
      outflows_usd: whaleOutflows,
      net_flow_usd: whaleNetFlow,
      exchange_withdrawals_usd: exchangeWithdrawals,
      exchange_deposits_usd: exchangeDeposits,
      whale_accumulating: whaleAccumulating,
      whale_distributing: whaleDistributing,
    },
    transfer_count: transfers.length,
    timeframe: `${hours}h`,
  };
}

/**
 * Get whale wallet activity for an asset
 */
export async function getWhaleActivity(assetSymbol: string): Promise<WhaleWallet[]> {
  // Get transfers involving whales
  const { data: transfers } = await supabase
    .from('wallet_transfers')
    .select('from_address, to_address, from_wallet_type, to_wallet_type')
    .eq('asset_symbol', assetSymbol.toUpperCase())
    .eq('is_significant', true)
    .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

  if (!transfers) return [];

  // Extract unique whale addresses
  const whaleAddresses = new Set<string>();
  transfers.forEach(t => {
    if (t.from_wallet_type === 'whale') whaleAddresses.add(t.from_address);
    if (t.to_wallet_type === 'whale') whaleAddresses.add(t.to_address);
  });

  if (whaleAddresses.size === 0) return [];

  // Fetch whale wallet details
  const { data: whales } = await supabase
    .from('whale_wallets')
    .select('*')
    .in('address', Array.from(whaleAddresses));

  return whales || [];
}

/**
 * Format transfer analysis for AI consumption
 */
export function formatTransferAnalysisForAI(analysis: TransferAnalysis | null): string {
  if (!analysis) {
    return 'No recent whale transfer activity detected for this asset.';
  }

  const { whale_activity, signal, confidence, reasoning } = analysis;

  let summary = `\n\n📊 **WHALE TRANSFER ANALYSIS** (${analysis.timeframe}):\n`;
  summary += `**Signal**: ${signal} (${confidence}% confidence)\n\n`;
  summary += `**Exchange Flows**:\n`;
  summary += `- Withdrawals (Bullish): $${(whale_activity.exchange_withdrawals_usd / 1000000).toFixed(2)}M\n`;
  summary += `- Deposits (Bearish): $${(whale_activity.exchange_deposits_usd / 1000000).toFixed(2)}M\n`;
  summary += `- Net Flow: $${(whale_activity.net_flow_usd / 1000000).toFixed(2)}M\n\n`;
  
  summary += `**Whale Activity**:\n`;
  summary += `- Inflows: $${(whale_activity.inflows_usd / 1000000).toFixed(2)}M\n`;
  summary += `- Outflows: $${(whale_activity.outflows_usd / 1000000).toFixed(2)}M\n`;
  summary += `- Status: ${whale_activity.whale_accumulating ? '🐋 ACCUMULATING' : whale_activity.whale_distributing ? '📉 DISTRIBUTING' : '➡️ NEUTRAL'}\n\n`;
  
  summary += `**Analysis**: ${reasoning}\n`;
  summary += `**Transfers Analyzed**: ${analysis.transfer_count} significant transactions\n`;

  return summary;
}
