# Cometh Connect Integration Setup

This guide explains how to integrate Cometh Connect with your Worldcoin Safe wallet for the Chatterbox messaging app.

## Overview

The integration replaces Worldcoin MiniKit with Cometh Connect to interact with your Worldcoin Safe 1.4 wallet. This provides:
- Safe wallet transactions
- Passkey authentication
- Gasless transactions via paymaster
- Better UX for Safe interactions

## Setup Steps

### 1. Install Dependencies

The required dependencies have been added to `package.json`:
- `@cometh/connect-react-hooks`
- `@cometh/connect-sdk-4337`
- `wagmi`

Run:
```bash
npm install
```

### 2. Environment Variables

Create a `.env` file in your project root with the following variables:

```env
# Cometh Connect Configuration
VITE_COMETH_API_KEY=your_cometh_api_key_here
VITE_4337_BUNDLER_URL=https://bundler.cometh.io/480?apikey=your_api_key
VITE_4337_PAYMASTER_URL=https://paymaster.cometh.io/480?apikey=your_api_key
VITE_ENTRYPOINT_ADDRESS=0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789
VITE_SAFE_ADDRESS=your_worldcoin_safe_address_here
```

**Note**: The configuration has been updated to use your environment variable names:
- `VITE_4337_BUNDLER_URL` instead of `VITE_WORLDCHAIN_BUNDLER_URL`
- `VITE_4337_PAYMASTER_URL` instead of `VITE_WORLDCHAIN_PAYMASTER_URL`

### 3. Get Cometh API Key

1. Go to [Cometh Console](https://console.cometh.io/)
2. Create an account and get your API key
3. Add the API key to your `.env` file

### 4. Configure Your Safe Address

Replace `your_worldcoin_safe_address_here` with your actual Worldcoin Safe address.

### 5. Import Your Safe (Optional)

If your Safe needs to be imported into Cometh Connect, you'll need to:

1. **For Safe 1.4.0**: The code includes import functionality but requires the current Safe owner's signature
2. **For Safe 1.3.0**: The import process is similar but uses different import functions

The import process is handled automatically in the `ComethService.initialize()` method.

### 6. Update Your App

Replace the existing `MessagingContext` with the new Cometh version:

```tsx
// In your main App component
import { MessagingProvider } from './contexts/MessagingContextCometh';

function App() {
  return (
    <MessagingProvider>
      {/* Your app components */}
    </MessagingProvider>
  );
}
```

## Architecture

### Files Created/Modified

1. **`src/services/comethService.ts`** - Cometh Connect service for Safe interactions
2. **`src/config/cometh.ts`** - Configuration management
3. **`src/contexts/MessagingContextCometh.tsx`** - New context with Cometh integration
4. **`package.json`** - Added Cometh dependencies

### Key Features

- **Safe Wallet Integration**: All transactions go through your Safe wallet
- **Passkey Authentication**: Uses WebAuthn for secure authentication
- **Gasless Transactions**: Paymaster handles gas fees
- **Message Storage**: Messages stored in Walrus + metadata on smart contract
- **Payment Support**: Send WLD/USDC payments through Safe

### Configuration

The integration uses:
- **Walrus**: testnet (for message storage)
- **Smart Contract**: mainnet (Worldchain mainnet)
- **Safe**: Your Worldcoin Safe 1.4 address

## Usage

### Sending Messages

Messages are stored in Walrus and metadata is stored on the smart contract via Safe transactions.

### Sending Payments

Payments are sent directly through your Safe wallet using Cometh Connect.

### Error Handling

The service includes comprehensive error handling and logging for debugging.

## Troubleshooting

### Common Issues

1. **"Invalid Cometh configuration"**: Check your environment variables
2. **"Safe import failed"**: Ensure your Safe address is correct
3. **"Transaction failed"**: Check your Safe has sufficient funds

### Debug Mode

Enable debug logging by checking the browser console for detailed logs.

## Next Steps

1. Set up your environment variables
2. Test the integration with your Safe
3. Customize the UI to show Safe-specific information
4. Add additional Safe features as needed

## Resources

- [Cometh Connect Documentation](https://docs.cometh.io/)
- [Safe Import Guide](https://docs.cometh.io/core-features/import-a-safe-into-connect)
- [Worldcoin Safe Documentation](https://docs.worldcoin.org/) 