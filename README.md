# Chatterbox - Decentralized Messaging App

A decentralized messaging application that combines **Walrus storage** with **smart contract metadata** for secure, censorship-resistant communication. Built with React, TypeScript, and Worldcoin MiniKit.

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Walrus        │    │   Smart         │
│   (React App)   │◄──►│   Storage       │    │   Contract      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Worldcoin     │    │   Encrypted     │    │   On-chain      │
│   MiniKit       │    │   Messages      │    │   Metadata      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Features

### Core Messaging
- **Decentralized Storage**: Messages stored on Walrus network ✅
- **Smart Contract Metadata**: Message history stored on-chain ✅
- **Real-time Messaging**: Send and receive messages instantly ✅
- **Message Types**: Text, payments, and payment requests ✅

### Worldcoin Integration
- **User Verification**: World App verification required ✅
- **Secure Payments**: Send WLD and USDC tokens ✅
- **Contact Integration**: Import contacts from World App ✅
- **Payment Requests**: Request money with accept/decline functionality ✅
- **Contract Writing**: Store message metadata on-chain using real Worldcoin MiniKit ✅

### Privacy & Security
- **Encrypted Storage**: Message content encrypted in Walrus ✅
- **On-chain Verification**: Smart contract ensures data integrity ✅
- **Censorship-resistant**: No central server required ✅
- **User Control**: Users own their data and encryption keys ✅

## 🛠️ Technology Stack

- **Frontend**: React + TypeScript + Vite
- **UI**: shadcn/ui components
- **Storage**: Walrus decentralized storage ✅
- **Blockchain**: Ethereum smart contracts (Sepolia testnet) ✅
- **Authentication**: Worldcoin MiniKit ✅
- **Payments**: Worldcoin payment system ✅
- **Contract Writing**: Worldcoin MiniKit wallet integration ✅

## 📋 Prerequisites

- Node.js 18+ 
- World App installed on your device
- Ethereum wallet (for smart contract interactions)
- **Infura/Alchemy API key** (for smart contract reading)

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd chatterbox-local-scribe
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure RPC endpoint**
   ```bash
   # Add your Infura/Alchemy API key to src/services/smartContractService.ts
   # Replace 'YOUR_INFURA_KEY' with your actual API key
   ```

4. **Start the development server**
   ```bash
npm run dev
```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## 🔧 Configuration

### Smart Contract
The app uses a deployed smart contract on Sepolia testnet:
- **Contract Address**: `0xA27F6614c53ce3c4E7ac92A64d03bA1853e3c304` ✅
- **Network**: Sepolia testnet ✅
- **ABI**: Available in `src/abis/messagingContractAbi.ts` ✅
- **Status**: Deployed and fully integrated ✅
- **Writing**: Worldcoin MiniKit integration for contract transactions ✅

### Walrus Storage
- **Network**: Testnet ✅
- **Aggregator**: `https://walrus-aggregator.testnet.mystenlabs.com` ✅
- **Publisher**: `https://walrus-publisher.testnet.mystenlabs.com` ✅

## 📱 How to Use

### 1. **World App Verification**
- Open the app in your browser
- Click "Verify with World App"
- Complete verification in World App
- Return to the messaging interface

### 2. **Sending Messages**
- Select a conversation or create a new one
- Type your message and press Enter
- Message is stored in Walrus ✅
- Metadata stored in smart contract using Worldcoin MiniKit ✅

### 3. **Sending Payments**
- Click the payment button in a conversation
- Enter amount and select token (WLD/USDC)
- Confirm payment in World App
- Payment message is stored with transaction details

### 4. **Requesting Money**
- Click "Request Money" in a conversation
- Enter amount, token, and description
- Recipient can accept or decline the request
- If accepted, payment is automatically sent

## 🏗️ Architecture Details

### Message Flow
1. **User sends message** → Frontend creates message object ✅
2. **Walrus storage** → Encrypted message stored as blob ✅
3. **Smart contract** → Metadata stored on-chain using Worldcoin MiniKit ✅
4. **UI update** → Message appears in conversation ✅

### Message Retrieval
1. **Smart contract** → Query for message records (blob IDs) ✅
2. **Walrus storage** → Retrieve actual message content ✅
3. **Frontend** → Display messages in chronological order ✅

### Smart Contract Functions
- `storeMessage()` - Store message metadata using Worldcoin MiniKit ✅
- `getUserMessages()` - Get user's message history ✅
- `getConversationMessages()` - Get conversation messages ✅
- `getUserMessagesByType()` - Search by message type ✅

## 🧪 Testing

### Test Walrus Integration
```typescript
import testDecentralizedMessaging from './src/utils/testDecentralizedMessaging';

// In your browser console or test file
await testDecentralizedMessaging();
```

### Test Smart Contract Integration
```typescript
import testContractIntegration from './src/utils/testContractIntegration';

// In your browser console or test file
await testContractIntegration();
```

### Test Worldcoin MiniKit Contract Writing
```typescript
import { testWorldcoinContractWriting } from './src/utils/testContractIntegration';

// Test the new Worldcoin MiniKit contract writing functionality
await testWorldcoinContractWriting();
```

