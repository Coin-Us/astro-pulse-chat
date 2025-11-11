import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown } from 'lucide-react';
import { getRecentTransfers, analyzeTransferActivity, type WalletTransfer, type TransferAnalysis } from '@/lib/transfer-analysis';

interface WhaleActivityProps {
  coinSymbol: string;
}

export function WhaleActivity({ coinSymbol }: WhaleActivityProps) {
  const [transfers, setTransfers] = useState<WalletTransfer[]>([]);
  const [analysis, setAnalysis] = useState<TransferAnalysis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchData() {
      setLoading(true);
      try {
        const [transfersData, analysisData] = await Promise.all([
          getRecentTransfers(coinSymbol, 24),
          analyzeTransferActivity(coinSymbol, 24)
        ]);

        if (mounted) {
          setTransfers(transfersData.slice(0, 10)); // Top 10 transfers
          setAnalysis(analysisData);
        }
      } catch (error) {
        console.error('Error fetching whale activity:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchData();
    const interval = setInterval(fetchData, 60000); // Refresh every minute

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [coinSymbol]);

  if (loading) {
    return (
      <Card className="p-6 bg-card border-border">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/3"></div>
          <div className="h-20 bg-muted rounded"></div>
          <div className="space-y-2">
            <div className="h-12 bg-muted rounded"></div>
            <div className="h-12 bg-muted rounded"></div>
          </div>
        </div>
      </Card>
    );
  }

  if (!analysis || transfers.length === 0) {
    return (
      <Card className="p-6 bg-card border-border">
        <div className="text-center text-muted-foreground py-4">
          No recent whale activity detected for {coinSymbol.toUpperCase()}
        </div>
      </Card>
    );
  }

  const { whale_activity, signal, confidence } = analysis;
  const isBullish = signal === 'BUY';
  const isBearish = signal === 'SELL';

  return (
    <div className="space-y-4">
      {/* Signal Summary */}
      <Card className={`p-6 border-2 ${
        isBullish ? 'border-green-500/30 bg-green-500/5' : 
        isBearish ? 'border-red-500/30 bg-red-500/5' : 
        'border-border bg-card'
      }`}>
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              🐋 Whale Activity Signal
              {isBullish ? <TrendingUp className="h-5 w-5 text-green-500" /> : 
               isBearish ? <TrendingDown className="h-5 w-5 text-red-500" /> : null}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Based on {analysis.transfer_count} significant transfers in the last 24h
            </p>
          </div>
          <div className="text-right">
            <div className={`text-2xl font-bold ${
              isBullish ? 'text-green-500' : 
              isBearish ? 'text-red-500' : 
              'text-foreground'
            }`}>
              {signal}
            </div>
            <div className="text-sm text-muted-foreground">{confidence}% confidence</div>
          </div>
        </div>

        {/* Flow Summary */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div>
            <div className="text-xs text-muted-foreground mb-1">Exchange Withdrawals</div>
            <div className="text-lg font-semibold text-green-500">
              ${(whale_activity.exchange_withdrawals_usd / 1000000).toFixed(2)}M
            </div>
            <div className="text-xs text-muted-foreground">Bullish (to wallets)</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Exchange Deposits</div>
            <div className="text-lg font-semibold text-red-500">
              ${(whale_activity.exchange_deposits_usd / 1000000).toFixed(2)}M
            </div>
            <div className="text-xs text-muted-foreground">Bearish (to exchanges)</div>
          </div>
        </div>

        {/* Whale Status */}
        {(whale_activity.whale_accumulating || whale_activity.whale_distributing) && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className={`flex items-center gap-2 ${
              whale_activity.whale_accumulating ? 'text-green-500' : 'text-red-500'
            }`}>
              {whale_activity.whale_accumulating ? (
                <>
                  <TrendingUp className="h-4 w-4" />
                  <span className="font-semibold">Whales are accumulating</span>
                  <span className="text-sm">
                    (+${(Math.abs(whale_activity.net_flow_usd) / 1000000).toFixed(2)}M)
                  </span>
                </>
              ) : (
                <>
                  <TrendingDown className="h-4 w-4" />
                  <span className="font-semibold">Whales are distributing</span>
                  <span className="text-sm">
                    (-${(Math.abs(whale_activity.net_flow_usd) / 1000000).toFixed(2)}M)
                  </span>
                </>
              )}
            </div>
          </div>
        )}
      </Card>

      {/* Recent Transfers */}
      <Card className="p-6 bg-card border-border">
        <h3 className="text-lg font-semibold mb-4">Recent Significant Transfers</h3>
        <div className="space-y-3">
          {transfers.map((transfer) => {
            const isWithdrawal = transfer.transfer_direction === 'exchange_to_wallet';
            const isDeposit = transfer.transfer_direction === 'wallet_to_exchange';
            const isWhaleInvolved = transfer.from_wallet_type === 'whale' || transfer.to_wallet_type === 'whale';

            return (
              <div
                key={transfer.id}
                className={`p-4 rounded-lg border ${
                  isWhaleInvolved ? 'border-amber-500/30 bg-amber-500/5' : 'border-border bg-muted/30'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {isWhaleInvolved && <span>🐋</span>}
                      {isWithdrawal ? (
                        <ArrowUpRight className="h-4 w-4 text-green-500" />
                      ) : isDeposit ? (
                        <ArrowDownRight className="h-4 w-4 text-red-500" />
                      ) : null}
                      <span className="font-medium text-sm">
                        {transfer.from_wallet_type} → {transfer.to_wallet_type}
                      </span>
                    </div>
                    
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div>From: {transfer.from_address.slice(0, 10)}...{transfer.from_address.slice(-8)}</div>
                      <div>To: {transfer.to_address.slice(0, 10)}...{transfer.to_address.slice(-8)}</div>
                      <div>{new Date(transfer.timestamp).toLocaleString()}</div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-semibold">
                      ${(transfer.value_usd / 1000).toFixed(1)}K
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {parseFloat(transfer.value).toFixed(2)} {transfer.asset_symbol}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {transfers.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            No significant transfers detected in the last 24 hours
          </div>
        )}
      </Card>
    </div>
  );
}
