/**
 * Quick debug utility for message history refresh issue
 */

import { SmartContractService } from '../services/smartContractService';
import { WalrusStorageService } from '../services/walrusStorageService';

export async function quickDebug() {
  console.log('🔍 Quick Debug - Message History Refresh Issue');
  console.log('==============================================');
  
  // Initialize services
  const smartContractService = new SmartContractService({
    contractAddress: '0x063816286ae3312e759f80Afdb10C8879b30688D',
    network: 'testnet',
    rpcUrl: 'https://worldchain-sepolia.drpc.org',
  });
  
  const walrusService = new WalrusStorageService({
    aggregatorUrl: 'https://aggregator.walrus-testnet.walrus.space',
    publisherUrl: 'https://publisher.walrus-testnet.walrus.space',
    network: 'testnet',
  });
  
  const testUserAddress = '0x582be5da7d06b2bf6d89c5b4499491c5990fafe4';
  
  console.log(`\n🔍 Testing user: ${testUserAddress}`);
  
  try {
    // Step 1: Check smart contract for messages
    console.log('\n📊 Step 1: Checking smart contract for messages...');
    const userMessages = await smartContractService.getMessageHistory(testUserAddress);
    console.log(`✅ Found ${userMessages.length} messages in smart contract`);
    
    if (userMessages.length > 0) {
      console.log('📝 Sample message from smart contract:', {
        blobId: userMessages[0].blobId,
        conversationId: userMessages[0].conversationId,
        messageType: userMessages[0].messageType,
        timestamp: userMessages[0].timestamp,
      });
      
      // Step 2: Try to retrieve the first message from Walrus
      const firstMessage = userMessages[0];
      console.log(`\n📨 Step 2: Trying to retrieve message from Walrus: ${firstMessage.blobId}`);
      
      try {
        const retrievedMessage = await walrusService.retrieveMessage(firstMessage.blobId);
        console.log('✅ Successfully retrieved message from Walrus:', {
          id: retrievedMessage.id,
          content: retrievedMessage.content.substring(0, 50) + '...',
          conversationId: retrievedMessage.conversationId,
          messageType: retrievedMessage.messageType,
          timestamp: retrievedMessage.timestamp,
        });
      } catch (error) {
        console.log(`❌ Failed to retrieve message from Walrus: ${error.message}`);
        
        // Step 3: Check if blob exists
        console.log(`\n🔍 Step 3: Checking if blob exists: ${firstMessage.blobId}`);
        try {
          const metadata = await walrusService.getBlobMetadata(firstMessage.blobId);
          console.log('✅ Blob metadata found:', metadata);
        } catch (metadataError) {
          console.log(`❌ Blob metadata not found: ${metadataError.message}`);
        }
      }
    } else {
      console.log('ℹ️ No messages found in smart contract');
    }
    
    // Step 4: Check conversation IDs
    console.log('\n💬 Step 4: Checking conversation IDs...');
    const userConversations = await smartContractService.getUserConversations(testUserAddress);
    console.log(`✅ Found ${userConversations.length} conversation IDs`);
    
    if (userConversations.length > 0) {
      console.log('📋 Conversation IDs:', userConversations);
    }
    
  } catch (error) {
    console.error('❌ Quick debug failed:', error);
  }
  
  console.log('\n✅ Quick debug complete');
  console.log('=======================');
}

// Make available globally
if (typeof window !== 'undefined') {
  (window as any).quickDebug = quickDebug;
}

export default {
  quickDebug
}; 