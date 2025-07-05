import { SmartContractService } from '../services/smartContractService';
import { WorldcoinService } from '../services/worldcoinService';

/**
 * Test utility for implementing actual contract reading and writing
 * This helps you integrate with your deployed smart contract
 */
export async function testContractIntegration() {
  console.log('🧪 Testing Smart Contract Integration...');

  // Initialize the service with your deployed contract
  const service = new SmartContractService({
    contractAddress: '0xA27F6614c53ce3c4E7ac92A64d03bA1853e3c304', // Updated contract
    network: 'testnet',
    rpcUrl: 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY', // You'll need to add your Infura key
  });

  const testUserAddress = '0x1234567890123456789012345678901234567890';
  const testConversationId = 'test_conv_1';

  try {
    // Test 1: Get contract info
    console.log('\n📋 Test 1: Getting contract information');
    const contractInfo = service.getContractInfo();
    console.log('✅ Contract info retrieved:');
    console.log(`   Address: ${contractInfo.address}`);
    console.log(`   Network: ${contractInfo.network}`);
    console.log(`   ABI functions: ${contractInfo.abi.length} functions available`);

    // Test 2: Test contract connectivity
    console.log('\n🔗 Test 2: Testing contract connectivity');
    const isConnected = await service.testContractConnection();
    console.log(`✅ Contract connectivity: ${isConnected ? 'SUCCESS' : 'FAILED'}`);

    // Test 3: Get message history (now using real contract calls)
    console.log('\n📚 Test 3: Getting message history');
    const messageHistory = await service.getMessageHistory(testUserAddress);
    console.log(`✅ Retrieved ${messageHistory.length} messages from contract`);
    
    if (messageHistory.length > 0) {
      messageHistory.forEach((msg, index) => {
        console.log(`   Message ${index + 1}: ${msg.blobId} (${msg.messageType})`);
      });
    }

    // Test 4: Get conversation messages
    console.log('\n💬 Test 4: Getting conversation messages');
    const conversationMessages = await service.getConversationMessages(testConversationId);
    console.log(`✅ Retrieved ${conversationMessages.length} messages for conversation`);
    
    if (conversationMessages.length > 0) {
      conversationMessages.forEach((msg, index) => {
        console.log(`   Message ${index + 1}: ${msg.blobId} (${msg.messageType})`);
      });
    }

    // Test 5: Get user message count
    console.log('\n📊 Test 5: Getting user message count');
    const messageCount = await service.getUserMessageCount(testUserAddress);
    console.log(`✅ User has ${messageCount} messages`);

    // Test 6: Search messages by type
    console.log('\n🔍 Test 6: Searching messages by type');
    const textMessages = await service.getUserMessagesByType(testUserAddress, 'text');
    console.log(`✅ Found ${textMessages.length} text messages`);

    console.log('\n🎉 Contract integration test completed!');
    console.log('\n📋 Summary:');
    console.log(`   - Contract address: ${contractInfo.address}`);
    console.log(`   - Connectivity: ${isConnected ? '✅ Working' : '❌ Failed'}`);
    console.log(`   - Message history: ${messageHistory.length} messages`);
    console.log(`   - Conversation messages: ${conversationMessages.length} messages`);
    console.log(`   - User message count: ${messageCount}`);
    console.log(`   - Text messages found: ${textMessages.length}`);

  } catch (error) {
    console.error('❌ Contract integration test failed:', error);
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Check if your Infura/Alchemy API key is correct');
    console.log('   2. Verify the contract address is correct');
    console.log('   3. Ensure the contract is deployed on Sepolia testnet');
    console.log('   4. Check if the ABI matches your deployed contract');
    throw error;
  }
}

/**
 * Test Worldcoin MiniKit contract writing functionality
 */
