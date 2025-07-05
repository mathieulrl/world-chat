/**
 * Global test functions for browser console debugging
 */

import { SmartContractService } from '../services/smartContractService';
import { DecentralizedMessagingService } from '../services/decentralizedMessagingService';
import { testSmartContractReading } from './test-smart-contract-reading';
import { testContractAccessibility } from './test-contract-accessibility';
import { runAllTests } from './run-tests';
import { testMiniKitTransaction } from './test-minikit-transaction';
import { debugMiniKitApproval } from './debug-minikit-approval';
import { verifyTransactionHash } from './verify-transaction-hash';
import { debugPaymentAmount } from './debug-payment-amount';
import { testPaymentFlow } from './test-payment-flow';
import { testUIPayment } from './test-ui-payment';
import { debugMiniKitInputError } from './debug-minikit-input-error';
import { testReferenceFormat } from './test-reference-format';

// Make these functions available globally for browser console debugging
declare global {
  interface Window {
    testMessagePersistence: () => Promise<void>;
    testUserMessages: (userAddress: string) => Promise<void>;
    testConversationMessages: (conversationId: string) => Promise<void>;
    debugUser: (userAddress: string) => Promise<void>;
    quickDebug: () => Promise<void>;
    testMessageLoading: () => Promise<void>;
    testSmartContractReading: () => Promise<void>;
    testContractAccessibility: () => Promise<void>;
    runAllTests: () => Promise<any>;
    testMiniKitTransaction: () => Promise<void>;
    debugMiniKitApproval: () => Promise<void>;
    verifyTransactionHash: (hash: string) => Promise<void>;
    debugPaymentAmount: (amount: string) => Promise<void>;
    testPaymentFlow: () => Promise<void>;
    testUIPayment: () => Promise<void>;
    debugMiniKitInputError: (error: string) => Promise<void>;
    testReferenceFormat: () => Promise<void>;
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

  // Global quick debug function
  window.quickDebug = async () => {
    console.log('🔍 Quick Debug - Message History Refresh Issue');
    console.log('==============================================');
    
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
          const retrievedMessage = await decentralizedService.retrieveMessage(firstMessage.blobId);
          console.log('✅ Successfully retrieved message from Walrus:', {
            id: retrievedMessage.id,
            content: retrievedMessage.content.substring(0, 50) + '...',
            conversationId: retrievedMessage.conversationId,
            messageType: retrievedMessage.messageType,
            timestamp: retrievedMessage.timestamp,
          });
        } catch (error) {
          console.log(`❌ Failed to retrieve message from Walrus: ${error.message}`);
        }
      } else {
        console.log('ℹ️ No messages found in smart contract');
      }
      
      // Step 3: Check conversation IDs
      console.log('\n💬 Step 3: Checking conversation IDs...');
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
  };

  // Global test function for message loading
  window.testMessageLoading = async () => {
    console.log('🧪 Testing Message Loading');
    console.log('===========================');
    
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
            const retrievedMessage = await decentralizedService.retrieveMessage(record.blobId);
            console.log(`  ✅ Successfully retrieved message ${i + 1}:`, {
              id: retrievedMessage.id,
              content: retrievedMessage.content.substring(0, 50) + '...',
              conversationId: retrievedMessage.conversationId,
              messageType: retrievedMessage.messageType,
              timestamp: retrievedMessage.timestamp,
            });
          } catch (error) {
            console.log(`  ❌ Failed to retrieve message ${i + 1}: ${error.message}`);
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
      
      // Step 4: Summary
      console.log('\n🎯 Summary:');
      console.log('===========');
      console.log(`📊 Smart Contract Records: ${messageRecords.length}`);
      console.log(`📨 Decentralized Messages: ${messageRecords.length > 0 ? 'Testing...' : 'N/A'}`);
      
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
  };

  // Global test function for smart contract reading
  window.testSmartContractReading = testSmartContractReading;

  // Global test function for contract accessibility
  window.testContractAccessibility = testContractAccessibility;

  // Global test function to run all tests
  window.runAllTests = runAllTests;

  // Global test function for MiniKit transaction
  window.testMiniKitTransaction = testMiniKitTransaction;

  // Global debug function for MiniKit approval issue
  window.debugMiniKitApproval = debugMiniKitApproval;

  // Global function to verify transaction hash
  window.verifyTransactionHash = verifyTransactionHash;

  // Global function to debug payment amount
  window.debugPaymentAmount = debugPaymentAmount;

  // Global test function for payment flow
  window.testPaymentFlow = testPaymentFlow;

  // Global test function for UI payment
  window.testUIPayment = testUIPayment;

  // Global debug function for MiniKit input error
  window.debugMiniKitInputError = debugMiniKitInputError;

  // Global test function for reference format
  window.testReferenceFormat = testReferenceFormat;

  console.log('🔧 Global test functions setup complete!');
  console.log('Available functions:');
  console.log('- testMessagePersistence()');
  console.log('- testUserMessages(userAddress)');
  console.log('- testConversationMessages(conversationId)');
  console.log('- debugUser(userAddress)');
  console.log('- quickDebug()');
  console.log('- testMessageLoading()');
  console.log('- testSmartContractReading()');
  console.log('- testContractAccessibility()');
  console.log('- runAllTests() - Run all diagnostic tests');
  console.log('- testMiniKitTransaction() - Test MiniKit transaction sending');
  console.log('- debugMiniKitApproval() - Debug MiniKit approval issue');
  console.log('- verifyTransactionHash(hash) - Verify transaction hash status');
  console.log('- debugPaymentAmount(amount) - Debug payment amount');
  console.log('- testPaymentFlow() - Test payment flow');
  console.log('- testUIPayment() - Test UI payment');
  console.log('- debugMiniKitInputError(error) - Debug MiniKit input error');
  console.log('- testReferenceFormat() - Test reference format');
}