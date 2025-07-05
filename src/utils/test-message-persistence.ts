/**
 * Simple test for message persistence
 */

import { SmartContractService } from '../services/smartContractService';
import { DecentralizedMessagingService } from '../services/decentralizedMessagingService';

export async function testMessagePersistence() {
  console.log('🧪 Testing Message Persistence');
  console.log('===============================');
  
  // Initialize services
  const smartContractService = new SmartContractService({
    contractAddress: '0x063816286ae3312e759f80Afdb10C8879b30688D',
    network: 'testnet',
    rpcUrl: 'https://worldchain-sepolia.drpc.org',
  });
  
  const decentralizedService = new DecentralizedMessagingService({
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
  
  // Test user address
  const testUserAddress = '0x582be5da7d06b2bf6d89c5b4499491c5990fafe4'; // mathieu
  
  console.log(`\n🔍 Testing message persistence for user: ${testUserAddress}`);
  
  try {
    // Test 1: Get user message count
    console.log('\n📊 Step 1: Getting user message count...');
    const messageCount = await smartContractService.getUserMessageCount(testUserAddress);
    console.log(`✅ User message count: ${messageCount}`);
    
    // Test 2: Get user messages from smart contract
    console.log('\n📨 Step 2: Getting user messages from smart contract...');
    const userMessages = await smartContractService.getMessageHistory(testUserAddress);
    console.log(`✅ Found ${userMessages.length} messages in smart contract`);
    
    if (userMessages.length > 0) {
      console.log('📝 Sample message from smart contract:', {
        blobId: userMessages[0].blobId,
        conversationId: userMessages[0].conversationId,
        messageType: userMessages[0].messageType,
        timestamp: userMessages[0].timestamp,
      });
    }
    
    // Test 3: Get message history from decentralized service
    console.log('\n📨 Step 3: Getting message history from decentralized service...');
    const messageHistory = await decentralizedService.getMessageHistory(testUserAddress);
    console.log(`✅ Found ${messageHistory.length} messages from decentralized service`);
    
    if (messageHistory.length > 0) {
      console.log('📝 Sample message from decentralized service:', {
        id: messageHistory[0].id,
        conversationId: messageHistory[0].conversationId,
        content: messageHistory[0].content.substring(0, 50) + '...',
        messageType: messageHistory[0].messageType,
        timestamp: messageHistory[0].timestamp,
      });
    }
    
    // Test 4: Get user conversations
    console.log('\n💬 Step 4: Getting user conversations...');
    const userConversations = await smartContractService.getUserConversations(testUserAddress);
    console.log(`✅ Found ${userConversations.length} conversation IDs`);
    
    if (userConversations.length > 0) {
      console.log('📋 Conversation IDs:', userConversations);
      
      // Test 5: Get messages for first conversation
      const firstConversationId = userConversations[0];
      console.log(`\n📨 Step 5: Getting messages for conversation: ${firstConversationId}`);
      
      try {
        const conversationMessages = await smartContractService.getConversationMessages(firstConversationId);
        console.log(`✅ Found ${conversationMessages.length} messages for conversation`);
        
        if (conversationMessages.length > 0) {
          console.log('📝 Sample conversation message:', {
            blobId: conversationMessages[0].blobId,
            conversationId: conversationMessages[0].conversationId,
            messageType: conversationMessages[0].messageType,
            timestamp: conversationMessages[0].timestamp,
          });
        }
      } catch (error) {
        console.log(`❌ Failed to get conversation messages: ${error.message}`);
      }
    }
    
    // Test 6: Test decentralized service conversation messages
    if (userConversations.length > 0) {
      const firstConversationId = userConversations[0];
      console.log(`\n📨 Step 6: Getting conversation messages from decentralized service: ${firstConversationId}`);
      
      try {
        const conversationMessages = await decentralizedService.getConversationMessages(firstConversationId);
        console.log(`✅ Found ${conversationMessages.length} messages from decentralized service`);
        
        if (conversationMessages.length > 0) {
          console.log('📝 Sample conversation message from decentralized service:', {
            id: conversationMessages[0].id,
            conversationId: conversationMessages[0].conversationId,
            content: conversationMessages[0].content.substring(0, 50) + '...',
            messageType: conversationMessages[0].messageType,
            timestamp: conversationMessages[0].timestamp,
          });
        }
      } catch (error) {
        console.log(`❌ Failed to get conversation messages from decentralized service: ${error.message}`);
      }
    }
    
    console.log('\n🎯 Summary:');
    console.log('===========');
    console.log(`📊 Smart Contract Messages: ${userMessages.length}`);
    console.log(`📨 Decentralized Service Messages: ${messageHistory.length}`);
    console.log(`💬 Conversation IDs: ${userConversations.length}`);
    
    if (userMessages.length > 0 && messageHistory.length === 0) {
      console.log('\n⚠️ ISSUE DETECTED:');
      console.log('Messages exist in smart contract but not retrievable from decentralized service');
      console.log('This suggests a Walrus retrieval issue');
    } else if (userMessages.length === 0 && messageHistory.length > 0) {
      console.log('\n⚠️ ISSUE DETECTED:');
      console.log('Messages exist in decentralized service but not in smart contract');
      console.log('This suggests a smart contract storage issue');
    } else if (userMessages.length === 0 && messageHistory.length === 0) {
      console.log('\nℹ️ No messages found - this is normal for a new user');
    } else {
      console.log('\n✅ Message persistence appears to be working correctly');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
  
  console.log('\n✅ Message Persistence Test Complete');
  console.log('=====================================');
}

// Export for use in other files
export default {
  testMessagePersistence
}; 