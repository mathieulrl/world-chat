import { WalrusStorageResult } from './walrusStorageService';
import { messagingContractAbi } from '../abis/messagingContractAbi';
import { createPublicClient, http } from 'viem';
import { WorldcoinService } from './worldcoinService';

// Define custom chain for chainId 4801
const customChain = {
  id: 4801,
  name: 'Custom Chain',
  network: 'custom',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: { http: ['https://sepolia.infura.io/v3/e34629cc701f45ffbdb1d83ae332b4cf'] },
    public: { http: ['https://sepolia.infura.io/v3/e34629cc701f45ffbdb1d83ae332b4cf'] },
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

  constructor(config: SmartContractConfig) {
    this.config = config;
    
    // Initialize viem client for reading from contract
    const rpcUrl = config.rpcUrl || 'https://sepolia.infura.io/v3/e34629cc701f45ffbdb1d83ae332b4cf';
    console.log(`Using RPC URL: ${rpcUrl}`);
    
    this.publicClient = createPublicClient({
      chain: customChain,
      transport: http(rpcUrl),
    });

    // Initialize Worldcoin service for writing transactions
    this.worldcoinService = WorldcoinService.getInstance();

    console.log(`SmartContractService initialized with contract: ${config.contractAddress}`);
    console.log(`Chain ID: 4801`);
    console.log(`RPC URL: ${rpcUrl}`);
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

      if (result.success) {
        console.log(`✅ Message metadata stored on smart contract!`);
        console.log(`  Transaction Hash: ${result.transactionHash}`);
        console.log(`  Blob ID: ${messageRecord.blobId}`);
        console.log(`  Conversation ID: ${messageRecord.conversationId}`);
        console.log(`  Message Type: ${messageRecord.messageType}`);
        
        return result.transactionHash || 'pending';
      } else {
        throw new Error(`Failed to store message metadata: ${result.error}`);
      }
    } catch (error) {
      console.error('Error storing message metadata on smart contract:', error);
      throw error;
    }
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
} 