export async function testWorldcoinContractWriting() {
  console.log('\n🌍 Testing Worldcoin MiniKit Contract Writing...');

  const service = new SmartContractService({
    contractAddress: '0xA27F6614c53ce3c4E7ac92A64d03bA1853e3c304',
    network: 'testnet',
    rpcUrl: 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY',
  });

  const worldcoinService = WorldcoinService.getInstance();
  const testUserAddress = '0x1234567890123456789012345678901234567890';

  try {
    // Test 1: Check Worldcoin MiniKit installation
    console.log('\n📱 Test 1: Checking Worldcoin MiniKit installation');
    const isInstalled = worldcoinService.isInstalled();
    console.log(`✅ Worldcoin MiniKit installed: ${isInstalled ? 'YES' : 'NO'}`);

    // Test 2: Get current user
    console.log('\n👤 Test 2: Getting current user');
    const currentUser = worldcoinService.getCurrentUser();
    console.log(`✅ Current user: ${currentUser.username} (${currentUser.address})`);

    // Test 3: Test contract writing with Worldcoin MiniKit
    console.log('\n✍️ Test 3: Testing contract writing with Worldcoin MiniKit');
    const writingSuccess = await service.testContractWriting(testUserAddress);
    console.log(`✅ Contract writing test: ${writingSuccess ? 'SUCCESS' : 'FAILED'}`);

    // Test 4: Test gas estimation
    console.log('\n⛽ Test 4: Testing gas estimation');
    const estimatedGas = await worldcoinService.estimateGas(
      service.getContractAddress(),
      service.getContractAbi(),
      'storeMessage',
      ['test_blob', 'test_conv', 'text', '', '']
    );
    console.log(`✅ Estimated gas: ${estimatedGas.toString()}`);

    // Test 5: Test message metadata storage
    console.log('\n💾 Test 5: Testing message metadata storage');
    const testMessageRecord = {
      blobId: 'test_worldcoin_blob_id',
      conversationId: 'test_worldcoin_conversation',
      senderId: testUserAddress,
      messageType: 'text' as const,
      timestamp: new Date().toISOString(),
    };

    const storageResult = await service.storeMessageMetadata(testMessageRecord, testUserAddress);
    console.log(`✅ Message metadata storage: ${storageResult}`);

    console.log('\n🎉 Worldcoin MiniKit contract writing test completed!');
    console.log('\n📋 Summary:');
    console.log(`   - MiniKit installed: ${isInstalled ? '✅ Yes' : '❌ No'}`);
    console.log(`   - Current user: ${currentUser.username}`);
    console.log(`   - Contract writing: ${writingSuccess ? '✅ Working' : '❌ Failed'}`);
    console.log(`   - Gas estimation: ${estimatedGas.toString()} gas`);
    console.log(`   - Message storage: ${storageResult}`);

  } catch (error) {
    console.error('❌ Worldcoin MiniKit contract writing test failed:', error);
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Ensure Worldcoin MiniKit is properly integrated');
    console.log('   2. Check if the user has sufficient funds for gas');
    console.log('   3. Verify the contract address and ABI are correct');
    console.log('   4. Make sure the RPC endpoint is working');
    throw error;
  }
}

/**
 * Test specific contract functions
 */
export async function testSpecificContractFunctions() {
  console.log('\n🔧 Testing Specific Contract Functions...');

  const service = new SmartContractService({
    contractAddress: '0xA27F6614c53ce3c4E7ac92A64d03bA1853e3c304',
    network: 'testnet',
    rpcUrl: 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY',
  });

  try {
    // Test getUserMessageCount function
    console.log('\n📊 Testing getUserMessageCount...');
    const testAddress = '0x0000000000000000000000000000000000000000';
    const count = await service.getUserMessageCount(testAddress);
    console.log(`✅ getUserMessageCount result: ${count}`);

    // Test getConversation function
    console.log('\n💬 Testing getConversation...');
    const testConvId = 'test_conversation_1';
    const conversation = await service.getConversation(testConvId);
    console.log(`✅ getConversation result:`, conversation);

    console.log('\n✅ Specific function tests completed!');

  } catch (error) {
    console.error('❌ Specific function tests failed:', error);
    throw error;
  }
}

/**
 * Comprehensive test of the full messaging flow
 */
export async function testFullMessagingFlow() {
  console.log('\n🔄 Testing Full Messaging Flow...');

  const service = new SmartContractService({
    contractAddress: '0xA27F6614c53ce3c4E7ac92A64d03bA1853e3c304',
    network: 'testnet',
    rpcUrl: 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY',
  });

  const testUserAddress = '0x1234567890123456789012345678901234567890';
  const testConversationId = 'test_full_flow_conversation';

  try {
    // Step 1: Create a message record (simulating Walrus storage)
    console.log('\n📝 Step 1: Creating message record');
    const messageRecord = {
      blobId: 'full_flow_blob_id',
      conversationId: testConversationId,
      senderId: testUserAddress,
      messageType: 'text' as const,
      timestamp: new Date().toISOString(),
    };
    console.log(`✅ Message record created: ${messageRecord.blobId}`);

    // Step 2: Store message metadata on smart contract
    console.log('\n💾 Step 2: Storing message metadata on smart contract');
    const txHash = await service.storeMessageMetadata(messageRecord, testUserAddress);
    console.log(`✅ Message metadata stored! Transaction: ${txHash}`);

    // Step 3: Retrieve message history
    console.log('\n📚 Step 3: Retrieving message history');
    const messageHistory = await service.getMessageHistory(testUserAddress);
    console.log(`✅ Retrieved ${messageHistory.length} messages from history`);

    // Step 4: Get conversation messages
    console.log('\n💬 Step 4: Getting conversation messages');
    const conversationMessages = await service.getConversationMessages(testConversationId);
    console.log(`✅ Retrieved ${conversationMessages.length} messages for conversation`);

    // Step 5: Search by message type
    console.log('\n🔍 Step 5: Searching by message type');
    const textMessages = await service.getUserMessagesByType(testUserAddress, 'text');
    console.log(`✅ Found ${textMessages.length} text messages`);

    console.log('\n🎉 Full messaging flow test completed!');
    console.log('\n📋 Flow Summary:');
    console.log(`   - Message created: ${messageRecord.blobId}`);
    console.log(`   - Metadata stored: ${txHash}`);
    console.log(`   - History retrieved: ${messageHistory.length} messages`);
    console.log(`   - Conversation messages: ${conversationMessages.length} messages`);
    console.log(`   - Text messages found: ${textMessages.length} messages`);

  } catch (error) {
    console.error('❌ Full messaging flow test failed:', error);
    throw error;
  }
}

// Export for use in development
export default testContractIntegration; 