import { WalrusStorageResult } from './walrusStorageService';
import { messagingContractAbi } from '../abis/messagingContractAbi';
import { createPublicClient, http, createWalletClient } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { WorldcoinService } from './worldcoinService';

// Define Worldcoin mainnet chain (chainId 480)
const worldcoinMainnet = {
  id: 480,
  name: 'Worldcoin',
  network: 'worldcoin',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: { http: ['https://worldchain.drpc.org'] },
    public: { http: ['https://worldchain.drpc.org'] },
  },
} as const;

export interface MessageRecord {
  blobId: string;
  conversationId: string;
  senderId: string;
  messageType: 'text' | 'payment' | 'payment_request';
  timestamp: string;
  suiObjectId?: string;
  txDigest?: string;
}

export interface SmartContractConfig {
  contractAddress: string;
  network: 'mainnet' | 'testnet';
  rpcUrl?: string;
}

export class SmartContractService {
  private config: SmartContractConfig;
  private publicClient: any;
  private worldcoinService: WorldcoinService;
  private privateKey: string | null = null;
  private walletClient: any = null;

  constructor(config: SmartContractConfig) {
    this.config = config;
    
    // Initialize viem client for reading from contract
    const rpcUrl = config.rpcUrl || 'https://worldchain.drpc.org';
    console.log(`Using RPC URL: ${rpcUrl}`);
    
    this.publicClient = createPublicClient({
      chain: worldcoinMainnet,
      transport: http(rpcUrl),
    });

    // Initialize Worldcoin service for writing transactions
    this.worldcoinService = WorldcoinService.getInstance();

    // Initialize private key wallet client if available
    this.initializePrivateKeyWallet();

    console.log(`SmartContractService initialized with contract: ${config.contractAddress}`);
    console.log(`Chain ID: 480 (Worldcoin)`);
    console.log(`RPC URL: ${rpcUrl}`);
  }

  /**
   * Initialize private key wallet client
   */
  private initializePrivateKeyWallet() {
    try {
      const privateKey = import.meta.env.VITE_PRIVATE_KEY;
      if (privateKey) {
        this.privateKey = privateKey;
        const account = privateKeyToAccount(privateKey as `0x${string}`);
        
        this.walletClient = createWalletClient({
          account,
          chain: worldcoinMainnet,
          transport: http(this.config.rpcUrl || 'https://worldchain.drpc.org'),
        });
        
        console.log(`✅ Private key wallet client initialized`);
        console.log(`📋 Wallet address: ${account.address}`);
      } else {
        console.log(`⚠️ VITE_PRIVATE_KEY not set - using Worldcoin MiniKit for transactions`);
      }
    } catch (error) {
      console.error('❌ Failed to initialize private key wallet client:', error);
      console.log(`⚠️ Falling back to Worldcoin MiniKit for transactions`);
    }
  }

  /**
   * Store message metadata on smart contract using private key wallet
   */
  async storeMessageMetadataWithPrivateKey(
    messageRecord: MessageRecord,
    senderAddress: string
  ): Promise<string> {
    if (!this.walletClient) {
      throw new Error('Private key wallet client not available. Please set VITE_PRIVATE_KEY.');
    }

    try {
      console.log(`📝 Storing message metadata with private key wallet for sender: ${senderAddress}`);
      
      const result = await this.walletClient.writeContract({
        address: this.config.contractAddress as `0x${string}`,
        abi: messagingContractAbi,
        functionName: 'storeMessage',
        args: [
          messageRecord.blobId,
          messageRecord.conversationId,
          messageRecord.messageType,
          messageRecord.suiObjectId || '',
          messageRecord.txDigest || ''
        ],
      });

      console.log(`✅ Message metadata stored with private key wallet!`);
      console.log(`📋 Transaction hash: ${result}`);
      
      return result;
    } catch (error) {
      console.error('❌ Failed to store message metadata with private key wallet:', error);
      throw error;
    }
  }

