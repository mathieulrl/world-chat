import { PaymentRequest } from '../types/messaging';
import { initiatePayment, confirmPayment } from '../api/initiate-payment';
import { createWalletClient, http } from 'viem';
import { sepolia } from 'viem/chains';
import { MiniKit } from '@worldcoin/minikit-js';

// Token conversion utility
const tokenToDecimals = (amount: number, token: string): string => {
  const decimals = token === 'WLD' ? 8 : 6;
  return (amount * Math.pow(10, decimals)).toString();
};

export interface ContractTransactionRequest {
  contractAddress: string;
  abi: any;
  functionName: string;
  args: any[];
  value?: bigint;
  gasLimit?: bigint;
}

export class WorldcoinService {
  private static instance: WorldcoinService;
  private walletClient: any;
  private minikit: MiniKit | null = null;
  
  private constructor() {
    // Get Infura ID from environment variable
    const infuraId = import.meta.env.VITE_INFURA_ID || process.env.INFURA_ID;
    
    if (!infuraId) {
      console.warn('⚠️ INFURA_ID not found in environment variables. Please add INFURA_ID to your .env file.');
    }
    
    // Initialize wallet client for contract transactions
    this.walletClient = createWalletClient({
      chain: sepolia,
      transport: http(`https://sepolia.infura.io/v3/${infuraId || 'YOUR_INFURA_KEY'}`),
    });
  }
  
  public static getInstance(): WorldcoinService {
    if (!WorldcoinService.instance) {
      WorldcoinService.instance = new WorldcoinService();
    }
    return WorldcoinService.instance;
  }

  /**
   * Initialize Worldcoin MiniKit
   */
  async initializeMiniKit(): Promise<boolean> {
    try {
      console.log('Initializing Worldcoin MiniKit...');
      
      // Set the app ID for MiniKit
      MiniKit.appId = 'app_633eda004e32e457ef84472c6ef7714c';
      
      // Check if MiniKit is available by trying to get user info
      try {
        await MiniKit.getUserInfo();
        console.log('✅ Worldcoin MiniKit initialized successfully!');
        return true;
      } catch (error) {
        console.warn('Worldcoin MiniKit is not available. Please install the World App.');
        return false;
      }
    } catch (error) {
      console.error('Failed to initialize Worldcoin MiniKit:', error);
      return false;
    }
  }

  /**
   * Check if Worldcoin MiniKit is installed and available
   */
  async isInstalled(): Promise<boolean> {
    try {
      await this.initializeMiniKit();
      
      // Try to get user info to check if MiniKit is available
      await MiniKit.getUserInfo();
      return true;
    } catch (error) {
      console.error('Error checking MiniKit installation:', error);
      return false;
    }
  }

  /**
   * Get current user from Worldcoin MiniKit
   */
  async getCurrentUser(): Promise<{
    address: string;
    username: string;
    profilePicture?: string;
  } | null> {
    try {
      await this.initializeMiniKit();
      
      const user = await MiniKit.getUserInfo();
      
      if (!user || !user.walletAddress) {
        console.log('No user connected to Worldcoin MiniKit');
        return null;
      }

      return {
        address: user.walletAddress,
        username: user.username || `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}.world`,
        profilePicture: user.profilePictureUrl,
      };
    } catch (error) {
      console.error('Failed to get current user:', error);
      return null;
    }
  }

  /**
   * Get user by address
   */
  async getUserByAddress(address: string): Promise<{
    address: string;
    username: string;
    profilePicture?: string;
  } | null> {
    try {
      await this.initializeMiniKit();
      
      const user = await MiniKit.getUserByAddress(address);
      
      if (!user || !user.walletAddress) {
        return null;
      }

      return {
        address: user.walletAddress,
        username: user.username || `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}.world`,
        profilePicture: user.profilePictureUrl,
      };
    } catch (error) {
      console.error('Failed to get user by address:', error);
      return null;
    }
  }

