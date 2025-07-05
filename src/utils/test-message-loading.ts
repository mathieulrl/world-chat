/**
 * Test message loading to debug the issue
 */

import { SmartContractService } from '../services/smartContractService';
import { DecentralizedMessagingService } from '../services/decentralizedMessagingService';
import { WalrusStorageService } from '../services/walrusStorageService';

export async function testMessageLoading() {
  console.log('🧪 Testing Message Loading');
  console.log('===========================');
  
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
  
  const walrusService = new WalrusStorageService({
    aggregatorUrl: 'https://aggregator.walrus-testnet.walrus.space',
    publisherUrl: 'https://publisher.walrus-testnet.walrus.space',
    network: 'testnet',
  });
  
  const testUserAddress = '0x582be5da7d06b2bf6d89c5b4499491c5990fafe4';
  
  console.log(`\n🔍 Testing message loading for user: ${testUserAddress}`);
  
  try {
    // Step 1: Check smart contract for message records
    console.log('\n📊 Step 1: Checking smart contract for message records...');
    const messageRecords = await smartContractService.getMessageHistory(testUserAddress);
    console.log(`✅ Found ${messageRecords.length} message records in smart contract`);
    
    if (messageRecords.length > 0) {
      console.log('📝 Sample message record:', {
        blobId: messageRecords[0].blobId,
        conversationId: messageRecords[0].conversationId,
        messageType: messageRecords[0].messageType,
        timestamp: messageRecords[0].timestamp,
      });
      
      // Step 2: Try to retrieve each message from Walrus
      console.log('\n📨 Step 2: Testing Walrus retrieval for each message...');
      for (let i = 0; i < Math.min(messageRecords.length, 3); i++) {
        const record = messageRecords[i];
        console.log(`\n  Testing message ${i + 1}: ${record.blobId}`);
        
        try {
          const retrievedMessage = await walrusService.retrieveMessage(record.blobId);
          console.log(`  ✅ Successfully retrieved message ${i + 1}:`, {
            id: retrievedMessage.id,
            content: retrievedMessage.content.substring(0, 50) + '...',
            conversationId: retrievedMessage.conversationId,
            messageType: retrievedMessage.messageType,
            timestamp: retrievedMessage.timestamp,
          });
        } catch (error) {
          console.log(`  ❌ Failed to retrieve message ${i + 1}: ${error.message}`);
          
          // Check if blob exists
          try {
            const metadata = await walrusService.getBlobMetadata(record.blobId);
            console.log(`  📋 Blob metadata found:`, metadata);
          } catch (metadataError) {
            console.log(`  ❌ Blob metadata not found: ${metadataError.message}`);
          }
        }
      }
    }
    
    // Step 3: Test decentralized service message history
    console.log('\n📨 Step 3: Testing decentralized service message history...');
    try {
      const messageHistory = await decentralizedService.getMessageHistory(testUserAddress);
      console.log(`✅ Decentralized service returned ${messageHistory.length} messages`);
      
      if (messageHistory.length > 0) {
        console.log('📝 Sample message from decentralized service:', {
          id: messageHistory[0].id,
          content: messageHistory[0].content.substring(0, 50) + '...',
          conversationId: messageHistory[0].conversationId,
          messageType: messageHistory[0].messageType,
          timestamp: messageHistory[0].timestamp,
        });
      }
    } catch (error) {
      console.log(`❌ Decentralized service failed: ${error.message}`);
    }
    
    // Step 4: Test conversation messages
    console.log('\n💬 Step 4: Testing conversation messages...');
    const userConversations = await smartContractService.getUserConversations(testUserAddress);
    console.log(`✅ Found ${userConversations.length} conversation IDs`);
    
    if (userConversations.length > 0) {
      const firstConversationId = userConversations[0];
      console.log(`\n  Testing conversation: ${firstConversationId}`);
      
      try {
        const conversationMessages = await decentralizedService.getConversationMessages(firstConversationId);
        console.log(`  ✅ Found ${conversationMessages.length} messages for conversation`);
        
        if (conversationMessages.length > 0) {
          console.log('  📝 Sample conversation message:', {
            id: conversationMessages[0].id,
            content: conversationMessages[0].content.substring(0, 50) + '...',
            conversationId: conversationMessages[0].conversationId,
            messageType: conversationMessages[0].messageType,
            timestamp: conversationMessages[0].timestamp,
          });
        }
      } catch (error) {
        console.log(`  ❌ Failed to get conversation messages: ${error.message}`);
      }
    }
    
    // Step 5: Summary and recommendations
    console.log('\n🎯 Summary:');
    console.log('===========');
    console.log(`📊 Smart Contract Records: ${messageRecords.length}`);
    console.log(`📨 Decentralized Messages: ${messageRecords.length > 0 ? 'Testing...' : 'N/A'}`);
    console.log(`💬 Conversation IDs: ${userConversations.length}`);
    
    if (messageRecords.length > 0) {
      console.log('\n✅ Messages are stored in smart contract');
      console.log('⚠️ Issue might be with Walrus retrieval');
      console.log('💡 Recommendation: Check Walrus network connectivity');
    } else {
      console.log('\nℹ️ No messages found in smart contract');
      console.log('💡 Recommendation: Send a test message first');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
  
  console.log('\n✅ Message loading test complete');
  console.log('=================================');
}

// Make available globally
if (typeof window !== 'undefined') {
  (window as any).testMessageLoading = testMessageLoading;
}

export default {
  testMessageLoading
}; 