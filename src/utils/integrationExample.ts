import { SmartContractService } from '../services/smartContractService';
import { WorldcoinService } from '../services/worldcoinService';
import { WalrusStorageService } from '../services/walrusStorageService';
import { DecentralizedMessagingService } from '../services/decentralizedMessagingService';

/**
 * Integration example showing how to use Worldcoin MiniKit for contract writing
 * This demonstrates the complete flow from message creation to on-chain storage
 */
export class MessagingIntegrationExample {
  private smartContractService: SmartContractService;
  private worldcoinService: WorldcoinService;
  private walrusService: WalrusStorageService;
  private decentralizedService: DecentralizedMessagingService;

  constructor() {
    // Initialize services
    this.smartContractService = new SmartContractService({
      contractAddress: '0x34bF1A2460190e60e33309BF8c54D9A7c9eCB4B8',
      network: 'testnet',
      rpcUrl: 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY',
    });

    this.worldcoinService = WorldcoinService.getInstance();
    this.walrusService = new WalrusStorageService({
      aggregatorUrl: 'https://walrus-aggregator.testnet.mystenlabs.com',
      publisherUrl: 'https://walrus-publisher.testnet.mystenlabs.com',
      network: 'testnet',
    });

    this.decentralizedService = new DecentralizedMessagingService({
      walrus: {
        aggregatorUrl: 'https://aggregator.walrus-testnet.walrus.space',
        publisherUrl: 'https://publisher.walrus-testnet.walrus.space',
        network: 'testnet',
      },
      smartContract: {
        contractAddress: '0x063816286ae3312e759f80Afdb10C8879b30688D',
        network: 'testnet',
        rpcUrl: 'https://worldchain-sepolia.drpc.org',
      },
    });
  }

