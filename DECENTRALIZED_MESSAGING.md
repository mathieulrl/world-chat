# Decentralized Messaging Architecture

This document explains the decentralized messaging system that combines **Walrus storage** with **smart contract metadata** for a fully decentralized messaging experience.

## Architecture Overview

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

## How It Works

### 1. Message Flow

When a user sends a message:

1. **Frontend** creates a message object with content, sender, recipient, etc.
2. **Walrus Storage** stores the encrypted message content as a blob
3. **Smart Contract** stores metadata (blob ID, conversation ID, sender, etc.)
4. **Frontend** updates UI with the new message

### 2. Message Retrieval

When loading conversation history:

1. **Smart Contract** provides list of message records (blob IDs, metadata)
2. **Walrus Storage** retrieves actual message content using blob IDs
3. **Frontend** displays messages in chronological order

## Key Components

### Walrus Storage Service (`src/services/walrusStorageService.ts`)

Handles storing and retrieving message blobs on the Walrus network:

```typescript
// Store a message blob
const result = await walrusService.storeMessage(message, ownerAddress);
console.log(`Blob ID: ${result.blobId}`);

// Retrieve a message blob
const message = await walrusService.retrieveMessage(blobId);
```

### Smart Contract Service (`src/services/smartContractService.ts`)

Handles on-chain metadata storage and retrieval:

```typescript
// Store message metadata on-chain
const txHash = await contractService.storeMessageMetadata(messageRecord, senderAddress);

// Get message history from smart contract
const messageRecords = await contractService.getMessageHistory(userAddress);
```

### Decentralized Messaging Service (`src/services/decentralizedMessagingService.ts`)

Orchestrates both Walrus and smart contract operations:

```typescript
// Send a message (stores in Walrus + smart contract)
const { walrusResult, contractTxHash } = await decentralizedService.sendMessage(message, senderAddress);

// Get conversation messages (reads from smart contract + Walrus)
const messages = await decentralizedService.getConversationMessages(conversationId);
```

## Smart Contract (`src/contracts/MessagingContract.sol`)

The smart contract stores message metadata on-chain:

```solidity
struct MessageRecord {
    string blobId;           // Walrus blob ID
    string conversationId;    // Conversation identifier
    address sender;          // Message sender address
    string messageType;      // 'text', 'payment', 'payment_request'
    uint256 timestamp;       // Block timestamp
    string suiObjectId;      // Sui object ID (optional)
    string txDigest;         // Sui transaction digest (optional)
}
```

### Key Functions:

- `storeMessage()` - Store message metadata on-chain
- `getUserMessages()` - Get all messages for a user
- `getConversationMessages()` - Get all messages for a conversation
- `getUserMessagesByType()` - Search messages by type

## Benefits of This Architecture

### 1. **Decentralized Storage**
- Messages are stored on Walrus (decentralized, encrypted)
- No central server required for message storage
- Censorship-resistant messaging

### 2. **On-chain Metadata**
- Smart contract provides searchable message history
- Immutable record of all conversations
- Easy to query and index

### 3. **Privacy**
- Message content is encrypted and stored off-chain
- Only metadata (blob IDs, timestamps) is on-chain
- Users control their own encryption keys

### 4. **Scalability**
- Walrus handles large message storage efficiently
- Smart contract only stores lightweight metadata
- Cost-effective for high-volume messaging

### 5. **Interoperability**
- Works with any blockchain that supports smart contracts
- Can integrate with multiple storage solutions
- Standard interfaces for easy integration

## Message Types

The system supports three types of messages:

### 1. **Text Messages**
```typescript
{
  id: "msg_123",
  conversationId: "conv_456",
  senderId: "user_789",
  content: "Hello, how are you?",
  timestamp: new Date(),
  messageType: "text"
}
```

### 2. **Payment Messages**
```typescript
{
  id: "msg_123",
  conversationId: "conv_456",
  senderId: "user_789",
  content: "Sent 10 WLD to alice.world",
  timestamp: new Date(),
  messageType: "payment",
  paymentData: {
    amount: 10,
    token: "WLD",
    recipientAddress: "0x...",
    transactionHash: "0x...",
    status: "completed"
  }
}
```

### 3. **Payment Request Messages**
```typescript
{
  id: "msg_123",
  conversationId: "conv_456",
  senderId: "user_789",
  content: "Requested 5 USDC: Lunch money",
  timestamp: new Date(),
  messageType: "payment_request",
  moneyRequestData: {
    id: "req_456",
    amount: 5,
    token: "USDC",
    description: "Lunch money",
    requesterId: "user_789",
    requesterAddress: "0x...",
    status: "pending",
    createdAt: new Date()
  }
}
```

## Configuration

### Walrus Configuration
```typescript
const walrusConfig = {
  aggregatorUrl: 'https://aggregator.walrus-testnet.walrus.space',
  publisherUrl: 'https://publisher.walrus-testnet.walrus.space',
  network: 'testnet',
};
```

### Smart Contract Configuration
```typescript
const contractConfig = {
  contractAddress: '0x1234567890123456789012345678901234567890',
  network: 'testnet', // or 'mainnet'
};
```

## Development Setup

1. **Deploy Smart Contract**
   ```bash
   # Deploy MessagingContract.sol to your preferred network
   npx hardhat deploy --network testnet
   ```

2. **Update Configuration**
   ```typescript
   // Update contract address in decentralizedMessagingService.ts
   contractAddress: 'YOUR_DEPLOYED_CONTRACT_ADDRESS'
   ```

3. **Test the System**
   ```bash
   npm run dev
   ```

## Security Considerations

### 1. **Encryption**
- All message content is encrypted before storage
- Only blob IDs and metadata are stored on-chain
- Users control their own encryption keys

### 2. **Access Control**
- Smart contract validates sender addresses
- Only authorized users can store message records
- Message retrieval requires proper authentication

### 3. **Data Integrity**
- Walrus provides cryptographic guarantees for stored data
- Smart contract ensures metadata integrity
- On-chain verification of message ownership

## Future Enhancements

### 1. **Advanced Search**
- Implement full-text search on Walrus
- Add message tagging and categorization
- Support for message threading

### 2. **Group Chats**
- Extend smart contract for group conversations
- Add participant management
- Support for group permissions

### 3. **Message Encryption**
- Implement end-to-end encryption
- Add message signing and verification
- Support for encrypted attachments

### 4. **Cross-chain Support**
- Deploy smart contracts on multiple chains
- Enable cross-chain message synchronization
- Support for multi-chain payments

## Troubleshooting

### Common Issues

1. **Walrus Connection Failed**
   - Check network configuration
   - Verify aggregator/publisher URLs
   - Ensure proper CORS settings

2. **Smart Contract Transaction Failed**
   - Check gas fees and network congestion
   - Verify contract address and ABI
   - Ensure user has sufficient tokens

3. **Message Retrieval Issues**
   - Verify blob IDs are correct
   - Check Walrus network status
   - Ensure proper error handling

### Debug Mode

Enable debug logging:
```typescript
// In decentralizedMessagingService.ts
console.log('Debug: Storing message in Walrus...');
console.log('Debug: Storing metadata in smart contract...');
console.log('Debug: Message stored successfully');
```

## Conclusion

This decentralized messaging architecture provides a robust, scalable, and privacy-preserving solution for secure communication. By combining Walrus storage with smart contract metadata, we achieve the best of both worlds: decentralized storage with on-chain searchability and verification. 