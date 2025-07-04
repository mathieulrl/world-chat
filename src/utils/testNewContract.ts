import { SmartContractService } from '../services/smartContractService';
import { DecentralizedMessagingService } from '../services/decentralizedMessagingService';

/**
 * Test the new contract address and getUserConversations functionality
 */
export async function testNewContract() {
  console.log('🆕 Testing New Contract Address and Features...');
  console.log('===============================================');

  try {
    // Initialize services with new contract address
    const smartContractService = new SmartContractService({
      contractAddress: '0xA27F6614c53ce3c4E7ac92A64d03bA1853e3c304',
      network: 'testnet',
    });

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

    // Test 1: Check contract connection
    console.log('\n🔗 Test 1: Testing contract connection');
    const connectionTest = await smartContractService.testContractConnection();
    console.log(`✅ Contract connection: ${connectionTest ? 'SUCCESS' : 'FAILED'}`);

    // Test 2: Get user conversations (new functionality)
    console.log('\n💬 Test 2: Testing getUserConversations');
    const testUserAddress = '0x582be5da7d06b2bf6d89c5b4499491c5990fafe4'; // mathieu's address
    const userConversations = await smartContractService.getUserConversations(testUserAddress);
    console.log(`✅ Found ${userConversations.length} conversations for user`);

    // Test 3: Get conversation details
    console.log('\n📋 Test 3: Testing conversation details');
    if (userConversations.length > 0) {
      const firstConversationId = userConversations[0];
      const conversationDetails = await smartContractService.getConversation(firstConversationId);
      console.log(`✅ Conversation details: ${conversationDetails.id}`);
      console.log(`   Participants: ${conversationDetails.participants?.length || 0}`);
    }

    // Test 4: Test decentralized service getUserConversations
    console.log('\n🌐 Test 4: Testing decentralized service getUserConversations');
    const decentralizedConversations = await decentralizedService.getUserConversations(testUserAddress);
    console.log(`✅ Decentralized service found ${decentralizedConversations.length} conversations`);

    // Test 5: Get message history
    console.log('\n📚 Test 5: Testing message history');
    const messageHistory = await smartContractService.getMessageHistory(testUserAddress);
    console.log(`✅ Found ${messageHistory.length} messages in user history`);

    console.log('\n🎉 New contract test completed!');
    console.log('\n📋 Summary:');
    console.log(`   - Contract connection: ${connectionTest ? '✅ Success' : '❌ Failed'}`);
    console.log(`   - User conversations: ${userConversations.length} found`);
    console.log(`   - Decentralized conversations: ${decentralizedConversations.length} found`);
    console.log(`   - Message history: ${messageHistory.length} messages`);

    return {
      success: true,
      contractConnected: connectionTest,
      userConversations: userConversations.length,
      decentralizedConversations: decentralizedConversations.length,
      messageHistory: messageHistory.length,
    };

  } catch (error) {
    console.error('❌ New contract test failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Quick test for new contract address
 */
export async function quickNewContractTest() {
  console.log('⚡ Quick New Contract Test...');

  try {
    const smartContractService = new SmartContractService({
      contractAddress: '0xA27F6614c53ce3c4E7ac92A64d03bA1853e3c304',
      network: 'testnet',
    });

    const connectionTest = await smartContractService.testContractConnection();
    console.log(`Contract connected: ${connectionTest ? '✅ Yes' : '❌ No'}`);

    return {
      success: connectionTest,
      contractAddress: '0xA27F6614c53ce3c4E7ac92A64d03bA1853e3c304',
    };
  } catch (error) {
    console.error('Quick test failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Export for use in development
export default testNewContract; 