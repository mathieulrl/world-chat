import { encodeFunctionData } from 'viem';
import { messagingContractAbi } from '../abis/messagingContractAbi';

export interface TransactionResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
}

export interface ComethTransactionService {
  storeMessageMetadata(
    blobId: string,
    conversationId: string,
    messageType: 'text' | 'payment' | 'payment_request',
    senderAddress: string
  ): Promise<TransactionResult>;
  
  sendPayment(
    recipientAddress: string,
    amount: string,
    token: 'WLD' | 'USDC'
  ): Promise<TransactionResult>;
}

/**
 * Hook-based transaction service that uses Cometh Connect
 * This service needs to be used within a React component that has access to Cometh hooks
 */
export class ComethTransactionService implements ComethTransactionService {
  private sendTransactionAsync: any;
  private smartAccountClient: any;

  constructor(sendTransactionAsync: any, smartAccountClient: any) {
    this.sendTransactionAsync = sendTransactionAsync;
    this.smartAccountClient = smartAccountClient;
  }

  /**
   * Store message metadata on smart contract using Cometh Connect
   */
  async storeMessageMetadata(
    blobId: string,
    conversationId: string,
    messageType: 'text' | 'payment' | 'payment_request',
    senderAddress: string
  ): Promise<TransactionResult> {
    try {
      if (!this.sendTransactionAsync) {
        throw new Error('Cometh Connect not available - sendTransactionAsync is not provided');
      }

      // Validate that sendTransactionAsync is a function
      if (typeof this.sendTransactionAsync !== 'function') {
        throw new Error(`sendTransactionAsync is not a function: ${typeof this.sendTransactionAsync}`);
      }

      console.log(`📝 Storing message metadata on contract via Cometh Connect...`);
      console.log(`   Blob ID: ${blobId}`);
      console.log(`   Conversation ID: ${conversationId}`);
      console.log(`   Message Type: ${messageType}`);
      console.log(`   Sender: ${senderAddress}`);

      // Contract address for message storage
      const contractAddress = '0x34bF1A2460190e60e33309BF8c54D9A7c9eCB4B8';

      // The storeMessage function expects 5 parameters:
      // - blobId (string)
      // - conversationId (string) 
      // - messageType (string)
      // - suiObjectId (string) - for Sui integration (we'll use empty string)
      // - txDigest (string) - for Sui integration (we'll use empty string)
      
      // Encode the function call with correct parameters
      const calldata = encodeFunctionData({
        abi: messagingContractAbi,
        functionName: 'storeMessage',
        args: [
          blobId,
          conversationId,
          messageType,
          '', // suiObjectId - empty string for now
          '', // txDigest - empty string for now
        ],
      });

      console.log(`📄 Sending transaction to contract: ${contractAddress}`);
      console.log(`📄 Calldata: ${calldata}`);

      // Prepare transaction object in the correct format
      const transactionObject = {
        calls: [
          {
            to: contractAddress as `0x${string}`,
            data: calldata as `0x${string}`,
            value: BigInt(0), // Use BigInt like example-cometh
          },
        ],
      };

      console.log(`📤 Transaction object:`, {
        ...transactionObject,
        calls: transactionObject.calls.map(call => ({
          ...call,
          value: call.value.toString(), // Convert BigInt to string for logging
        })),
      });

      // Send transaction using Cometh Connect
      const result = await this.sendTransactionAsync(transactionObject);

      console.log(`✅ Transaction sent successfully via Cometh Connect:`, result);
      return {
        success: true,
        transactionHash: result.hash,
      };
    } catch (error) {
      console.error('❌ Failed to store message metadata via Cometh Connect:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Send payment using Cometh Connect
   */
  async sendPayment(
    recipientAddress: string,
    amount: string,
    token: 'WLD' | 'USDC'
  ): Promise<TransactionResult> {
    try {
      if (!this.sendTransactionAsync) {
        throw new Error('Cometh Connect not available - sendTransactionAsync is not provided');
      }

      console.log(`💰 Sending payment via Cometh Connect...`);
      console.log(`   Recipient: ${recipientAddress}`);
      console.log(`   Amount: ${amount} ${token}`);

      // For now, we'll send a simple ETH transfer
      // In a real implementation, you'd handle token transfers
      const calldata = encodeFunctionData({
        abi: [{
          name: 'transfer',
          type: 'function',
          inputs: [{ name: 'to', type: 'address' }],
          outputs: [],
          stateMutability: 'payable',
        }],
        functionName: 'transfer',
        args: [recipientAddress as `0x${string}`],
      });

      const result = await this.sendTransactionAsync({
        calls: [
          {
            to: recipientAddress as `0x${string}`,
            data: calldata as `0x${string}`,
            value: BigInt(0), // Use BigInt like example-cometh
          },
        ],
      });

      console.log(`✅ Payment sent successfully via Cometh Connect:`, result);
      return {
        success: true,
        transactionHash: result.hash,
      };
    } catch (error) {
      console.error('❌ Failed to send payment via Cometh Connect:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

/**
 * Create a transaction service instance with Cometh Connect hooks
 * This should be called from within a React component that has access to Cometh hooks
 */
export const createComethTransactionService = (
  sendTransactionAsync: any,
  smartAccountClient: any
): ComethTransactionService => {
  return new ComethTransactionService(sendTransactionAsync, smartAccountClient);
}; 