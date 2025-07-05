import { Message } from '../types/messaging';
import { WalrusStorageService, WalrusStorageResult } from './walrusStorageService';
import { SmartContractService, MessageRecord } from './smartContractService';
import { getComethConnectService } from './comethConnectService';
import { getComethConfig } from '../config/cometh';
import { ComethTransactionService } from './comethTransactionService';

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

export class DecentralizedMessagingServiceCometh {
  private walrusService: WalrusStorageService;
  private smartContractService: SmartContractService; // For reading only
  private comethConnectService: any; // For transactions only

  constructor(config: DecentralizedMessagingConfig) {
    this.walrusService = new WalrusStorageService(config.walrus);
    this.smartContractService = new SmartContractService(config.smartContract);
    
    // Initialize Cometh Connect service for transactions
    try {
      console.log('🔧 Initializing Cometh Connect service...');
      const comethConfig = getComethConfig();
      console.log('📋 Cometh config loaded:', {
        apiKey: comethConfig.apiKey ? '✅ Set' : '❌ Missing',
        bundlerUrl: comethConfig.bundlerUrl,
        paymasterUrl: comethConfig.paymasterUrl,
      });
      
      this.comethConnectService = getComethConnectService();
      console.log('✅ Cometh Connect service created successfully');
    } catch (error) {
      console.warn('⚠️ Cometh Connect service not available, falling back to read-only mode');
      console.error('❌ Cometh Connect initialization error:', error);
      this.comethConnectService = null;
    }
  }

  /**
   * Send a message using decentralized storage with Cometh Connect
   * 1. Store message content in Walrus
   * 2. Store metadata in smart contract via Cometh Connect
   */
  async sendMessage(
    message: Message, 
    senderAddress: string,
    transactionService?: ComethTransactionService
  ): Promise<{
    walrusResult: WalrusStorageResult;
    contractTxHash: string;
  }> {
    try {
      console.log(`📤 Sending decentralized message from ${senderAddress} via Cometh Connect`);

      // Step 1: Store message content in Walrus
      const walrusResult = await this.walrusService.storeMessage(message, senderAddress);
      console.log(`✅ Message stored in Walrus with blob ID: ${walrusResult.blobId}`);

      // Step 2: Store metadata in smart contract via Cometh Connect
      let contractTxHash = 'pending';
      
      if (transactionService) {
        console.log('🔧 Cometh transaction service is available, attempting transaction...');
        try {
          console.log('📝 Calling storeMessageMetadata via Cometh transaction service...');
          
          const result = await transactionService.storeMessageMetadata(
            walrusResult.blobId,
            message.conversationId,
            message.messageType,
            senderAddress
          );
          
          console.log('📊 Cometh transaction result:', result);
          
          if (result.success) {
            contractTxHash = result.transactionHash || 'pending';
            console.log(`✅ Message metadata stored via Cometh Connect: ${contractTxHash}`);
          } else {
            console.warn(`⚠️ Cometh transaction failed: ${result.error}`);
            contractTxHash = 'failed';
          }
        } catch (error) {
          console.error('❌ Cometh Connect transaction error:', error);
          contractTxHash = 'error';
        }
      } else if (this.comethConnectService) {
        console.log('🔧 Cometh Connect service is available, but no transaction service provided');
        console.log('✅ Cometh Connect service is ready for transactions');
        contractTxHash = 'cometh_ready_no_service';
      } else {
        console.warn('⚠️ Cometh Connect service not available, skipping contract storage');
        console.log('🔍 Cometh Connect service status:', this.comethConnectService);
        contractTxHash = 'cometh_unavailable';
      }

      return {
        walrusResult,
        contractTxHash,
      };
    } catch (error) {
      console.error('❌ Error sending decentralized message:', error);
      
      let errorMessage = 'Unknown error occurred while sending message';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error && typeof error === 'object') {
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
      console.log(`📥 Retrieving message content from Walrus: ${blobId}`);
      return await this.walrusService.retrieveMessage(blobId);
    } catch (error) {
      console.error('❌ Error retrieving message from Walrus:', error);
      throw error;
    }
  }

