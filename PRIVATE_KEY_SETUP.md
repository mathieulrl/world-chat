# Private Key Wallet Setup Guide

## Overview

This setup allows you to send transactions to the smart contract using a private key stored in environment variables, instead of relying on user wallet connections.

## Setup Steps

### 1. Create Environment File

Create a `.env` file in your project root:

```env
# Private Key Configuration (REQUIRED)
VITE_PRIVATE_KEY=your_private_key_here_without_0x_prefix

# Smart Contract Configuration
VITE_CONTRACT_ADDRESS=0x34bF1A2460190e60e33309BF8c54D9A7c9eCB4B8
VITE_NETWORK_CHAIN_ID=480
VITE_RPC_URL=https://worldchain.drpc.org

# Cometh Connect Configuration (if using Cometh)
VITE_COMETH_APP_ID=your_cometh_app_id_here
VITE_COMETH_ENTRYPOINT_ADDRESS=0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789
VITE_COMETH_SAFE_ADDRESS=your_safe_address_here
```

### 2. Get Your Private Key

**⚠️ SECURITY WARNING: Never share your private key!**

1. **From MetaMask:**
   - Open MetaMask
   - Go to Account Details → Export Private Key
   - Enter your password
   - Copy the private key (without the 0x prefix)

2. **From Hardware Wallet:**
   - Use the private key from your hardware wallet
   - Make sure it has funds on Worldcoin network

3. **Generate New Wallet:**
   ```bash
   # Generate a new private key (for testing only)
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

### 3. Fund Your Wallet

Make sure your wallet has some ETH for gas fees on Worldcoin network:

1. **Get Worldcoin ETH:**
   - Use a faucet or bridge
   - Minimum recommended: 0.01 ETH

2. **Check Balance:**
   - The app will show your wallet address in console
   - Verify it has sufficient balance

### 4. Test the Setup

1. **Start the app:**
   ```bash
   npm run dev
   ```

2. **Check console for:**
   ```
   ✅ Private key wallet client initialized
   📋 Wallet address: 0x...
   ```

3. **Send a test message:**
   - The app will use your private key wallet for transactions
   - Check console for transaction hashes

## How It Works

### Transaction Flow:

1. **User sends message** → App stores in Walrus
2. **Private key wallet** → Sends transaction to smart contract
3. **Smart contract** → Stores message metadata
4. **User sees** → Message with transaction hash

### Fallback Behavior:

- **If private key available:** Uses private key wallet
- **If private key not set:** Falls back to Worldcoin MiniKit
- **If both fail:** Shows error message

## Security Considerations

### ✅ Good Practices:

1. **Environment Variables:** Private key only in `.env` file
2. **Git Ignore:** `.env` should be in `.gitignore`
3. **Limited Funds:** Only keep necessary funds in the wallet
4. **Testing:** Use test wallets for development

### ❌ Avoid:

1. **Hardcoding:** Never put private key in code
2. **Sharing:** Never share your private key
3. **Production:** Don't use main private keys in development
4. **Public Repos:** Never commit `.env` files

## Troubleshooting

### Common Issues:

1. **"Private key wallet not available"**
   - Check `VITE_PRIVATE_KEY` is set in `.env`
   - Make sure private key is valid (64 hex characters)

2. **"Insufficient funds"**
   - Add ETH to your wallet on Worldcoin network
   - Check balance in console logs

3. **"Transaction failed"**
   - Check gas fees
   - Verify contract address is correct
   - Ensure wallet has enough ETH

4. **"Invalid private key"**
   - Make sure private key is 64 hex characters
   - Don't include 0x prefix
   - Verify it's a valid private key

### Testing Commands:

```javascript
// Test private key wallet availability
console.log(smartContractService.isPrivateKeyWalletAvailable());

// Get wallet address
console.log(smartContractService.getPrivateKeyWalletAddress());

// Test contract writing
smartContractService.testContractWritingWithPrivateKey();
```

## Benefits

1. **No User Wallet Required:** Works without MetaMask or other wallets
2. **Reliable Transactions:** Direct control over transaction sending
3. **Fallback Support:** Still works with Worldcoin MiniKit if needed
4. **Development Friendly:** Easy to test and debug

## Next Steps

1. Set up your `.env` file with private key
2. Fund your wallet with Worldcoin ETH
3. Test sending a message
4. Check transaction hashes in console
5. Verify data is stored in smart contract

The app will now use your private key wallet for all smart contract transactions! 