  /**
   * Send a text message with full integration
   * 1. Store message in Walrus
   * 2. Store metadata on smart contract using Worldcoin MiniKit
   */
  async sendTextMessage(
    message: string,
    conversationId: string,
    senderAddress: string
  ): Promise<{
    success: boolean;
    blobId?: string;
    transactionHash?: string;
    error?: string;
  }> {
    try {
      console.log(`📝 Sending text message: "${message}"`);
      console.log(`   Conversation: ${conversationId}`);
      console.log(`   Sender: ${senderAddress}`);

      // Step 1: Store message in Walrus
      console.log('\n💾 Step 1: Storing message in Walrus...');
      const walrusResult = await this.walrusService.storeMessage({
        id: `msg_${Date.now()}`,
        content: message,
        conversationId,
        senderId: senderAddress,
        messageType: 'text',
        timestamp: new Date(),
      }, senderAddress);

      console.log(`✅ Message stored in Walrus! Blob ID: ${walrusResult.blobId}`);

      // Step 2: Create message record
      const messageRecord = this.smartContractService.createMessageRecord(
        walrusResult,
        {
          conversationId,
          senderId: senderAddress,
          messageType: 'text',
        }
      );

      // Step 3: Store metadata on smart contract using Worldcoin MiniKit
      console.log('\n🌍 Step 2: Storing metadata on smart contract with Worldcoin MiniKit...');
      const contractResult = await this.smartContractService.storeMessageMetadata(
        messageRecord,
        senderAddress
      );

      console.log(`✅ Message metadata stored on smart contract!`);
      console.log(`   Transaction Hash: ${contractResult}`);

      return {
        success: true,
        blobId: walrusResult.blobId,
        transactionHash: contractResult,
      };

    } catch (error) {
      console.error('❌ Failed to send text message:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Send a payment message with full integration
   */
  async sendPaymentMessage(
    amount: number,
    token: 'WLD' | 'USDC',
    recipientAddress: string,
    conversationId: string,
    senderAddress: string
  ): Promise<{
    success: boolean;
    blobId?: string;
    transactionHash?: string;
    paymentTxHash?: string;
    error?: string;
  }> {
    try {
      console.log(`💰 Sending payment message: ${amount} ${token}`);
      console.log(`   Recipient: ${recipientAddress}`);
      console.log(`   Conversation: ${conversationId}`);

      // Step 1: Execute payment through Worldcoin MiniKit
      console.log('\n🌍 Step 1: Executing payment with Worldcoin MiniKit...');
      const paymentRequest = {
        reference: `payment_${Date.now()}`,
        to: recipientAddress,
        tokens: [{
          symbol: token,
          token_amount: this.worldcoinService.tokenToDecimals(amount, token),
        }],
        description: `Payment of ${amount} ${token}`,
      };

      const paymentResult = await this.worldcoinService.executePayment(paymentRequest);

      if (paymentResult.status !== 'success') {
        throw new Error(`Payment failed: ${paymentResult.status}`);
      }

      console.log(`✅ Payment executed! Transaction: ${paymentResult.transactionHash}`);

      // Step 2: Store payment message in Walrus
      console.log('\n💾 Step 2: Storing payment message in Walrus...');
      const paymentMessage = `Sent ${amount} ${token} to ${recipientAddress}`;
      
      const walrusResult = await this.walrusService.storeMessage({
        id: `payment_${Date.now()}`,
        content: paymentMessage,
        conversationId,
        senderId: senderAddress,
        messageType: 'payment',
        timestamp: new Date(),
      }, senderAddress);

      console.log(`✅ Payment message stored in Walrus! Blob ID: ${walrusResult.blobId}`);

      // Step 3: Store metadata on smart contract
      console.log('\n🌍 Step 3: Storing payment metadata on smart contract...');
      const messageRecord = this.smartContractService.createMessageRecord(
        walrusResult,
        {
          conversationId,
          senderId: senderAddress,
          messageType: 'payment',
        }
      );

      const contractResult = await this.smartContractService.storeMessageMetadata(
        messageRecord,
        senderAddress
      );

      console.log(`✅ Payment metadata stored on smart contract!`);
      console.log(`   Transaction Hash: ${contractResult}`);

      return {
        success: true,
        blobId: walrusResult.blobId,
        transactionHash: contractResult,
        paymentTxHash: paymentResult.transactionHash,
      };

    } catch (error) {
      console.error('❌ Failed to send payment message:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Request payment with full integration
   */
  async requestPayment(
    amount: number,
    token: 'WLD' | 'USDC',
    recipientAddress: string,
    description: string,
    conversationId: string,
    senderAddress: string
  ): Promise<{
    success: boolean;
    blobId?: string;
    transactionHash?: string;
    requestId?: string;
    error?: string;
  }> {
    try {
      console.log(`📋 Requesting payment: ${amount} ${token}`);
      console.log(`   Recipient: ${recipientAddress}`);
      console.log(`   Description: ${description}`);

      // Step 1: Store payment request message in Walrus
      console.log('\n💾 Step 1: Storing payment request in Walrus...');
      const requestMessage = `Requested ${amount} ${token} from ${recipientAddress}: ${description}`;
      
      const walrusResult = await this.walrusService.storeMessage({
        id: `request_${Date.now()}`,
        content: requestMessage,
        conversationId,
        senderId: senderAddress,
        messageType: 'payment_request',
        timestamp: new Date(),
      }, senderAddress);

      console.log(`✅ Payment request stored in Walrus! Blob ID: ${walrusResult.blobId}`);

      // Step 2: Store metadata on smart contract
      console.log('\n🌍 Step 2: Storing payment request metadata on smart contract...');
      const messageRecord = this.smartContractService.createMessageRecord(
        walrusResult,
        {
          conversationId,
          senderId: senderAddress,
          messageType: 'payment_request',
        }
      );

      const contractResult = await this.smartContractService.storeMessageMetadata(
        messageRecord,
        senderAddress
      );

      console.log(`✅ Payment request metadata stored on smart contract!`);
      console.log(`   Transaction Hash: ${contractResult}`);

      return {
        success: true,
        blobId: walrusResult.blobId,
        transactionHash: contractResult,
        requestId: `request_${Date.now()}`,
      };

    } catch (error) {
      console.error('❌ Failed to request payment:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get conversation history with full integration
   */
  async getConversationHistory(conversationId: string): Promise<{
    success: boolean;
    messages?: Array<{
      blobId: string;
      content: string;
      senderId: string;
      messageType: string;
      timestamp: string;
      transactionHash?: string;
    }>;
    error?: string;
  }> {
    try {
      console.log(`📚 Getting conversation history: ${conversationId}`);

      // Step 1: Get message records from smart contract
      console.log('\n🌍 Step 1: Getting message records from smart contract...');
      const messageRecords = await this.smartContractService.getConversationMessages(conversationId);

      if (messageRecords.length === 0) {
        console.log('✅ No messages found for this conversation');
        return {
          success: true,
          messages: [],
        };
      }

      console.log(`✅ Found ${messageRecords.length} message records`);

      // Step 2: Retrieve actual message content from Walrus
      console.log('\n💾 Step 2: Retrieving message content from Walrus...');
      const messages = [];

      for (const record of messageRecords) {
        try {
          const content = await this.walrusService.retrieveMessage(record.blobId);
          
          messages.push({
            blobId: record.blobId,
            content: content.content,
            senderId: record.senderId,
            messageType: record.messageType,
            timestamp: record.timestamp,
            transactionHash: record.txDigest,
          });
        } catch (error) {
          console.warn(`Failed to retrieve message ${record.blobId}:`, error);
        }
      }

      console.log(`✅ Retrieved ${messages.length} messages from Walrus`);

      return {
        success: true,
        messages,
      };

    } catch (error) {
      console.error('❌ Failed to get conversation history:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Test the complete integration
   */
  async testCompleteIntegration(): Promise<void> {
    console.log('🧪 Testing Complete Messaging Integration...');

    const testUserAddress = '0x1234567890123456789012345678901234567890';
    const testConversationId = 'test_integration_conversation';

    try {
      // Test 1: Send text message
      console.log('\n📝 Test 1: Sending text message');
      const textResult = await this.sendTextMessage(
        'Hello from Worldcoin MiniKit integration!',
        testConversationId,
        testUserAddress
      );
      console.log(`✅ Text message result: ${textResult.success ? 'SUCCESS' : 'FAILED'}`);

      // Test 2: Send payment message
      console.log('\n💰 Test 2: Sending payment message');
      const paymentResult = await this.sendPaymentMessage(
        10,
        'WLD',
        '0x1111111111111111111111111111111111111111',
        testConversationId,
        testUserAddress
      );
      console.log(`✅ Payment message result: ${paymentResult.success ? 'SUCCESS' : 'FAILED'}`);

      // Test 3: Request payment
      console.log('\n📋 Test 3: Requesting payment');
      const requestResult = await this.requestPayment(
        5,
        'USDC',
        '0x2222222222222222222222222222222222222222',
        'Lunch payment',
        testConversationId,
        testUserAddress
      );
      console.log(`✅ Payment request result: ${requestResult.success ? 'SUCCESS' : 'FAILED'}`);

      // Test 4: Get conversation history
      console.log('\n📚 Test 4: Getting conversation history');
      const historyResult = await this.getConversationHistory(testConversationId);
      console.log(`✅ History result: ${historyResult.success ? 'SUCCESS' : 'FAILED'}`);
      console.log(`   Messages retrieved: ${historyResult.messages?.length || 0}`);

      console.log('\n🎉 Complete integration test finished!');
      console.log('\n📋 Test Summary:');
      console.log(`   - Text message: ${textResult.success ? '✅ Success' : '❌ Failed'}`);
      console.log(`   - Payment message: ${paymentResult.success ? '✅ Success' : '❌ Failed'}`);
      console.log(`   - Payment request: ${requestResult.success ? '✅ Success' : '❌ Failed'}`);
      console.log(`   - History retrieval: ${historyResult.success ? '✅ Success' : '❌ Failed'}`);

    } catch (error) {
      console.error('❌ Complete integration test failed:', error);
      throw error;
    }
  }
}

// Export for use in development
export default MessagingIntegrationExample;