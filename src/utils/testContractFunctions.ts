import { SmartContractService } from '../services/smartContractService';
import { DecentralizedMessagingService } from '../services/decentralizedMessagingService';

/**
 * Test the contract functions to verify they work correctly
 */
async function testContractFunctions() {
  console.log('🧪 Testing Contract Functions...\n');

  // Initialize services
  const smartContractService = new SmartContractService({
    contractAddress: '0x063816286ae3312e759f80Afdb10C8879b30688D',
    network: 'testnet',
  });

  const decentralizedService = new DecentralizedMessagingService({
    walrus: {
      aggregatorUrl: 'https://walrus-aggregator.testnet.mystenlabs.com',
      publisherUrl: 'https://walrus-publisher.testnet.mystenlabs.com',
      network: 'testnet',
    },
    smartContract: {
      contractAddress: '0x063816286ae3312e759f80Afdb10C8879b30688D',
      network: 'testnet',
    },
  });

  const testUserAddress = '0x582be5da7d06b2bf6d89c5b4499491c5990fafe4';

  try {
    // Test 1: Check contract connection
    console.log('🔗 Test 1: Testing contract connection...');
    const isConnected = await smartContractService.testContractConnection();
    console.log(`Contract connection: ${isConnected ? '✅ Success' : '❌ Failed'}\n`);

    // Test 2: Test getUserMessages (the function we're using)
    console.log('📨 Test 2: Testing getUserMessages...');
    const userMessages = await smartContractService.getMessageHistory(testUserAddress);
    console.log(`User messages: ${userMessages.length} found`);
    console.log('Sample message:', userMessages[0] || 'No messages found');
    console.log('');

    // Test 3: Test getUserConversations (our updated implementation)
    console.log('💬 Test 3: Testing getUserConversations...');
    const userConversations = await smartContractService.getUserConversations(testUserAddress);
    console.log(`User conversations: ${userConversations.length} found`);
    console.log('Conversation IDs:', userConversations);
    console.log('');

    // Test 4: Test decentralized service getUserConversations
    console.log('🌐 Test 4: Testing decentralized service getUserConversations...');
    const decentralizedConversations = await decentralizedService.getUserConversations(testUserAddress);
    console.log(`Decentralized conversations: ${decentralizedConversations.length} found`);
    console.log('Conversations:', decentralizedConversations);
    console.log('');

    console.log('✅ All tests completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testContractFunctions(); 