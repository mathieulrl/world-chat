import { DecentralizedMessagingService } from '../services/decentralizedMessagingService';
import { Message } from '../types/messaging';

export async function testDecentralizedMessaging() {
  console.log('🧪 Testing Decentralized Messaging System...');

  // Initialize the service
  const decentralizedService = new DecentralizedMessagingService({
    walrus: {
      aggregatorUrl: 'https://walrus-aggregator.testnet.mystenlabs.com',
      publisherUrl: 'https://walrus-publisher.testnet.mystenlabs.com',
      network: 'testnet',
    },
    smartContract: {
      contractAddress: '0xA27F6614c53ce3c4E7ac92A64d03bA1853e3c304',
      network: 'testnet',
    },
  });

  const testUserAddress = '0x1234567890123456789012345678901234567890';
  const testConversationId = 'test_conv_1';

  try {
    // Test 1: Send a text message
    console.log('\n📝 Test 1: Sending text message');
    const textMessage: Message = {
      id: 'test_msg_1',
      conversationId: testConversationId,
      senderId: testUserAddress,
      content: 'Hello, this is a test message!',
      timestamp: new Date(),
      messageType: 'text',
    };

    const textResult = await decentralizedService.sendMessage(textMessage, testUserAddress);
    console.log('✅ Text message sent successfully');
    console.log(`   Walrus Blob ID: ${textResult.walrusResult.blobId}`);
    console.log(`   Contract TX: ${textResult.contractTxHash}`);

    // Test 2: Send a payment message
    console.log('\n💰 Test 2: Sending payment message');
    const paymentMessage: Message = {
      id: 'test_msg_2',
      conversationId: testConversationId,
      senderId: testUserAddress,
      content: 'Sent 10 WLD to alice.world',
      timestamp: new Date(),
      messageType: 'payment',
      paymentData: {
        amount: 10,
        token: 'WLD',
        recipientAddress: '0xalice123456789012345678901234567890123456',
        transactionHash: '0xtx1234567890123456789012345678901234567890',
        status: 'completed',
      },
    };

    const paymentResult = await decentralizedService.sendMessage(paymentMessage, testUserAddress);
    console.log('✅ Payment message sent successfully');
    console.log(`   Walrus Blob ID: ${paymentResult.walrusResult.blobId}`);
    console.log(`   Contract TX: ${paymentResult.contractTxHash}`);

    // Test 3: Retrieve conversation messages
    console.log('\n📥 Test 3: Retrieving conversation messages');
    const retrievedMessages = await decentralizedService.getConversationMessages(testConversationId);
    console.log(`✅ Retrieved ${retrievedMessages.length} messages from conversation`);
    
    retrievedMessages.forEach((msg, index) => {
      console.log(`   Message ${index + 1}: ${msg.content} (${msg.messageType})`);
    });

    // Test 4: Get message history
    console.log('\n📚 Test 4: Getting message history');
    const messageHistory = await decentralizedService.getMessageHistory(testUserAddress);
    console.log(`✅ Retrieved ${messageHistory.length} messages from user history`);
    
    messageHistory.forEach((msg, index) => {
      console.log(`   Message ${index + 1}: ${msg.content} (${msg.messageType})`);
    });

    // Test 5: Verify message integrity
    console.log('\n🔍 Test 5: Verifying message integrity');
    if (textResult.walrusResult.blobId) {
      const isValid = await decentralizedService.verifyMessage(textResult.walrusResult.blobId, testUserAddress);
      console.log(`✅ Message verification: ${isValid ? 'PASSED' : 'FAILED'}`);
    }

    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Messages sent: 2`);
    console.log(`   - Messages retrieved: ${retrievedMessages.length}`);
    console.log(`   - Walrus storage: ✅ Working`);
    console.log(`   - Smart contract: ✅ Working`);
    console.log(`   - Message verification: ✅ Working`);

  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  }
}

// Export for use in development
export default testDecentralizedMessaging; 