  /**
   * Get message history from smart contract and retrieve content from Walrus
   * Uses SmartContractService for reading (no Cometh needed for reads)
   */
  async getMessageHistory(userAddress: string): Promise<Message[]> {
    try {
      console.log(`📨 Getting message history for user: ${userAddress}`);

      // Step 1: Get message records from smart contract (using old service for reading)
      const messageRecords = await this.smartContractService.getMessageHistory(userAddress);
      console.log(`Found ${messageRecords.length} message records in smart contract`);

      if (messageRecords.length === 0) {
        console.log('No message records found in smart contract');
        return [];
      }

      // Step 2: Retrieve message content from Walrus for each record
      const messages: Message[] = [];
      const failedRetrievals: string[] = [];
      
      for (const record of messageRecords) {
        try {
          const message = await this.walrusService.retrieveMessage(record.blobId);
          messages.push(message);
          console.log(`✅ Successfully retrieved message: ${record.blobId}`);
        } catch (error) {
          console.error(`Failed to retrieve message with blob ID ${record.blobId}:`, error);
          failedRetrievals.push(record.blobId);
          
          // Create a fallback message from the smart contract record
          const fallbackMessage: Message = {
            id: record.blobId, // Use blob ID as message ID
            conversationId: record.conversationId,
            senderId: record.senderId,
            content: `[Message content unavailable - Blob ID: ${record.blobId}]`,
            timestamp: new Date(record.timestamp),
            messageType: record.messageType,
          };
          messages.push(fallbackMessage);
          console.log(`📝 Created fallback message for blob ID: ${record.blobId}`);
        }
      }

      console.log(`Successfully processed ${messages.length} messages (${failedRetrievals.length} fallbacks)`);
      
      if (failedRetrievals.length > 0) {
        console.log(`⚠️ Failed Walrus retrievals: ${failedRetrievals.join(', ')}`);
      }
      
      return messages;
    } catch (error) {
      console.error('❌ Error getting message history:', error);
      return [];
    }
  }

  /**
   * Get conversation messages from smart contract and retrieve content from Walrus
   */
  async getConversationMessages(conversationId: string): Promise<Message[]> {
    try {
      console.log(`📨 Getting messages for conversation: ${conversationId}`);

      // Step 1: Get message records from smart contract
      const messageRecords = await this.smartContractService.getConversationMessages(conversationId);
      console.log(`Found ${messageRecords.length} message records for conversation`);

      if (messageRecords.length === 0) {
        console.log('No message records found for conversation');
        return [];
      }

      // Step 2: Retrieve message content from Walrus for each record
      const messages: Message[] = [];
      const failedRetrievals: string[] = [];
      
      for (const record of messageRecords) {
        try {
          const message = await this.walrusService.retrieveMessage(record.blobId);
          messages.push(message);
          console.log(`✅ Successfully retrieved message: ${record.blobId}`);
        } catch (error) {
          console.error(`Failed to retrieve message with blob ID ${record.blobId}:`, error);
          failedRetrievals.push(record.blobId);
          
          // Create a fallback message from the smart contract record
          const fallbackMessage: Message = {
            id: record.blobId,
            conversationId: record.conversationId,
            senderId: record.senderId,
            content: `[Message content unavailable - Blob ID: ${record.blobId}]`,
            timestamp: new Date(record.timestamp),
            messageType: record.messageType,
          };
          messages.push(fallbackMessage);
          console.log(`📝 Created fallback message for blob ID: ${record.blobId}`);
        }
      }

      console.log(`Successfully processed ${messages.length} messages (${failedRetrievals.length} fallbacks)`);
      
      if (failedRetrievals.length > 0) {
        console.log(`⚠️ Failed Walrus retrievals: ${failedRetrievals.join(', ')}`);
      }
      
      return messages;
    } catch (error) {
      console.error('❌ Error getting conversation messages:', error);
      return [];
    }
  }

  /**
   * Get user conversations from smart contract
   */
  async getUserConversations(userAddress: string): Promise<any[]> {
    try {
      console.log(`📋 Getting conversations for user: ${userAddress}`);
      return await this.smartContractService.getUserConversations(userAddress);
    } catch (error) {
      console.error('❌ Error getting user conversations:', error);
      return [];
    }
  }

  /**
   * Check if Cometh Connect service is available
   */
  isComethAvailable(): boolean {
    return this.comethConnectService !== null && this.comethConnectService.isConfigured();
  }

  /**
   * Get Cometh Connect service instance
   */
  getComethService() {
    return this.comethConnectService;
  }
} 