/**
 * Global test functions for browser console debugging
 */

import { SmartContractService } from '../services/smartContractService';
import { DecentralizedMessagingService } from '../services/decentralizedMessagingService';

// Make these functions available globally for browser console debugging
declare global {
  interface Window {
    testMessagePersistence: () => Promise<void>;
    testUserMessages: (userAddress: string) => Promise<void>;
    testConversationMessages: (conversationId: string) => Promise<void>;
    debugUser: (userAddress: string) => Promise<void>;
  }
}

export function setupGlobalTestFunctions() {
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

  // Global test function for message persistence
  window.testMessagePersistence = async () => {
    console.log('🧪 Testing Message Persistence (Browser Console)');
    console.log('===============================================');
    
    const testUserAddress = '0x582be5da7d06b2bf6d89c5b4499491c5990fafe4'; // mathieu
    
    try {
      // Test smart contract messages
      const userMessages = await smartContractService.getMessageHistory(testUserAddress);
      console.log(`📊 Smart Contract Messages: ${userMessages.length}`);
      
      // Test decentralized service messages
      const messageHistory = await decentralizedService.getMessageHistory(testUserAddress);
      console.log(`📨 Decentralized Service Messages: ${messageHistory.length}`);
      
      // Test conversations
      const userConversations = await smartContractService.getUserConversations(testUserAddress);
      console.log(`💬 Conversation IDs: ${userConversations.length}`);
      
      if (userMessages.length > 0) {
        console.log('📝 Sample smart contract message:', userMessages[0]);
      }
      
      if (messageHistory.length > 0) {
        console.log('📝 Sample decentralized message:', messageHistory[0]);
      }
      
      if (userConversations.length > 0) {
        console.log('📋 Conversation IDs:', userConversations);
      }
      
      console.log('\n✅ Test complete!');
    } catch (error) {
      console.error('❌ Test failed:', error);
    }
  };

  // Global test function for specific user
  window.testUserMessages = async (userAddress: string) => {
    console.log(`🔍 Testing messages for user: ${userAddress}`);
    
    try {
      const userMessages = await smartContractService.getMessageHistory(userAddress);
      console.log(`📊 Smart Contract Messages: ${userMessages.length}`);
      
      const messageHistory = await decentralizedService.getMessageHistory(userAddress);
      console.log(`📨 Decentralized Service Messages: ${messageHistory.length}`);
      
      if (userMessages.length > 0) {
        console.log('📝 Smart contract messages:', userMessages);
      }
      
      if (messageHistory.length > 0) {
        console.log('📝 Decentralized messages:', messageHistory);
      }
      
      console.log('\n✅ User test complete!');
    } catch (error) {
      console.error('❌ User test failed:', error);
    }
  };

  // Global test function for conversation messages
  window.testConversationMessages = async (conversationId: string) => {
    console.log(`🔍 Testing messages for conversation: ${conversationId}`);
    
    try {
      const conversationMessages = await smartContractService.getConversationMessages(conversationId);
      console.log(`📊 Smart Contract Conversation Messages: ${conversationMessages.length}`);
      
      const decentralizedMessages = await decentralizedService.getConversationMessages(conversationId);
      console.log(`📨 Decentralized Service Conversation Messages: ${decentralizedMessages.length}`);
      
      if (conversationMessages.length > 0) {
        console.log('📝 Smart contract conversation messages:', conversationMessages);
      }
      
      if (decentralizedMessages.length > 0) {
        console.log('📝 Decentralized conversation messages:', decentralizedMessages);
      }
      
      console.log('\n✅ Conversation test complete!');
    } catch (error) {
      console.error('❌ Conversation test failed:', error);
    }
  };

  // Global debug function for user
  window.debugUser = async (userAddress: string) => {
    console.log(`🔍 Debugging user: ${userAddress}`);
    
    try {
      // Get message count
      const messageCount = await smartContractService.getUserMessageCount(userAddress);
      console.log(`📊 Message count: ${messageCount}`);
      
      // Get user messages
      const userMessages = await smartContractService.getMessageHistory(userAddress);
      console.log(`📨 User messages: ${userMessages.length}`);
      
      // Get user conversations
      const userConversations = await smartContractService.getUserConversations(userAddress);
      console.log(`💬 User conversations: ${userConversations.length}`);
      
      // Get decentralized messages
      const messageHistory = await decentralizedService.getMessageHistory(userAddress);
      console.log(`📨 Decentralized messages: ${messageHistory.length}`);
      
      console.log('\n📋 Summary:');
      console.log(`- Smart Contract Messages: ${userMessages.length}`);
      console.log(`- Decentralized Messages: ${messageHistory.length}`);
      console.log(`- Conversation IDs: ${userConversations.length}`);
      
      if (userMessages.length > 0 && messageHistory.length === 0) {
        console.log('\n⚠️ ISSUE: Messages in smart contract but not in decentralized service');
      } else if (userMessages.length === 0 && messageHistory.length > 0) {
        console.log('\n⚠️ ISSUE: Messages in decentralized service but not in smart contract');
      } else if (userMessages.length > 0 && messageHistory.length > 0) {
        console.log('\n✅ Messages appear to be working correctly');
      } else {
        console.log('\nℹ️ No messages found');
      }
      
      console.log('\n✅ Debug complete!');
    } catch (error) {
      console.error('❌ Debug failed:', error);
    }
  };

  console.log('🔧 Global test functions setup complete!');
  console.log('Available functions:');
  console.log('- testMessagePersistence()');
  console.log('- testUserMessages(userAddress)');
  console.log('- testConversationMessages(conversationId)');
  console.log('- debugUser(userAddress)');
}

// Export for use in main app
export default {
  setupGlobalTestFunctions
}; 