import {
  createComethPaymasterClient,
  createSafeSmartAccount,
  createSmartAccountClient,
  importSafeActions,
} from "@cometh/connect-sdk-4337";
import { http, encodeFunctionData, type Hex } from "viem";
import { worldchain } from "viem/chains";
import { messagingContractAbi } from "../abis/messagingContractAbi";

export interface ComethConfig {
  apiKey: string;
  bundlerUrl: string;
  paymasterUrl: string;
  entryPointAddress: string;
  safeAddress: string;
}

export interface PaymentRequest {
  to: string;
  amount: string;
  token: 'WLD' | 'USDC';
  description?: string;
}

export interface TransactionResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
}

export class ComethService {
  private config: ComethConfig;
  private smartAccountClient: any;
  private isInitialized = false;

  constructor(config: ComethConfig) {
    this.config = config;
  }

  /**
   * Initialize the Cometh service and import Safe if needed
   */
  async initialize(): Promise<void> {
    try {
      console.log('🚀 Initializing Cometh service...');
      
      // Create Safe smart account
      const safeSmartAccount = await createSafeSmartAccount({
        apiKey: this.config.apiKey,
        chain: worldchain,
        smartAccountAddress: this.config.safeAddress as `0x${string}`,
        entryPoint: this.config.entryPointAddress as `0x${string}`,
      });

      // Create paymaster client
      const paymasterClient = await createComethPaymasterClient({
        transport: http(this.config.paymasterUrl),
        chain: worldchain,
      });

      // Create smart account client
      this.smartAccountClient = createSmartAccountClient({
        account: safeSmartAccount,
        chain: worldchain,
        bundlerTransport: http(this.config.bundlerUrl),
        paymaster: paymasterClient,
        userOperation: {
          estimateFeesPerGas: async () => {
            return await paymasterClient.getUserOperationGasPrice();
          },
        },
      });

      // Extend with import actions
      const extendedClient = this.smartAccountClient.extend(importSafeActions());

      // Check if Safe needs to be imported (for Safe 1.4.0)
      try {
        console.log('🔍 Checking if Safe needs import...');
        const importMessage = await extendedClient.prepareImportSafe1_4Tx();
        
        if (importMessage) {
          console.log('📦 Importing Safe 1.4.0...');
          // Note: For actual import, you would need to sign with the current Safe owner
          // This is a placeholder - in real implementation, you'd need the current owner's signature
          console.log('⚠️ Safe import requires current owner signature - skipping for now');
        }
      } catch (error) {
        console.log('✅ Safe is already imported or import not needed');
      }

      this.isInitialized = true;
      console.log('✅ Cometh service initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Cometh service:', error);
      throw error;
    }
  }

  /**
   * Send a transaction using the Safe wallet
   */
  async sendTransaction(to: string, data: string): Promise<TransactionResult> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      console.log(`📤 Sending transaction to: ${to}`);
      console.log(`📄 Data: ${data}`);

      const txHash = await this.smartAccountClient.sendTransaction({
        to: to as `0x${string}`,
        data: data as Hex,
      });

      console.log(`✅ Transaction sent successfully: ${txHash}`);
      return {
        success: true,
        transactionHash: txHash,
      };
    } catch (error) {
      console.error('❌ Failed to send transaction:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Store message metadata on smart contract using Safe wallet
   */
  async storeMessageMetadata(
    blobId: string,
    conversationId: string,
    messageType: 'text' | 'payment' | 'payment_request',
    senderAddress: string
  ): Promise<TransactionResult> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      console.log(`📝 Storing message metadata on contract...`);
      console.log(`   Blob ID: ${blobId}`);
      console.log(`   Conversation ID: ${conversationId}`);
      console.log(`   Message Type: ${messageType}`);
      console.log(`   Sender: ${senderAddress}`);

      // Contract address for message storage
      const contractAddress = '0x34bF1A2460190e60e33309BF8c54D9A7c9eCB4B8';

      // Encode the function call
      const calldata = encodeFunctionData({
        abi: messagingContractAbi,
        functionName: 'storeMessage',
        args: [
          blobId,
          conversationId,
          messageType,
          senderAddress,
        ],
      });

      console.log(`📄 Sending transaction to contract: ${contractAddress}`);
      console.log(`📄 Calldata: ${calldata}`);

      // Send transaction to the contract address, not the Safe address
      return await this.sendTransaction(contractAddress, calldata);
    } catch (error) {
      console.error('❌ Failed to store message metadata:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Send payment using Safe wallet
   */
  async sendPayment(
    recipientAddress: string,
    amount: string,
    token: 'WLD' | 'USDC'
  ): Promise<TransactionResult> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      console.log(`💰 Sending payment...`);
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

      return await this.sendTransaction(recipientAddress, calldata);
    } catch (error) {
      console.error('❌ Failed to send payment:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get the Safe wallet address
   */
  getSafeAddress(): string {
    return this.config.safeAddress;
  }

  /**
   * Check if the service is initialized
   */
  isServiceInitialized(): boolean {
    return this.isInitialized;
  }

  /**
   * Get service configuration
   */
  getConfig(): ComethConfig {
    return this.config;
  }
}

// Singleton instance
let comethServiceInstance: ComethService | null = null;

export const getComethService = (config?: ComethConfig): ComethService => {
  try {
    // If no config provided, try to get it from the config module
    if (!config) {
      const { getComethConfig } = require('../config/cometh');
      config = getComethConfig();
    }
    
    // Create new instance if none exists
    if (!comethServiceInstance) {
      console.log('🔧 Creating new Cometh service instance...');
      comethServiceInstance = new ComethService(config);
    }
    
    return comethServiceInstance;
  } catch (error) {
    console.error('❌ Failed to create Cometh service:', error);
    throw new Error(`ComethService initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}; 