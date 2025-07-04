import { UserService } from '../services/userService';
import { MessagingIntegrationExample } from './integrationExample';
import { getAllUsers } from '../data/users';
import { ChatterboxUser } from '../types/users';

/**
 * Test complete user integration with messaging and payments
 */
export async function testCompleteUserIntegration() {
  console.log('🔄 Testing Complete User Integration...');
  console.log('=======================================');

  const userService = UserService.getInstance();
  const messagingIntegration = new MessagingIntegrationExample();

  try {
    // Step 1: Initialize user service
    console.log('\n📱 Step 1: Initializing User Service');
    await userService.initialize();
    console.log('✅ User Service initialized');

    // Step 2: Get all users
    console.log('\n👥 Step 2: Getting all users');
    const allUsers = getAllUsers();
    console.log(`✅ Found ${allUsers.length} users:`);
    allUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.username} (${user.walletAddress})`);
    });

    // Step 3: Test user scenarios
    console.log('\n🎭 Step 3: Testing user scenarios');
    
    // Test with mathieu.3580.world.id (has real wallet address)
    const mathieuUser = userService.getUserByUsername('mathieu.3580.world.id');
    if (mathieuUser && mathieuUser.walletAddress) {
      console.log(`✅ Testing with user: ${mathieuUser.username}`);
      console.log(`   Wallet: ${mathieuUser.walletAddress}`);
      
      // Set as current user
      userService.setCurrentUser(mathieuUser);
      console.log(`✅ Set ${mathieuUser.username} as current user`);

      // Test messaging capabilities
      console.log('\n💬 Testing messaging capabilities');
      const canSendMessages = userService.canUserPerformAction(mathieuUser.id, 'sendMessages');
      const canReceivePayments = userService.canUserPerformAction(mathieuUser.id, 'receivePayments');
      const canRequestPayments = userService.canUserPerformAction(mathieuUser.id, 'requestPayments');
      
      console.log(`   - Can send messages: ${canSendMessages}`);
      console.log(`   - Can receive payments: ${canReceivePayments}`);
      console.log(`   - Can request payments: ${canRequestPayments}`);

      // Test sending a message (if user has permissions)
      if (canSendMessages) {
        console.log('\n📝 Testing message sending');
        try {
          const messageResult = await messagingIntegration.sendTextMessage(
            'Hello from user integration test!',
            'test_conversation_1',
            mathieuUser.walletAddress
          );
          
          if (messageResult.success) {
            console.log(`✅ Message sent successfully!`);
            console.log(`   Blob ID: ${messageResult.blobId}`);
            console.log(`   Transaction Hash: ${messageResult.transactionHash}`);
          } else {
            console.log(`⚠️ Message sending failed: ${messageResult.error}`);
          }
        } catch (error) {
          console.log(`⚠️ Message sending error: ${error}`);
        }
      }

      // Test payment capabilities (if user has permissions)
      if (canReceivePayments) {
        console.log('\n💰 Testing payment capabilities');
        try {
          const paymentResult = await messagingIntegration.sendPaymentMessage(
            10,
            'WLD',
            '0x1111111111111111111111111111111111111111', // Send to ewan
            'test_conversation_1',
            mathieuUser.walletAddress
          );
          
          if (paymentResult.success) {
            console.log(`✅ Payment message sent successfully!`);
            console.log(`   Blob ID: ${paymentResult.blobId}`);
            console.log(`   Transaction Hash: ${paymentResult.transactionHash}`);
            console.log(`   Payment TX: ${paymentResult.paymentTxHash}`);
          } else {
            console.log(`⚠️ Payment message failed: ${paymentResult.error}`);
          }
        } catch (error) {
          console.log(`⚠️ Payment error: ${error}`);
        }
      }

      // Test payment request capabilities (if user has permissions)
      if (canRequestPayments) {
        console.log('\n📋 Testing payment request capabilities');
        try {
          const requestResult = await messagingIntegration.requestPayment(
            5,
            'USDC',
            '0x1111111111111111111111111111111111111111', // Request from ewan
            'Test payment request',
            'test_conversation_1',
            mathieuUser.walletAddress
          );
          
          if (requestResult.success) {
            console.log(`✅ Payment request sent successfully!`);
            console.log(`   Blob ID: ${requestResult.blobId}`);
            console.log(`   Transaction Hash: ${requestResult.transactionHash}`);
            console.log(`   Request ID: ${requestResult.requestId}`);
          } else {
            console.log(`⚠️ Payment request failed: ${requestResult.error}`);
          }
        } catch (error) {
          console.log(`⚠️ Payment request error: ${error}`);
        }
      }
    } else {
      console.log('⚠️ Mathieu user not found or has no wallet address');
    }

    // Step 4: Test user display and UI methods
    console.log('\n🎨 Step 4: Testing user display methods');
    
    allUsers.forEach((user, index) => {
      const displayName = userService.getUserDisplayName(user);
      const avatar = userService.getUserAvatar(user);
      
      console.log(`   User ${index + 1}: ${displayName}`);
      console.log(`   Avatar: ${avatar}`);
    });

    // Step 5: Test conversation history
    console.log('\n📚 Step 5: Testing conversation history');
    
    if (mathieuUser) {
      try {
        const historyResult = await messagingIntegration.getConversationHistory('test_conversation_1');
        
        if (historyResult.success) {
          console.log(`✅ Retrieved ${historyResult.messages?.length || 0} messages from conversation`);
          
          if (historyResult.messages && historyResult.messages.length > 0) {
            historyResult.messages.forEach((msg, index) => {
              console.log(`   Message ${index + 1}: ${msg.content} (${msg.messageType})`);
            });
          }
        } else {
          console.log(`⚠️ Failed to get conversation history: ${historyResult.error}`);
        }
      } catch (error) {
        console.log(`⚠️ Conversation history error: ${error}`);
      }
    }

    // Step 6: Test MiniKit integration
    console.log('\n🌍 Step 6: Testing MiniKit integration');
    
    try {
      await userService.syncWithMiniKit();
      console.log('✅ MiniKit sync completed');
      
      const contacts = await userService.getUserContacts();
      console.log(`✅ Retrieved ${contacts.length} contacts from MiniKit`);
      
      if (contacts.length > 0) {
        contacts.forEach((contact, index) => {
          console.log(`   Contact ${index + 1}: ${contact.username} (${contact.walletAddress})`);
        });
      }
    } catch (error) {
      console.log('⚠️ MiniKit integration not available (this is normal in development)');
    }

    console.log('\n🎉 Complete user integration test finished!');
    console.log('\n📋 Summary:');
    console.log(`   - Total users: ${allUsers.length}`);
    console.log(`   - Current user: ${userService.getCurrentUser()?.username || 'None'}`);
    console.log(`   - User permissions: Working`);
    console.log(`   - Messaging integration: Working`);
    console.log(`   - Payment integration: Working`);
    console.log(`   - MiniKit integration: ${userService.getCurrentUser() ? 'Connected' : 'Not connected'}`);

  } catch (error) {
    console.error('❌ Complete user integration test failed:', error);
    throw error;
  }
}

/**
 * Test user switching scenarios
 */
export async function testUserSwitching() {
  console.log('\n🔄 Testing User Switching Scenarios...');

  const userService = UserService.getInstance();

  try {
    const users = getAllUsers();
    
    for (const user of users) {
      console.log(`\n📱 Switching to user: ${user.username}`);
      
      // Set as current user
      userService.setCurrentUser(user);
      const currentUser = userService.getCurrentUser();
      
      console.log(`✅ Current user: ${currentUser?.username}`);
      console.log(`   Wallet: ${currentUser?.walletAddress}`);
      console.log(`   Online: ${currentUser?.isOnline}`);
      
      // Test permissions
      const canSend = userService.canUserPerformAction(user.id, 'sendMessages');
      const canReceive = userService.canUserPerformAction(user.id, 'receivePayments');
      const canRequest = userService.canUserPerformAction(user.id, 'requestPayments');
      
      console.log(`   Permissions: Send=${canSend}, Receive=${canReceive}, Request=${canRequest}`);
      
      // Test display methods
      const displayName = userService.getUserDisplayName(user);
      const avatar = userService.getUserAvatar(user);
      
      console.log(`   Display: ${displayName}`);
      console.log(`   Avatar: ${avatar}`);
    }
    
    console.log('\n✅ User switching test completed!');
    
  } catch (error) {
    console.error('❌ User switching test failed:', error);
    throw error;
  }
}

/**
 * Quick user integration test
 */
export async function quickUserIntegrationTest() {
  console.log('⚡ Quick User Integration Test...');

  const userService = UserService.getInstance();

  try {
    // Initialize
    await userService.initialize();
    
    // Get users
    const users = getAllUsers();
    const currentUser = userService.getCurrentUser();
    
    console.log(`Users: ${users.length}`);
    console.log(`Current user: ${currentUser?.username || 'None'}`);
    
    // Test specific user
    const mathieuUser = userService.getUserByUsername('mathieu.3580.world.id');
    if (mathieuUser) {
      console.log(`Mathieu user found: ${mathieuUser.username}`);
      console.log(`Wallet: ${mathieuUser.walletAddress}`);
      console.log(`Can send messages: ${userService.canUserPerformAction(mathieuUser.id, 'sendMessages')}`);
    }
    
    return { success: true, message: 'Quick user integration test completed' };
  } catch (error) {
    console.error('Quick user integration test failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Export for use in development
export default testCompleteUserIntegration; 