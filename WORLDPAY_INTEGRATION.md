# Worldcoin MiniKit Integration Guide

This guide explains how to configure and use the real Worldcoin MiniKit integration in Chatterbox.

## 🔧 Configuration

### 1. App ID Configuration

You need to replace the placeholder app ID in `src/services/worldcoinService.ts`:


To get your app ID:
1. Go to [Worldcoin Developer Portal](https://developer.worldcoin.org/)
2. Create a new app or use an existing one
3. Copy the app ID from your app settings

### 2. Environment Setup

The MiniKit integration works best in the World App environment. For testing:

1. **Install World App** on your device
2. **Open the app in World App** (not regular browser)
3. **Test the integration** using the provided test functions

## 🧪 Testing

### Quick Test
```typescript
import { quickMiniKitTest } from './src/utils/testRealMiniKit';

// Run this in your browser console or test file
await quickMiniKitTest();
```

### Full Integration Test
```typescript
import testRealMiniKit from './src/utils/testRealMiniKit';

// Run comprehensive MiniKit tests
await testRealMiniKit();
```

### Contract Writing Test
```typescript
import { testWorldcoinContractWriting } from './src/utils/testContractIntegration';

// Test contract writing with real MiniKit
await testWorldcoinContractWriting();
```

## 🔄 API Methods

### User Management
- `getCurrentUser()` - Get the currently connected user
- `getUserByAddress(address)` - Get user info by wallet address
- `isInstalled()` - Check if MiniKit is available

### Payments
- `executePayment(paymentRequest)` - Send WLD/USDC payments
- `sendPayment(paymentRequest)` - Alternative payment method

### Smart Contract Transactions
- `executeContractTransaction(transactionRequest, userAddress)` - Execute contract calls
- `storeMessageMetadata(contractAddress, abi, messageRecord, userAddress)` - Store message metadata
- `estimateGas(contractAddress, abi, functionName, args)` - Estimate gas for transactions

### Contacts
- `getContacts()` - Get user's contacts from World App

## 🚨 Troubleshooting

### Common Issues

1. **MiniKit not available**
   - Make sure you're running in World App
   - Check if World App is installed
   - Verify your app ID is correct

2. **User not connected**
   - User needs to be logged into World App
   - Check if user has granted necessary permissions

3. **Transaction failures**
   - Ensure user has sufficient balance
   - Check if the contract address is correct
   - Verify the ABI matches your deployed contract

### Debug Steps

1. **Check MiniKit availability**:
   ```typescript
   const worldcoinService = WorldcoinService.getInstance();
   const isInstalled = await worldcoinService.isInstalled();
   console.log('MiniKit installed:', isInstalled);
   ```

2. **Check user connection**:
   ```typescript
   const currentUser = await worldcoinService.getCurrentUser();
   console.log('Current user:', currentUser);
   ```

3. **Test basic functionality**:
   ```typescript
   await quickMiniKitTest();
   ```

## 📱 World App Integration

### Running in World App

1. **Build your app** for production
2. **Deploy to a web server** (HTTPS required)
3. **Submit to World App** for approval
4. **Test in World App environment**

### Development Testing

For development, you can test the integration by:
1. Running the app locally
2. Using the World App browser
3. Testing with the provided test functions

## 🔒 Security Considerations

- **App ID**: Keep your app ID secure and don't expose it in client-side code
- **User Data**: Always verify user permissions before accessing data
- **Transactions**: Validate all transaction parameters before execution
- **Error Handling**: Implement proper error handling for all MiniKit operations

## 📚 Additional Resources

- [Worldcoin MiniKit Documentation](https://docs.worldcoin.org/minikit)
- [World App Developer Portal](https://developer.worldcoin.org/)
- [MiniKit API Reference](https://docs.worldcoin.org/minikit/api)

---

**Note**: This integration requires the World App to be installed and the user to be connected for full functionality. 