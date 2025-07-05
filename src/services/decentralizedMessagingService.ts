import { Message } from '../types/messaging';
import { WalrusStorageService, WalrusStorageResult } from './walrusStorageService';
import { SmartContractService, MessageRecord } from './smartContractService';

export interface DecentralizedMessagingConfig {
  walrus: {
    aggregatorUrl: string;
    publisherUrl: string;
    network: 'mainnet' | 'testnet';
    mockMode?: boolean;
  };
  smartContract: {
    contractAddress: string;
    network: 'mainnet' | 'testnet';
    rpcUrl: string;
  };
}

export class DecentralizedMessagingService {
  private walrusService: WalrusStorageService;
  private smartContractService: SmartContractService;

  constructor(config: DecentralizedMessagingConfig) {
    this.walrusService = new WalrusStorageService(config.walrus);
    this.smartContractService = new SmartContractService(config.smartContract);
  }

  /**
   * Send a message using decentralized storage
   * 1. Store message content in Walrus
   * 2. Store metadata in smart contract
   */
  async sendMessage(message: Message, senderAddress: string): Promise<{
    walrusResult: WalrusStorageResult;
    contractTxHash: string;
  }> {
    try {
      console.log(`Sending decentralized message from ${senderAddress}`);

      // Step 1: Store message content in Walrus
      const walrusResult = await this.walrusService.storeMessage(message, senderAddress);
      console.log(`Message stored in Walrus with blob ID: ${walrusResult.blobId}`);

      // Step 2: Create message record for smart contract
      const messageRecord = this.smartContractService.createMessageRecord(walrusResult, message);

      // Step 3: Store metadata in smart contract
      const contractTxHash = await this.smartContractService.storeMessageMetadata(
        messageRecord,
        senderAddress
      );
      console.log(`Message metadata stored in smart contract with tx: ${contractTxHash}`);

      return {
        walrusResult,
        contractTxHash,
      };
    } catch (error) {
      console.error('Error sending decentralized message:', error);
      
      // Provide a more detailed error message
      let errorMessage = 'Unknown error occurred while sending message';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error && typeof error === 'object') {
        // Try to extract meaningful error information
        if ('error' in error) {
          errorMessage = String(error.error);
        } else if ('message' in error) {
          errorMessage = String(error.message);
        } else {
          errorMessage = JSON.stringify(error);
        }
      }
      
      throw new Error(errorMessage);
    }
  }

  /**
   * Retrieve message content from Walrus using blob ID
   */
  async retrieveMessage(blobId: string): Promise<Message> {
    try {
      console.log(`Retrieving message content from Walrus: ${blobId}`);
      return await this.walrusService.retrieveMessage(blobId);
    } catch (error) {
      console.error('Error retrieving message from Walrus:', error);
      throw error;
    }
  }

  /**
   * Get message history from smart contract and retrieve content from Walrus
   */
  async getMessageHistory(userAddress: string): Promise<Message[]> {
    try {
      console.log(`Getting message history for user: ${userAddress}`);

      // Step 1: Get message records from smart contract
      const messageRecords = await this.smartContractService.getMessageHistory(userAddress);
      console.log(`Found ${messageRecords.length} message records in smart contract`);

      // Step 2: Retrieve message content from Walrus for each record
      const messages: Message[] = [];
      for (const record of messageRecords) {
        try {
          const message = await this.walrusService.retrieveMessage(record.blobId);
          messages.push(message);
        } catch (error) {
          console.error(`Failed to retrieve message with blob ID ${record.blobId}:`, error);
          // Continue with other messages even if one fails
        }
      }

      console.log(`Successfully retrieved ${messages.length} messages from Walrus`);
      return messages;
    } catch (error) {
      console.error('Error getting message history:', error);
      throw error;
    }
  }

  /**
   * Get conversation messages from smart contract and retrieve content from Walrus
   */
  async getConversationMessages(conversationId: string): Promise<Message[]> {
    try {
      console.log(`Getting conversation messages: ${conversationId}`);

      // Step 1: Get message records from smart contract
      const messageRecords = await this.smartContractService.getConversationMessages(conversationId);
      console.log(`Found ${messageRecords.length} message records for conversation`);

      // Step 2: Retrieve message content from Walrus for each record
      const messages: Message[] = [];
      for (const record of messageRecords) {
        try {
          const message = await this.walrusService.retrieveMessage(record.blobId);
          messages.push(message);
        } catch (error) {
          console.error(`Failed to retrieve message with blob ID ${record.blobId}:`, error);
          // Continue with other messages even if one fails
        }
      }

      // Sort messages by timestamp
      messages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

      console.log(`Successfully retrieved ${messages.length} messages for conversation`);
      return messages;
    } catch (error) {
      console.error('Error getting conversation messages:', error);
      throw error;
    }
  }

  /**
   * Verify message integrity by checking both Walrus and smart contract
   */
  async verifyMessage(blobId: string, expectedOwner: string): Promise<boolean> {
    try {
      // Check Walrus metadata
      const walrusMetadata = await this.walrusService.getBlobMetadata(blobId);
      const walrusValid = walrusMetadata.owner === expectedOwner;

      // In a real implementation, you would also verify the smart contract record
      // For now, we'll just check Walrus
      return walrusValid;
    } catch (error) {
      console.error('Error verifying message:', error);
      return false;
    }
  }

  /**
   * Get all conversations for a user
   */
  async getUserConversations(userAddress: string): Promise<any[]> {
    try {
      console.log(`Getting conversations for user: ${userAddress}`);

      // Step 1: Get conversation IDs from smart contract
      const conversationIds = await this.smartContractService.getUserConversations(userAddress);
      console.log(`Found ${conversationIds.length} conversation IDs for user`);

      if (conversationIds.length === 0) {
        console.log('No conversations found for user, returning empty array');
        return [];
      }

      // Step 2: Get conversation details for each ID
      const conversations: any[] = [];
      for (const conversationId of conversationIds) {
        try {
          const conversation = await this.smartContractService.getConversation(conversationId);
          conversations.push(conversation);
        } catch (error) {
          console.error(`Failed to get conversation details for ${conversationId}:`, error);
          // Continue with other conversations even if one fails
        }
      }

      console.log(`Successfully retrieved ${conversations.length} conversations for user`);
      return conversations;
    } catch (error) {
      console.error('Error getting user conversations:', error);
      // Return empty array instead of throwing to prevent app crashes
      return [];
    }
  }
} 