  /**
   * Store message metadata on smart contract
   * This interacts with your deployed smart contract to store the Walrus blob reference
   * Uses Worldcoin MiniKit for transaction signing and execution
   */
  async storeMessageMetadata(
    messageRecord: MessageRecord,
    senderAddress: string
  ): Promise<string> {
    try {
      console.log(`Storing message metadata on smart contract for sender: ${senderAddress}`);
      
      // Use Worldcoin MiniKit to store message metadata on the deployed contract
      const result = await this.worldcoinService.storeMessageMetadata(
        this.config.contractAddress,
        messagingContractAbi,
        {
          blobId: messageRecord.blobId,
          conversationId: messageRecord.conversationId,
          messageType: messageRecord.messageType,
          suiObjectId: messageRecord.suiObjectId,
          txDigest: messageRecord.txDigest,
        },
        senderAddress
      );

      // Debug the result
      console.log(`🔍 Worldcoin service result:`, result);
      console.log(`   Success: ${result.success}`);
      console.log(`   Transaction Hash: ${result.transactionHash}`);
      console.log(`   Error: ${result.error}`);

      if (result.success) {
        console.log(`✅ Message metadata stored on smart contract!`);
        console.log(`  Transaction Hash: ${result.transactionHash}`);
        console.log(`  Blob ID: ${messageRecord.blobId}`);
        console.log(`  Conversation ID: ${messageRecord.conversationId}`);
        console.log(`  Message Type: ${messageRecord.messageType}`);
        
        return result.transactionHash || 'pending';
      } else {
        // Handle the case where Worldcoin service returns success: false
        console.log(`⚠️ Worldcoin service returned success: false`);
        console.log(`  Error: ${result.error}`);
        console.log(`  Transaction Hash: ${result.transactionHash}`);
        
        // Throw a proper error
        const errorMessage = result.error || 'Unknown error from Worldcoin service';
        throw new Error(`Failed to store message metadata: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Error storing message metadata on smart contract:', error);
      
      // Provide a more detailed error message
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Detailed error: ${errorMessage}`);
      
      throw error;
    }
  }

  /**
   * Store message metadata with fallback to private key wallet
   */
  async storeMessageMetadataWithFallback(
    messageRecord: MessageRecord,
    senderAddress: string
  ): Promise<string> {
    try {
      // First try with Worldcoin MiniKit
      return await this.storeMessageMetadata(messageRecord, senderAddress);
    } catch (error) {
      console.log(`⚠️ Worldcoin MiniKit failed, trying private key wallet...`);
      
      // Fallback to private key wallet
      return await this.storeMessageMetadataWithPrivateKey(messageRecord, senderAddress);
    }
  }

  /**
   * Get wallet address from private key
   */
  getPrivateKeyWalletAddress(): string | null {
    if (this.privateKey) {
      const account = privateKeyToAccount(this.privateKey as `0x${string}`);
      return account.address;
    }
    return null;
  }

  /**
   * Check if private key wallet is available
   */
  isPrivateKeyWalletAvailable(): boolean {
    return this.walletClient !== null;
  }

  /**
   * Retrieve message history from smart contract
   * This queries your smart contract to get all message records for a user
   */
  async getMessageHistory(userAddress: string): Promise<MessageRecord[]> {
    try {
      console.log(`Retrieving message history from smart contract for user: ${userAddress}`);
      
      // Read from contract using the correct viem v2 API
      const messageRecords = await this.publicClient.readContract({
        address: this.config.contractAddress as `0x${string}`,
        abi: messagingContractAbi,
        functionName: 'getUserMessages',
        args: [userAddress],
      });
      
      // Convert the contract response to our MessageRecord format
      const convertedRecords: MessageRecord[] = messageRecords.map((record: any) => ({
        blobId: record.blobId,
        conversationId: record.conversationId,
        senderId: record.sender,
        messageType: record.messageType as 'text' | 'payment' | 'payment_request',
        timestamp: new Date(Number(record.timestamp) * 1000).toISOString(),
        suiObjectId: record.suiObjectId,
        txDigest: record.txDigest,
      }));
      
      console.log(`Retrieved ${convertedRecords.length} messages from smart contract`);
      
      if (convertedRecords.length === 0) {
        console.log('ℹ️ No messages found - this is normal for a new user or empty contract');
      }
      
      return convertedRecords;
    } catch (error) {
      console.error('Error retrieving message history from smart contract:', error);
      
      // Check if it's a "no data" error (empty contract)
      if (error.message && error.message.includes('returned no data')) {
        console.log('ℹ️ Contract returned no data - this is normal for an empty contract');
        return [];
      }
      
      // Return empty array if contract call fails
      return [];
    }
  }

  /**
   * Get conversation messages from smart contract
   */
  async getConversationMessages(conversationId: string): Promise<MessageRecord[]> {
    try {
      console.log(`Retrieving conversation messages from smart contract: ${conversationId}`);
      
      // Read from contract using the correct viem v2 API
      const messageRecords = await this.publicClient.readContract({
        address: this.config.contractAddress as `0x${string}`,
        abi: messagingContractAbi,
        functionName: 'getConversationMessages',
        args: [conversationId],
      });
      
      // Convert the contract response to our MessageRecord format
      const convertedRecords: MessageRecord[] = messageRecords.map((record: any) => ({
        blobId: record.blobId,
        conversationId: record.conversationId,
        senderId: record.sender,
        messageType: record.messageType as 'text' | 'payment' | 'payment_request',
        timestamp: new Date(Number(record.timestamp) * 1000).toISOString(),
        suiObjectId: record.suiObjectId,
        txDigest: record.txDigest,
      }));
      
      console.log(`Retrieved ${convertedRecords.length} messages for conversation ${conversationId}`);
      return convertedRecords;
    } catch (error) {
      console.error('Error retrieving conversation messages from smart contract:', error);
      // Return empty array if contract call fails
      return [];
    }
  }

  /**
   * Get conversation details from smart contract
   */
  async getConversation(conversationId: string): Promise<any> {
    try {
      console.log(`Retrieving conversation details: ${conversationId}`);
      
      const conversation = await this.publicClient.readContract({
        address: this.config.contractAddress as `0x${string}`,
        abi: messagingContractAbi,
        functionName: 'getConversation',
        args: [conversationId],
      });
      
      return {
        id: conversation.id,
        participants: conversation.participants,
        createdAt: new Date(Number(conversation.createdAt) * 1000),
        updatedAt: new Date(Number(conversation.updatedAt) * 1000),
      };
    } catch (error) {
      console.error('Error retrieving conversation details:', error);
      // Return mock data if contract call fails
      return {
        id: conversationId,
        participants: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }
  }

  /**
   * Get all conversation IDs for a user
   * Since getUserConversations doesn't exist in the contract, we extract conversation IDs from user messages
   */
  async getUserConversations(userAddress: string): Promise<string[]> {
    try {
      console.log(`Retrieving conversations for user: ${userAddress}`);
      
      // Get all messages for the user
      const userMessages = await this.publicClient.readContract({
        address: this.config.contractAddress as `0x${string}`,
        abi: messagingContractAbi,
        functionName: 'getUserMessages',
        args: [userAddress],
      });
      
      // Extract unique conversation IDs from user messages
      const conversationIds = new Set<string>();
      userMessages.forEach((message: any) => {
        if (message.conversationId) {
          conversationIds.add(message.conversationId);
        }
      });
      
      const uniqueConversationIds = Array.from(conversationIds);
      console.log(`Retrieved ${uniqueConversationIds.length} unique conversations for user`);
      
      if (uniqueConversationIds.length === 0) {
        console.log('ℹ️ No conversations found - this is normal for a new user or empty contract');
      }
      
      return uniqueConversationIds;
    } catch (error) {
      console.error('Error retrieving user conversations:', error);
      
      // Check if it's a "no data" error (empty contract)
      if (error.message && error.message.includes('returned no data')) {
        console.log('ℹ️ Contract returned no data - this is normal for an empty contract');
        return [];
      }
      
      // Return empty array if contract call fails
      return [];
    }
  }

  /**
   * Get message count for a user
   */
  async getUserMessageCount(userAddress: string): Promise<number> {
    try {
      const count = await this.publicClient.readContract({
        address: this.config.contractAddress as `0x${string}`,
        abi: messagingContractAbi,
        functionName: 'getUserMessageCount',
        args: [userAddress],
      });
      return Number(count);
    } catch (error) {
      console.error('Error getting user message count:', error);
      return 0;
    }
  }

  /**
   * Get message count for a conversation
   */
  async getConversationMessageCount(conversationId: string): Promise<number> {
    try {
      const count = await this.publicClient.readContract({
        address: this.config.contractAddress as `0x${string}`,
        abi: messagingContractAbi,
        functionName: 'getConversationMessageCount',
        args: [conversationId],
      });
      return Number(count);
    } catch (error) {
      console.error('Error getting conversation message count:', error);
      return 0;
    }
  }

  /**
   * Search messages by type for a user
   */
  async getUserMessagesByType(userAddress: string, messageType: string): Promise<MessageRecord[]> {
    try {
      console.log(`Searching messages by type for user: ${userAddress}, type: ${messageType}`);
      
      const messageRecords = await this.publicClient.readContract({
        address: this.config.contractAddress as `0x${string}`,
        abi: messagingContractAbi,
        functionName: 'getUserMessagesByType',
        args: [userAddress, messageType],
      });
      
      // Convert the contract response to our MessageRecord format
      const convertedRecords: MessageRecord[] = messageRecords.map((record: any) => ({
        blobId: record.blobId,
        conversationId: record.conversationId,
        senderId: record.sender,
        messageType: record.messageType as 'text' | 'payment' | 'payment_request',
        timestamp: new Date(Number(record.timestamp) * 1000).toISOString(),
        suiObjectId: record.suiObjectId,
        txDigest: record.txDigest,
      }));
      
      console.log(`Found ${convertedRecords.length} messages of type ${messageType}`);
      return convertedRecords;
    } catch (error) {
      console.error('Error searching messages by type:', error);
      return [];
    }
  }

  /**
   * Convert Walrus storage result to message record
   */
  createMessageRecord(
    walrusResult: WalrusStorageResult,
    message: any
  ): MessageRecord {
    return {
      blobId: walrusResult.blobId,
      conversationId: message.conversationId,
      senderId: message.senderId,
      messageType: message.messageType,
      timestamp: walrusResult.timestamp,
      suiObjectId: walrusResult.suiObjectId,
      txDigest: walrusResult.txDigest,
    };
  }

  /**
   * Get the real contract address
   */
  getContractAddress(): string {
    return this.config.contractAddress;
  }

  /**
   * Get the contract ABI for integration with Worldcoin MiniKit
   */
  getContractAbi() {
    return messagingContractAbi;
  }

  /**
   * Get contract configuration for integration
   */
  getContractConfig() {
    return {
      address: this.config.contractAddress,
      abi: messagingContractAbi,
      network: this.config.network,
    };
  }

  /**
   * Test contract connectivity
   */
  async testContractConnection(): Promise<boolean> {
    try {
      console.log(`Testing connection to contract: ${this.config.contractAddress}`);
      
      // Try to read a simple function to test connectivity
      const testAddress = '0x0000000000000000000000000000000000000000';
      await this.publicClient.readContract({
        address: this.config.contractAddress as `0x${string}`,
        abi: messagingContractAbi,
        functionName: 'getUserMessageCount',
        args: [testAddress],
      });
      
      console.log('✅ Contract connection successful!');
      return true;
    } catch (error) {
      console.error('❌ Contract connection failed:', error);
      return false;
    }
  }

  /**
   * Test contract writing with Worldcoin MiniKit
   */
  async testContractWriting(userAddress: string): Promise<boolean> {
    try {
      console.log(`Testing contract writing with Worldcoin MiniKit for user: ${userAddress}`);
      
      // Test with a mock message record
      const testMessageRecord: MessageRecord = {
        blobId: 'test_blob_id',
        conversationId: 'test_conversation',
        senderId: userAddress,
        messageType: 'text',
        timestamp: new Date().toISOString(),
      };

      const result = await this.storeMessageMetadata(testMessageRecord, userAddress);
      
      console.log(`✅ Contract writing test successful!`);
      console.log(`  Transaction Hash: ${result}`);
      return true;
    } catch (error) {
      console.error('❌ Contract writing test failed:', error);
      return false;
    }
  }

  /**
   * Test contract writing with private key wallet
   */
  async testContractWritingWithPrivateKey(): Promise<boolean> {
    if (!this.walletClient) {
      console.error('❌ Private key wallet not available');
      return false;
    }

    try {
      console.log(`Testing contract writing with private key wallet`);
      
      // Test with a mock message record
      const testMessageRecord: MessageRecord = {
        blobId: 'test_blob_id_private_key',
        conversationId: 'test_conversation_private_key',
        senderId: this.getPrivateKeyWalletAddress() || '0x0000000000000000000000000000000000000000',
        messageType: 'text',
        timestamp: new Date().toISOString(),
      };

      const result = await this.storeMessageMetadataWithPrivateKey(testMessageRecord, 'test');
      
      console.log(`✅ Contract writing test with private key successful!`);
      console.log(`  Transaction Hash: ${result}`);
      return true;
    } catch (error) {
      console.error('❌ Contract writing test with private key failed:', error);
      return false;
    }
  }

  /**
   * Get the contract configuration for manual integration
   */
  getContractInfo() {
    return {
      address: this.config.contractAddress,
      abi: messagingContractAbi,
      network: this.config.network,
      rpcUrl: this.config.rpcUrl,
    };
  }

  /**
   * Execute transaction directly using viem (alternative to MiniKit)
   * This method can be used when MiniKit doesn't recognize the contract
   */
  async executeDirectTransaction(
    messageRecord: MessageRecord,
    senderAddress: string
  ): Promise<string> {
    try {
      console.log(`Executing direct transaction for sender: ${senderAddress}`);
      console.log(`  Contract: ${this.config.contractAddress}`);
      console.log(`  Function: storeMessage`);
      console.log(`  Args: ${JSON.stringify([
        messageRecord.blobId,
        messageRecord.conversationId,
        messageRecord.messageType,
        messageRecord.suiObjectId || '',
        messageRecord.txDigest || ''
      ])}`);

      // Note: This requires a wallet client with a private key
      // In a real implementation, you would need to:
      // 1. Get the user's private key from their wallet
      // 2. Create a wallet client with the private key
      // 3. Execute the transaction
      
      console.log(`⚠️ Direct transaction requires user's private key`);
      console.log(`   This is not implemented in this demo for security reasons`);
      console.log(`   In a real app, you would:`);
      console.log(`   1. Connect to user's wallet (MetaMask, etc.)`);
      console.log(`   2. Get user's signature for the transaction`);
      console.log(`   3. Execute the transaction with their private key`);
      
      throw new Error('Direct transaction not implemented. Please register the contract with MiniKit or implement wallet connection.');
      
    } catch (error) {
      console.error('Error executing direct transaction:', error);
      throw error;
    }
  }

  /**
   * Get transaction guidance for different scenarios
   */
  getTransactionGuidance(): string[] {
    return [
      '📋 Transaction Options:',
      '=====================',
      '',
      'Option 1: Register Contract with MiniKit (Recommended)',
      '  1. Go to Worldcoin Developer Portal',
      '  2. Navigate to Configuration → Advanced',
      '  3. Add contract address: ' + this.config.contractAddress,
      '  4. Select chain: Worldcoin',
      '  5. Wait for approval from Worldcoin team',
      '',
      'Option 2: Use Private Key Wallet',
      '  1. Set VITE_PRIVATE_KEY in your .env file',
      '  2. Use storeMessageMetadataWithPrivateKey() method',
      '  3. Transactions will be sent from the private key wallet',
      '',
      'Option 3: Use Alternative Wallet',
      '  1. Connect to MetaMask or other wallet',
      '  2. Switch to Worldcoin network',
      '  3. Execute transaction directly',
      '',
      'Current Status:',
      '  - Contract: ' + this.config.contractAddress,
      '  - Chain: Worldcoin',
      '  - RPC: https://worldchain.drpc.org',
      '  - MiniKit: Contract not registered',
      '  - Private Key Wallet: ' + (this.isPrivateKeyWalletAvailable() ? 'Available' : 'Not available')
    ];
  }
}

// Singleton instance
let smartContractServiceInstance: SmartContractService | null = null;

export const getSmartContractService = (): SmartContractService => {
  if (!smartContractServiceInstance) {
    const config: SmartContractConfig = {
      contractAddress: import.meta.env.VITE_CONTRACT_ADDRESS || '0x34bF1A2460190e60e33309BF8c54D9A7c9eCB4B8',
      network: 'mainnet',
      rpcUrl: import.meta.env.VITE_RPC_URL || 'https://worldchain.drpc.org',
    };
    
    smartContractServiceInstance = new SmartContractService(config);
  }
  return smartContractServiceInstance;
}; 