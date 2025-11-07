# Base Integration Setup

Your app is now integrated with Base (Coinbase's L2 blockchain) using OnchainKit!

## Features Added

✅ **Wallet Connection**: Users can connect their Coinbase Smart Wallet
✅ **Base Network**: App is configured to use Base mainnet
✅ **OnchainKit Components**: Wallet, Identity, Avatar, Address, Balance
✅ **Wagmi & Viem**: Full Web3 functionality with React hooks

## Setup Instructions

### 1. Get OnchainKit API Key

1. Visit https://portal.cdp.coinbase.com/products/onchainkit
2. Sign up or log in with your Coinbase account
3. Create a new project
4. Copy your API key

### 2. Update Environment Variables

Add to your `.env` file:
```
VITE_ONCHAINKIT_API_KEY=your_api_key_here
```

### 3. Deploy to Vercel

Add the environment variable in Vercel:
```bash
vercel env add VITE_ONCHAINKIT_API_KEY
```

Or add it manually in the Vercel dashboard:
1. Go to your project settings
2. Navigate to Environment Variables
3. Add `VITE_ONCHAINKIT_API_KEY` with your API key

### 4. Test Locally

```bash
npm run dev
```

Click the "Connect Wallet" button in the header to test!

## What's Included

### Provider Setup (`src/providers/BaseProvider.tsx`)
- Wraps your app with Wagmi, React Query, and OnchainKit providers
- Configured for Base mainnet
- Uses Coinbase Smart Wallet connector

### Wallet Component (`src/components/WalletConnect.tsx`)
- Connect/Disconnect wallet button
- User identity display (avatar, name, address)
- ETH balance on Base
- Link to Coinbase Wallet dashboard

### Updated Files
- `src/main.tsx` - Wrapped with BaseProvider
- `src/pages/Index.tsx` - Added WalletConnect to header
- `src/index.css` - Imported OnchainKit styles

## Next Steps

Now that Base is integrated, you can:

1. **Add Web3 Features**: Use Wagmi hooks to interact with smart contracts
2. **Token Swaps**: Integrate swap functionality for trading
3. **NFT Display**: Show user's NFT holdings
4. **On-chain Actions**: Let users perform blockchain transactions
5. **Base Name Service**: Resolve Base names (.base.eth)

## Resources

- [OnchainKit Documentation](https://onchainkit.xyz)
- [Base Documentation](https://docs.base.org)
- [Wagmi Documentation](https://wagmi.sh)
- [Smart Wallet Guide](https://www.smartwallet.dev)
