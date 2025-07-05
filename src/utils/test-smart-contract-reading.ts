/**
 * Test smart contract reading functionality
 */

import { SmartContractService } from '../services/smartContractService';

export async function testSmartContractReading() {
  console.log('🧪 Testing Smart Contract Reading');
  console.log('==================================');
  
  // Initialize service
  const smartContractService = new SmartContractService({
    contractAddress: '0x063816286ae3312e759f80Afdb10C8879b30688D',
    network: 'testnet',
    rpcUrl: 'https://worldchain-sepolia.drpc.org',
  });
  
  const testUserAddress = '0x582be5da7d06b2bf6d89c5b4499491c5990fafe4';
  
  console.log(`\n🔍 Testing smart contract reading for user: ${testUserAddress}`);
  console.log(`📋 Contract Address: ${smartContractService.getContractAddress()}`);
  
  try {
    // Step 1: Test contract connection
    console.log('\n📊 Step 1: Testing contract connection...');
    const connectionTest = await smartContractService.testContractConnection();
    console.log(`✅ Contract connection: ${connectionTest ? 'SUCCESS' : 'FAILED'}`);
    
    if (!connectionTest) {
      console.log('❌ Contract connection failed - cannot proceed with reading tests');
      return;
    }
    
    // Step 2: Test getUserMessageCount
    console.log('\n📊 Step 2: Testing getUserMessageCount...');
    try {
      const messageCount = await smartContractService.getUserMessageCount(testUserAddress);
      console.log(`✅ getUserMessageCount: ${messageCount} messages`);
    } catch (error) {
      console.log(`❌ getUserMessageCount failed: ${error.message}`);
    }
    
    // Step 3: Test getUserMessages
    console.log('\n📨 Step 3: Testing getUserMessages...');
    try {
      const userMessages = await smartContractService.getMessageHistory(testUserAddress);
      console.log(`✅ getUserMessages: ${userMessages.length} messages`);
      
      if (userMessages.length > 0) {
        console.log('📝 Sample message record:', {
          blobId: userMessages[0].blobId,
          conversationId: userMessages[0].conversationId,
          senderId: userMessages[0].senderId,
          messageType: userMessages[0].messageType,
          timestamp: userMessages[0].timestamp,
        });
      }
    } catch (error) {
      console.log(`❌ getUserMessages failed: ${error.message}`);
      
      // Try to get more details about the error
      if (error.message) {
        console.log(`🔍 Error details: ${error.message}`);
        
        if (error.message.includes('returned no data')) {
          console.log('ℹ️ This might be normal for an empty contract');
        } else if (error.message.includes('execution reverted')) {
          console.log('⚠️ Contract execution reverted - check contract state');
        } else if (error.message.includes('network')) {
          console.log('⚠️ Network connectivity issue');
        }
      }
    }
    
    // Step 4: Test getUserConversations
    console.log('\n💬 Step 4: Testing getUserConversations...');
    try {
      const userConversations = await smartContractService.getUserConversations(testUserAddress);
      console.log(`✅ getUserConversations: ${userConversations.length} conversations`);
      
      if (userConversations.length > 0) {
        console.log('📋 Conversation IDs:', userConversations);
      }
    } catch (error) {
      console.log(`❌ getUserConversations failed: ${error.message}`);
    }
    
    // Step 5: Test with a different user address
    console.log('\n👤 Step 5: Testing with different user address...');
    const testUser2 = '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'; // alice
    
    try {
      const userMessages2 = await smartContractService.getMessageHistory(testUser2);
      console.log(`✅ getUserMessages for ${testUser2}: ${userMessages2.length} messages`);
    } catch (error) {
      console.log(`❌ getUserMessages for ${testUser2} failed: ${error.message}`);
    }
    
    // Step 6: Test direct contract call
    console.log('\n🔧 Step 6: Testing direct contract call...');
    try {
      const { publicClient } = smartContractService as any;
      const result = await publicClient.readContract({
        address: smartContractService.getContractAddress() as `0x${string}`,
        abi: smartContractService.getContractAbi(),
        functionName: 'getUserMessages',
        args: [testUserAddress],
      });
      console.log(`✅ Direct contract call successful: ${Array.isArray(result) ? result.length : 'non-array'} result`);
      
      if (Array.isArray(result) && result.length > 0) {
        console.log('📝 Raw contract result sample:', result[0]);
      }
    } catch (error) {
      console.log(`❌ Direct contract call failed: ${error.message}`);
    }
    
    // Step 7: Summary
    console.log('\n🎯 Summary:');
    console.log('===========');
    console.log(`📊 Contract Connection: ${connectionTest ? '✅' : '❌'}`);
    console.log(`📨 getUserMessages: ${connectionTest ? 'Tested' : 'Skipped'}`);
    console.log(`💬 getUserConversations: ${connectionTest ? 'Tested' : 'Skipped'}`);
    
    if (connectionTest) {
      console.log('\n✅ Smart contract reading tests completed');
      console.log('💡 If messages are not loading, the issue might be:');
      console.log('   - No messages stored in contract yet');
      console.log('   - Walrus retrieval failing');
      console.log('   - Contract state issues');
    } else {
      console.log('\n❌ Smart contract reading tests failed');
      console.log('💡 Issues to check:');
      console.log('   - Contract address is correct');
      console.log('   - RPC URL is accessible');
      console.log('   - Contract is deployed and accessible');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
  
  console.log('\n✅ Smart contract reading test complete');
  console.log('========================================');
}

// Make available globally
if (typeof window !== 'undefined') {
  (window as any).testSmartContractReading = testSmartContractReading;
}

export default {
  testSmartContractReading
}; 