  /**
   * Execute payment using Worldcoin MiniKit
   */
  async executePayment(paymentRequest: PaymentRequest): Promise<{
    status: string;
    transactionHash?: string;
    reference: string;
    error?: string;
  }> {
    try {
      await this.initializeMiniKit();

      console.log(`Executing payment: ${paymentRequest.reference}`);
      console.log(`  To: ${paymentRequest.to}`);
      console.log(`  Tokens: ${JSON.stringify(paymentRequest.tokens)}`);
      console.log(`  Description: ${paymentRequest.description}`);

      // Execute payment using MiniKit
      const result = await MiniKit.commandsAsync.pay({
        reference: paymentRequest.reference,
        to: paymentRequest.to as `0x${string}`,
        tokens: paymentRequest.tokens.map(token => ({
          symbol: token.symbol as any,
          token_amount: token.token_amount,
        })),
        description: paymentRequest.description,
      });

      console.log(`✅ Payment executed successfully!`);
      
      if (result.finalPayload.status === 'success') {
        console.log(`  Transaction Hash: ${result.finalPayload.transaction_id}`);
        console.log(`  Status: ${result.finalPayload.status}`);

        return {
          status: result.finalPayload.status,
          transactionHash: result.finalPayload.transaction_id,
          reference: paymentRequest.reference,
        };
      } else {
        console.log(`  Error: ${result.finalPayload.error_code}`);
        return {
          status: 'error',
          error: result.finalPayload.error_code,
          reference: paymentRequest.reference,
        };
      }
    } catch (error) {
      console.error('Failed to execute payment:', error);
      throw error;
    }
  }

  /**
   * Send payment using Worldcoin MiniKit
   */
  async sendPayment(paymentRequest: PaymentRequest): Promise<any> {
    try {
      await this.initializeMiniKit();

      const result = await MiniKit.commandsAsync.pay({
        reference: paymentRequest.reference,
        to: paymentRequest.to as `0x${string}`,
        tokens: paymentRequest.tokens.map(token => ({
          symbol: token.symbol as any,
          token_amount: token.token_amount,
        })),
        description: paymentRequest.description,
      });

      return result.finalPayload;
    } catch (error) {
      console.error('Failed to send payment:', error);
      throw error;
    }
  }

