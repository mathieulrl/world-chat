# Real Transactions Guide

## 🎯 Goal: Enable Real Transactions on Your Smart Contract

You want to make real transactions on your smart contract instead of using mock transactions. Here's how to achieve this.

## 🚨 Current Issue

MiniKit is returning `invalid_contract` error because your contract address `0x063816286ae3312e759f80Afdb10C8879b30688D` is not registered with the MiniKit app.

## 🔧 Solutions

### Option 1: Register Contract with MiniKit (Recommended)

**Steps:**
1. Go to [Worldcoin Developer Portal](https://developer.worldcoin.org/)
2. Navigate to your app: `app_633eda004e32e457ef84472c6ef7714c`
3. Go to **Configuration → Advanced**
4. Add your contract address: `0x063816286ae3312e759f80Afdb10C8879b30688D`
5. Select chain: **Worldcoin Sepolia (4801)**
6. Submit for approval
7. Wait for Worldcoin team to approve your contract

**Expected Timeline:** 1-3 business days for approval

### Option 2: Use Alternative Wallet Integration

If you can't wait for MiniKit approval, implement direct wallet integration:

```typescript
// Example: MetaMask Integration
import { createWalletClient, custom } from 'viem';

const walletClient = createWalletClient({
  chain: worldcoinSepolia,
  transport: custom(window.ethereum)
});

// Execute transaction directly
const hash = await walletClient.writeContract({
  address: '0x063816286ae3312e759f80Afdb10C8879b30688D',
  abi: messagingContractAbi,
  functionName: 'storeMessage',
  args: [blobId, conversationId, messageType, '', '']
});
```

### Option 3: WalletConnect Integration

Use WalletConnect to support multiple wallets:

```typescript
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect';

const connector = new WalletConnectConnector({
  options: {
    projectId: 'your-project-id',
    chains: [worldcoinSepolia]
  }
});
```

## 🧪 Testing Your Contract

### Verify Contract Deployment

```bash
# Check if contract exists on chain
curl -X POST -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_getCode","params":["0x063816286ae3312e759f80Afdb10C8879b30688D","latest"],"id":1}' \
  https://worldchain-sepolia.drpc.org
```

### Test Contract Reading

```typescript
// Test reading from contract
const messageCount = await publicClient.readContract({
  address: '0x063816286ae3312e759f80Afdb10C8879b30688D',
  abi: messagingContractAbi,
  functionName: 'getUserMessageCount',
  args: ['0x0000000000000000000000000000000000000000']
});
```

## 📋 Implementation Steps

### Step 1: Remove Mock Fallback

The code has been updated to remove mock transactions. Now it will:

- ✅ Return proper error messages
- ✅ Provide guidance for contract registration
- ✅ Show alternative transaction methods
- ❌ No longer return mock transaction hashes

### Step 2: Choose Your Transaction Method

**For MiniKit (Recommended):**
1. Register contract in Developer Portal
2. Wait for approval
3. Use existing MiniKit integration

**For Direct Wallet:**
1. Implement wallet connection (MetaMask, etc.)
2. Use viem's `writeContract` method
3. Handle user signature and approval

**For WalletConnect:**
1. Set up WalletConnect project
2. Implement connector
3. Support multiple wallet types

### Step 3: Update Error Handling

The app now provides clear guidance when transactions fail:

```typescript
// Example error message
"Contract 0x063816286ae3312e759f80Afdb10C8879b30688D not registered with MiniKit app. Please register the contract in the Worldcoin Developer Portal or use an alternative transaction method."
```

## 🔍 Debugging

### Check Contract Status

```typescript
// Test contract connection
const isConnected = await smartContractService.testContractConnection();
console.log('Contract connected:', isConnected);

// Get contract info
const contractInfo = smartContractService.getContractInfo();
console.log('Contract info:', contractInfo);
```

### Check MiniKit Status

```typescript
// Test MiniKit integration
const isInstalled = await worldcoinService.isInstalled();
console.log('MiniKit installed:', isInstalled);

// Test contract transaction
const result = await worldcoinService.executeContractTransaction(
  transactionRequest,
  userAddress
);
console.log('Transaction result:', result);
```

## 📞 Support

### Worldcoin Developer Portal
- **URL:** https://developer.worldcoin.org/
- **Contact:** developer-support@worldcoin.org
- **Documentation:** https://docs.worldcoin.org/

### MiniKit Documentation
- **URL:** https://docs.world.org/mini-apps/commands/send-transaction
- **GitHub:** https://github.com/worldcoin/minikit-js

### Alternative Resources
- **Viem Documentation:** https://viem.sh/
- **WalletConnect:** https://walletconnect.com/
- **MetaMask:** https://docs.metamask.io/

## 🎯 Next Steps

1. **Immediate:** Register your contract in the Worldcoin Developer Portal
2. **Short-term:** Implement alternative wallet integration as backup
3. **Long-term:** Set up comprehensive wallet support (MetaMask, WalletConnect, etc.)

## 📊 Current Status

- ✅ **Contract Deployed:** `0x063816286ae3312e759f80Afdb10C8879b30688D`
- ✅ **Chain:** Worldcoin Sepolia (4801)
- ✅ **RPC:** https://worldchain-sepolia.drpc.org
- ❌ **MiniKit Registration:** Pending
- ❌ **Real Transactions:** Not working (due to registration)

Once you register the contract with MiniKit, real transactions will work immediately! 