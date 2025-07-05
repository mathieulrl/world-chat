# Troubleshooting Guide

## 🚨 Common Issues and Solutions

### 1. MiniKit "invalid_contract" Error

**Error Message:**
```
Error: invalid_contract
Description: Transaction contains unrecognized contract address
Contract: 0x063816286ae3312e759f80Afdb10C8879b30688D
```

**Cause:** The smart contract is not registered with the MiniKit app.

**Solutions:**

#### Option A: Development Mode (Recommended)
The app automatically handles this error in development mode by returning mock transaction success. This allows you to test the full flow without contract registration.

#### Option B: Register Contract with MiniKit
1. Open the World App
2. Go to MiniKit settings
3. Add contract address: `0x063816286ae3312e759f80Afdb10C8879b30688D`
4. Select chain: Worldcoin Sepolia (4801)
5. Confirm registration

#### Option C: Alternative Transaction Methods
- Use direct blockchain transactions with MetaMask
- Implement custom wallet integration
- Use Web3 providers like WalletConnect
- Contact Worldcoin support for contract whitelisting

### 2. Walrus Storage Connection Issues

**Error:** Failed to connect to Walrus storage

**Solutions:**
- Check if Walrus testnet is accessible
- Enable mock mode in development
- Verify network connectivity
- Check Walrus service status

### 3. Smart Contract Reading Issues

**Error:** Failed to read from smart contract

**Solutions:**
- Verify RPC URL is correct: `https://worldchain-sepolia.drpc.org`
- Check if contract is deployed at the correct address
- Ensure you're connected to Worldcoin Sepolia (chainId 4801)
- Verify contract ABI matches deployed contract

### 4. Worldcoin MiniKit API Errors

**Error:** 400 Bad Request from usernames.worldcoin.org

**Solutions:**
- The app uses mock user data to avoid API errors
- In production, ensure proper MiniKit app configuration
- Check Worldcoin API status
- Verify app ID is correct

### 5. Transaction Value Formatting

**Error:** Transaction value must be a valid hex string

**Solutions:**
- Transaction values are automatically formatted as hex strings
- Use `0x0` instead of `'0'` for zero value transactions
- Ensure proper bigint to hex conversion

## 🔧 Debugging Tools

### Test MiniKit Contract Registration
```bash
cd src/utils
node test-minikit-contract-registration.js
```

### Test Complete Integration
```typescript
import MessagingIntegrationExample from './src/utils/integrationExample';
const integration = new MessagingIntegrationExample();
await integration.testCompleteIntegration();
```

### Test Smart Contract
```typescript
import testContractIntegration from './src/utils/testContractIntegration';
await testContractIntegration();
```

### Test Walrus Storage
```typescript
import testDecentralizedMessaging from './src/utils/testDecentralizedMessaging';
await testDecentralizedMessaging();
```

## 📋 Environment Variables

Make sure these are properly configured:

```bash
# For smart contract interactions
INFURA_ID=your_infura_id  # Optional, uses public RPC
NODE_ENV=development      # For mock mode
```

## 🔍 Log Analysis

### MiniKit Error Analysis
The app provides detailed error analysis for MiniKit issues:
- Contract address verification
- Chain ID validation
- App ID confirmation
- Registration status check

### Enhanced Logging
Look for these log patterns:
- `🔍 Checking contract registration with MiniKit...`
- `⚠️ Contract not registered with MiniKit`
- `🔄 Development mode: Returning mock success`
- `❌ Production mode: Contract not registered`

## 🚀 Quick Fixes

### For Development
1. **Enable mock mode** - The app automatically uses mock transactions in development
2. **Use test utilities** - Run the provided test scripts to verify functionality
3. **Check console logs** - Detailed logging helps identify issues

### For Production
1. **Register contract** - Contact Worldcoin to register your contract
2. **Verify deployment** - Ensure contract is deployed on correct network
3. **Test thoroughly** - Use test scripts before deploying

## 📞 Support Resources

- **Worldcoin Documentation**: https://docs.worldcoin.org/
- **MiniKit Documentation**: https://docs.worldcoin.org/minikit
- **Walrus Documentation**: https://docs.walrus.space/
- **GitHub Issues**: Report bugs and feature requests

## 🔄 Status Check

Run this to check all components:

```typescript
// Check Walrus storage
await testDecentralizedMessaging();

// Check smart contract
await testContractIntegration();

// Check MiniKit integration
await testRealMiniKit();

// Check complete flow
const integration = new MessagingIntegrationExample();
await integration.testCompleteIntegration();
```

All tests should pass for full functionality. 