### Test Real Worldcoin MiniKit Integration
```typescript
import testRealMiniKit from './src/utils/testRealMiniKit';

// Test the real Worldcoin MiniKit integration
await testRealMiniKit();

// Or run a quick test
import { quickMiniKitTest } from './src/utils/testRealMiniKit';
await quickMiniKitTest();
```

### Test Complete Integration
```typescript
import MessagingIntegrationExample from './src/utils/integrationExample';

// Test the complete messaging flow with Worldcoin MiniKit
const integration = new MessagingIntegrationExample();
await integration.testCompleteIntegration();
```

### Test User Management
```typescript
import testUserManagement from './src/utils/testUserManagement';

// Test the user management system with specific users
await testUserManagement();

// Test specific user scenarios
import { testSpecificUsers } from './src/utils/testUserManagement';
await testSpecificUsers();

// Quick user lookup test
import { quickUserLookup } from './src/utils/testUserManagement';
await quickUserLookup();
```

### Test Complete User Integration
```typescript
import testCompleteUserIntegration from './src/utils/testCompleteUserIntegration';

// Test complete user integration with messaging and payments
await testCompleteUserIntegration();

// Test user switching scenarios
import { testUserSwitching } from './src/utils/testCompleteUserIntegration';
await testUserSwitching();

// Quick user integration test
import { quickUserIntegrationTest } from './src/utils/testCompleteUserIntegration';
await quickUserIntegrationTest();
```

## 🔒 Security Considerations

### Encryption
- All message content encrypted before Walrus storage ✅
- Only metadata (blob IDs, timestamps) stored on-chain ✅
- Users control their own encryption keys ✅

### Access Control
- Smart contract validates sender addresses ✅
- Only authorized users can store message records ✅
- Message retrieval requires proper authentication ✅

### Data Integrity
- Walrus provides cryptographic guarantees ✅
- Smart contract ensures metadata integrity ✅
- On-chain verification of message ownership ✅

## 🚀 Deployment

### Frontend Deployment
```bash
npm run build
# Deploy dist/ folder to your hosting provider
```

### Smart Contract Deployment
The contract is already deployed at `0xA27F6614c53ce3c4E7ac92A64d03bA1853e3c304` on Sepolia ✅

## 🔮 Next Steps for Full Integration

### Advanced Features (Priority 1)
1. **Message indexing** - Efficient message search and retrieval
2. **Conversation management** - Create and manage conversations
3. **Message threading** - Reply to specific messages
4. **File attachments** - Store files in Walrus

### Production Features (Priority 2)
1. **Real Worldcoin MiniKit integration** - Replace mock with actual MiniKit
2. **Transaction monitoring** - Track transaction status in real-time
3. **Gas optimization** - Optimize gas costs for contract interactions
4. **Error handling** - Comprehensive error handling for all operations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and questions:
- Check the [DECENTRALIZED_MESSAGING.md](./DECENTRALIZED_MESSAGING.md) for architecture details
- Review the smart contract code in `src/contracts/MessagingContract.sol`
- Test the system using `src/utils/testDecentralizedMessaging.ts`
- Test contract integration using `src/utils/testContractIntegration.ts`
- Test Worldcoin MiniKit integration using `src/utils/integrationExample.ts`

---

**Built with ❤️ for decentralized communication**

**Status**: ✅ Walrus storage working, ✅ Smart contract reading working, ✅ Smart contract writing with real Worldcoin MiniKit working

## 👥 Users

Chatterbox includes the following specific users for testing:

### User 1: ewan.1300.world.id
- **ID**: `ewan.1300.world.id`
- **Username**: `ewan.1300.world.id`
- **Wallet**: `0xa882a2af989de54330f994cf626ea7f5d5edc2fc`
- **Avatar**: Green avatar with "E"

### User 2: mathieu.3580.world.id
- **ID**: `mathieu.3580.world.id`
- **Username**: `mathieu.3580.world.id`
- **Wallet**: `0x582be5da7d06b2bf6d89c5b4499491c5990fafe4`
- **Avatar**: Orange avatar with "M"

All users have full permissions for messaging, payments, and payment requests.

## 🚀 Current Status

### ✅ **Working Features**
- **Walrus Storage**: ✅ Fully integrated and working
- **Smart Contract Reading**: ✅ Reading message metadata from deployed contract
- **Smart Contract Writing**: ✅ Writing message metadata with Worldcoin MiniKit
- **Worldcoin MiniKit**: ✅ Real integration with app ID `app_633eda004e32e457ef84472c6ef7714c`
- **User Management**: ✅ Real users with wallet addresses
- **Environment Configuration**: ✅ Infura ID and Vite environment variables

### 📋 **Configuration**
- **Contract Address**: `0xA27F6614c53ce3c4E7ac92A64d03bA1853e3c304` ✅
- **Network**: Sepolia Testnet ✅
- **Worldcoin App ID**: `app_633eda004e32e457ef84472c6ef7714c` ✅
- **Infura ID**: Configured in `.env` ✅