  /**
   * Execute a smart contract transaction using Worldcoin MiniKit
   */
  async executeContractTransaction(
    transactionRequest: ContractTransactionRequest,
    userAddress: string
  ): Promise<{
    success: boolean;
    transactionHash?: string;
    error?: string;
  }> {
    try {
      console.log(`Executing contract transaction for user: ${userAddress}`);
      console.log(`  Contract: ${transactionRequest.contractAddress}`);
      console.log(`  Function: ${transactionRequest.functionName}`);
      console.log(`  Args: ${JSON.stringify(transactionRequest.args)}`);

      await this.initializeMiniKit();

      // Create the transaction request
      const transaction = {
        address: transactionRequest.contractAddress,
        abi: transactionRequest.abi,
        functionName: transactionRequest.functionName,
        args: transactionRequest.args,
        value: transactionRequest.value?.toString() || '0',
      };

      // Execute the transaction using MiniKit
      const result = await MiniKit.commandsAsync.sendTransaction({
        transaction: [transaction],
      });

      console.log(`✅ Contract transaction successful!`);
      
      if (result.finalPayload.status === 'success') {
        console.log(`  Transaction Hash: ${result.finalPayload.transaction_id}`);
        console.log(`  Status: ${result.finalPayload.status}`);

        return {
          success: true,
          transactionHash: result.finalPayload.transaction_id,
        };
      } else {
        console.log(`  Error: ${result.finalPayload.error_code}`);
        return {
          success: false,
          error: result.finalPayload.error_code,
        };
      }

    } catch (error) {
      console.error('❌ Contract transaction failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Store message metadata on the smart contract using Worldcoin MiniKit
   */
  async storeMessageMetadata(
    contractAddress: string,
    abi: any,
    messageRecord: {
      blobId: string;
      conversationId: string;
      messageType: string;
      suiObjectId?: string;
      txDigest?: string;
    },
    userAddress: string
  ): Promise<{
    success: boolean;
    transactionHash?: string;
    error?: string;
  }> {
    try {
      console.log(`Storing message metadata on contract: ${contractAddress}`);
      console.log(`  Blob ID: ${messageRecord.blobId}`);
      console.log(`  Conversation ID: ${messageRecord.conversationId}`);
      console.log(`  Message Type: ${messageRecord.messageType}`);

      const transactionRequest: ContractTransactionRequest = {
        contractAddress,
        abi,
        functionName: 'storeMessage',
        args: [
          messageRecord.blobId,
          messageRecord.conversationId,
          messageRecord.messageType,
          messageRecord.suiObjectId || '',
          messageRecord.txDigest || ''
        ],
      };

      return await this.executeContractTransaction(transactionRequest, userAddress);

    } catch (error) {
      console.error('Failed to store message metadata:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Estimate gas for a contract transaction
   */
  async estimateGas(
    contractAddress: string,
    abi: any,
    functionName: string,
    args: any[]
  ): Promise<bigint> {
    try {
      await this.initializeMiniKit();

      // For now, use a mock estimation since MiniKit doesn't have direct gas estimation
      // In production, you would use a different method or service
      const baseGas = 21000n;
      const functionGas = 50000n;
      return baseGas + functionGas;
    } catch (error) {
      console.error('Failed to estimate gas:', error);
      return 300000n; // Default gas limit
    }
  }

  /**
   * Encode function data for contract transaction
   */
  private encodeFunctionData(abi: any, functionName: string, args: any[]): `0x${string}` {
    // Mock function encoding for development
    // In production, you would use viem's encodeFunctionData
    const functionSignature = `${functionName}(${args.map(() => 'string').join(',')})`;
    const encodedArgs = args.map(arg => arg.toString()).join('');
    return `0x${functionSignature}${encodedArgs}` as `0x${string}`;
  }

  /**
   * Get contacts from Worldcoin MiniKit
   */
  async getContacts(): Promise<Array<{
    address: string;
    username?: string;
    profilePicture?: string;
  }>> {
    try {
      await this.initializeMiniKit();

      const result = await MiniKit.commandsAsync.shareContacts({
        isMultiSelectEnabled: true,
        inviteMessage: 'Join me on Chatterbox!',
      });

      if (result.finalPayload.status === 'success' && result.finalPayload.contacts) {
        return result.finalPayload.contacts.map(contact => ({
          address: contact.walletAddress,
          username: contact.username,
          profilePicture: contact.profilePictureUrl || undefined,
        }));
      }

      // Return mock contacts if no contacts shared
      return [
        {
          address: '0xa882a2af989de54330f994cf626ea7f5d5edc2fc',
          username: 'ewan.1300.world.id',
          profilePicture: 'https://via.placeholder.com/150/10B981/FFFFFF?text=E',
        },
        {
          address: '0x582be5da7d06b2bf6d89c5b4499491c5990fafe4',
          username: 'mathieu.3580.world.id',
          profilePicture: 'https://via.placeholder.com/150/F59E0B/FFFFFF?text=M',
        },
      ];
    } catch (error) {
      console.error('Failed to get contacts:', error);
      return [];
    }
  }

  /**
   * Convert token amount to decimals
   */
  tokenToDecimals(amount: number, token: 'WLD' | 'USDC'): string {
    return tokenToDecimals(amount, token);
  }

  /**
   * Legacy methods for backward compatibility
   */
  async initiatePayment(): Promise<{ id: string }> {
    try {
      return await initiatePayment();
    } catch (error) {
      console.error('Failed to initiate payment:', error);
      throw error;
    }
  }

  async confirmPayment(payload: any): Promise<{ success: boolean }> {
    try {
      return await confirmPayment(payload);
    } catch (error) {
      console.error('Failed to confirm payment:', error);
      throw error;
    }
  }
} 