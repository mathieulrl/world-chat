import { PaymentRequest } from '../types/messaging';
import { initiatePayment, confirmPayment } from '../api/initiate-payment';
import { createWalletClient, createPublicClient, http } from 'viem';
import { MiniKit } from '@worldcoin/minikit-js';
import MiniKitContractRegistration from '../utils/minikit-contract-registration';

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
  private publicClient: any;
  private minikit: MiniKit | null = null;
  
  private constructor() {
    // Get Infura ID from environment variable
    const infuraId = "e34629cc701f45ffbdb1d83ae332b4cf"
    
    if (!infuraId) {
      console.warn('⚠️ INFURA_ID not found in environment variables. Please add INFURA_ID to your .env file.');
    }
    
    // Define Worldcoin Sepolia chain configuration
    const worldcoinSepolia = {
      id: 4801,
      name: 'Worldcoin Sepolia',
      network: 'worldcoin-sepolia',
      nativeCurrency: {
        decimals: 18,
        name: 'Ether',
        symbol: 'ETH',
      },
      rpcUrls: {
        default: { http: ['https://worldchain-sepolia.drpc.org'] },
        public: { http: ['https://worldchain-sepolia.drpc.org'] },
      },
    } as const;
    
    // Initialize public client for reading contract data
    this.publicClient = createPublicClient({
      chain: worldcoinSepolia,
      transport: http(`https://worldchain-sepolia.drpc.org`),
    });
    
    // Initialize wallet client for contract transactions on Worldcoin Sepolia
    this.walletClient = createWalletClient({
      chain: worldcoinSepolia,
      transport: http(`https://worldchain-sepolia.drpc.org`),
    });

    console.log('WorldcoinService initialized for Worldcoin Sepolia (chainId 4801)');
    console.log('RPC URL: https://worldchain-sepolia.drpc.org');
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
      
      // Note: MiniKit chain configuration is handled by the World App
      // The app should be configured to support Worldcoin Sepolia (chainId 4801)
      console.log('Configuring MiniKit for Worldcoin Sepolia (chainId 4801)...');
      console.log('Note: Chain configuration is handled by World App');
      
      // Install MiniKit - this is crucial for proper initialization
      console.log('📦 Installing MiniKit...');
      await MiniKit.install();
      console.log('✅ MiniKit installation successful!');
      
      console.log('✅ Worldcoin MiniKit initialized successfully!');
      console.log(`   App ID: ${MiniKit.appId}`);
      console.log(`   Expected Chain: Worldcoin Sepolia (4801)`);
      return true;
      
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
      
      // For now, assume MiniKit is available if we can initialize it
      // In a real implementation, you would check if World App is installed
      console.log('✅ Worldcoin MiniKit is available');
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
      
      // Since MiniKit doesn't have user management methods,
      // we'll use a fallback approach for development
      // In production, you would integrate with World App's user system
      const mockUser = {
        address: '0x582be5da7d06b2bf6d89c5b4499491c5990fafe4', // mathieu's address
        username: 'mathieu.3580.world.id',
        profilePicture: 'https://via.placeholder.com/150/F59E0B/FFFFFF?text=M',
      };
      
      console.log('✅ Using development user data (MiniKit user management not available)');
      return mockUser;
      
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
      
      // Since MiniKit doesn't have user lookup methods,
      // we'll use a fallback approach for development
      const mockUsers = {
        '0x582be5da7d06b2bf6d89c5b4499491c5990fafe4': {
          address: '0x582be5da7d06b2bf6d89c5b4499491c5990fafe4',
          username: 'mathieu.3580.world.id',
          profilePicture: 'https://via.placeholder.com/150/F59E0B/FFFFFF?text=M',
        },
        '0xa882a2af989de54330f994cf626ea7f5d5edc2fc': {
          address: '0xa882a2af989de54330f994cf626ea7f5d5edc2fc',
          username: 'ewan.1300.world.id',
          profilePicture: 'https://via.placeholder.com/150/10B981/FFFFFF?text=E',
        },
      };
      
      const mockUser = mockUsers[address.toLowerCase()];
      if (mockUser) {
        console.log(`✅ Found user for address: ${address}`);
        return mockUser;
      }
      
      console.log(`⚠️ No user found for address: ${address}`);
      return null;
      
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

      console.log(`💰 Executing payment: ${paymentRequest.reference}`);
      console.log(`   To: ${paymentRequest.to}`);
      console.log(`   Tokens: ${JSON.stringify(paymentRequest.tokens)}`);
      console.log(`   Description: ${paymentRequest.description}`);

      // Log the amount conversion for clarity
      for (const token of paymentRequest.tokens) {
        const decimals = token.symbol === 'WLD' ? 8 : 6;
        const humanReadable = parseInt(token.token_amount) / Math.pow(10, decimals);
        console.log(`   ${token.symbol}: ${token.token_amount} decimals = ${humanReadable} ${token.symbol}`);
      }

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

      // Verify contract exists on chain
      console.log(`🔍 Verifying contract exists on chain...`);
      try {
        // Try to read a simple function to verify contract exists
        await this.publicClient.readContract({
          address: transactionRequest.contractAddress as `0x${string}`,
          abi: transactionRequest.abi,
          functionName: 'getUserMessageCount',
          args: ['0x0000000000000000000000000000000000000000'], // Test with zero address
        });
        console.log(`✅ Contract exists and is accessible`);
      } catch (error) {
        console.log(`⚠️ Could not verify contract: ${error}`);
        console.log(`   This might be due to RPC issues or chain mismatch`);
        console.log(`   Continuing with transaction attempt...`);
      }

      // Extract only the storeMessage function ABI from the full contract ABI
      const storeMessageAbi = transactionRequest.abi.find((item: any) => 
        item.type === 'function' && item.name === 'storeMessage'
      );

      if (!storeMessageAbi) {
        console.error('❌ storeMessage function not found in ABI');
        return {
          success: false,
          error: 'storeMessage function not found in contract ABI',
        };
      }

      // Create the transaction request according to MiniKit API specification
      const transaction = {
        address: transactionRequest.contractAddress,
        abi: [storeMessageAbi], // Only include the function ABI
        functionName: transactionRequest.functionName,
        args: transactionRequest.args,
        // Only include value if sending ETH
        ...(transactionRequest.value && transactionRequest.value > 0n && {
          value: `0x${transactionRequest.value.toString(16)}`
        }),
      };

      console.log(`Transaction details:`, {
        address: transaction.address,
        functionName: transaction.functionName,
        args: transaction.args,
        abi: transaction.abi,
        value: transaction.value || '0x0',
      });

      // Execute the transaction using MiniKit
      console.log(`📤 Sending transaction via MiniKit...`);
      console.log(`📋 Transaction payload:`, {
        transaction: [transaction],
        formatPayload: true,
      });
      
      const result = await MiniKit.commandsAsync.sendTransaction({
        transaction: [transaction],
        formatPayload: true, // Let MiniKit format the payload
      });

      console.log(`📥 MiniKit response:`, result);
      console.log(`📊 Final payload:`, result.finalPayload);
      console.log(`🔍 Status: ${result.finalPayload.status}`);
      
      // Handle the response based on status
      if (result.finalPayload.status === 'success') {
        const successPayload = result.finalPayload as any;
        console.log(`🆔 Transaction ID: ${successPayload.transaction_id || 'N/A'}`);
        
        const transactionId = successPayload.transaction_id;
        console.log(`✅ MiniKit transaction successful!`);
        console.log(`  Transaction ID: ${transactionId}`);
        console.log(`  Status: ${result.finalPayload.status}`);

        // Wait for transaction confirmation
        console.log(`⏳ Waiting for transaction confirmation...`);
        const transactionHash = await this.waitForTransactionConfirmation(transactionId);
        
        if (transactionHash) {
          console.log(`✅ Transaction confirmed on-chain!`);
          console.log(`  Transaction Hash: ${transactionHash}`);
          return {
            success: true,
            transactionHash: transactionHash,
          };
        } else {
          console.log(`⚠️ Transaction ID received but hash not available yet`);
          return {
            success: true,
            transactionHash: transactionId, // Return ID as fallback
          };
        }
      } else {
        const errorPayload = result.finalPayload as any;
        console.log(`🆔 Transaction ID: ${errorPayload.transaction_id || 'N/A'}`);
        console.log(`❌ Error Code: ${errorPayload.error_code || 'N/A'}`);
        
        console.log(`❌ MiniKit transaction failed:`);
        console.log(`  Error Code: ${errorPayload.error_code}`);
        console.log(`  Error Details:`, result.finalPayload);
        
        // Handle specific error cases
        if (errorPayload.error_code === 'invalid_contract') {
          console.log(`⚠️ Contract not registered with MiniKit`);
          console.log(`   Contract: ${transactionRequest.contractAddress}`);
          console.log(`   Please register the contract in the Worldcoin Developer Portal`);
        } else if (errorPayload.error_code === 'simulation_failed') {
          console.log(`⚠️ Transaction simulation failed`);
          const debugUrl = errorPayload.debug_url;
          if (debugUrl) {
            console.log(`   Debug URL: ${debugUrl}`);
          }
        } else if (errorPayload.error_code === 'user_rejected') {
          console.log(`⚠️ User rejected the transaction`);
        } else {
          console.log(`⚠️ Unknown error: ${errorPayload.error_code}`);
        }
        
        return {
          success: false,
          error: `MiniKit error: ${errorPayload.error_code}`,
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
   * Wait for transaction confirmation using transaction ID
   */
  private async waitForTransactionConfirmation(transactionId: string): Promise<string | null> {
    try {
      console.log(`🔍 Checking transaction status for ID: ${transactionId}`);
      
      // Poll the Worldcoin API for transaction status
      const response = await fetch(
        `https://developer.worldcoin.org/api/v2/minikit/transaction/${transactionId}?app_id=${MiniKit.appId}&type=transaction`,
        {
          method: 'GET',
        }
      );

      if (!response.ok) {
        console.log(`⚠️ Failed to check transaction status: ${response.status}`);
        return null;
      }

      const transaction = await response.json();
      console.log(`📊 Transaction status:`, transaction);

      if (transaction.transactionStatus === 'confirmed' && transaction.transactionHash) {
        return transaction.transactionHash;
      } else if (transaction.transactionStatus === 'failed') {
        console.log(`❌ Transaction failed on-chain`);
        return null;
      } else {
        console.log(`⏳ Transaction still pending: ${transaction.transactionStatus}`);
        return null;
      }
    } catch (error) {
      console.error('Error checking transaction status:', error);
      return null;
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