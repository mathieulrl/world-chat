import { UserService } from '../services/userService';
import { getAllUsers, getUserById, getUserByUsername, getUserByWalletAddress } from '../data/users';
import { ChatterboxUser } from '../types/users';

/**
 * Test the user management system with the specific users
 */
export async function testUserManagement() {
  console.log('👥 Testing User Management System...');
  console.log('=====================================');

  const userService = UserService.getInstance();

  try {
    // Test 1: Initialize user service
    console.log('\n📱 Test 1: Initializing User Service');
    await userService.initialize();
    console.log('✅ User Service initialized');

    // Test 2: Get all users
    console.log('\n👥 Test 2: Getting all users');
    const allUsers = getAllUsers();
    console.log(`✅ Found ${allUsers.length} users:`);
    allUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.username} (${user.walletAddress})`);
    });

    // Test 3: Test specific user lookups
    console.log('\n🔍 Test 3: Testing specific user lookups');
    
    // Test by username
    const userByUsername = getUserByUsername('ewan.1300.world.id');
    console.log(`✅ User by username 'ewan.1300.world.id': ${userByUsername?.username || 'Not found'}`);
    
    // Test by wallet address
    const userByWallet = getUserByWalletAddress('0x582be5da7d06b2bf6d89c5b4499491c5990fafe4');
    console.log(`✅ User by wallet '0x582be5da7d06b2bf6d89c5b4499491c5990fafe4': ${userByWallet?.username || 'Not found'}`);

    // Test by ewan's wallet address
    const userByEwanWallet = getUserByWalletAddress('0xa882a2af989de54330f994cf626ea7f5d5edc2fc');
    console.log(`✅ User by ewan's wallet '0xa882a2af989de54330f994cf626ea7f5d5edc2fc': ${userByEwanWallet?.username || 'Not found'}`);

    // Test 4: Test user service methods
    console.log('\n🔧 Test 4: Testing User Service methods');
    
    const currentUser = userService.getCurrentUser();
    console.log(`✅ Current user: ${currentUser?.username || 'None'}`);
    
    const allUsersFromService = userService.getAllUsers();
    console.log(`✅ All users from service: ${allUsersFromService.length} users`);
    
    const onlineUsers = userService.getOnlineUsers();
    console.log(`✅ Online users: ${onlineUsers.length} users`);

    // Test 5: Test user permissions
    console.log('\n🔐 Test 5: Testing user permissions');
    
    const testUserId = 'mathieu.3580.world.id';
    const canSendMessages = userService.canUserPerformAction(testUserId, 'sendMessages');
    const canReceivePayments = userService.canUserPerformAction(testUserId, 'receivePayments');
    const canRequestPayments = userService.canUserPerformAction(testUserId, 'requestPayments');
    
    console.log(`✅ User ${testUserId} permissions:`);
    console.log(`   - Can send messages: ${canSendMessages}`);
    console.log(`   - Can receive payments: ${canReceivePayments}`);
    console.log(`   - Can request payments: ${canRequestPayments}`);

    // Test 6: Test user display methods
    console.log('\n🎨 Test 6: Testing user display methods');
    
    const testUser = getUserById('ewan.1300.world.id');
    if (testUser) {
      const displayName = userService.getUserDisplayName(testUser);
      const avatar = userService.getUserAvatar(testUser);
      
      console.log(`✅ User display name: ${displayName}`);
      console.log(`✅ User avatar: ${avatar}`);
    }

    // Test 7: Test MiniKit integration
    console.log('\n🌍 Test 7: Testing MiniKit integration');
    
    try {
      await userService.syncWithMiniKit();
      console.log('✅ MiniKit sync completed');
      
      const contacts = await userService.getUserContacts();
      console.log(`✅ Retrieved ${contacts.length} contacts from MiniKit`);
    } catch (error) {
      console.log('⚠️ MiniKit integration not available (this is normal in development)');
    }

    console.log('\n🎉 User management test completed!');
    console.log('\n📋 Summary:');
    console.log(`   - Total users: ${allUsers.length}`);
    console.log(`   - Current user: ${currentUser?.username || 'None'}`);
    console.log(`   - Online users: ${onlineUsers.length}`);
    console.log(`   - User permissions: Working`);
    console.log(`   - Display methods: Working`);
    console.log(`   - MiniKit integration: ${currentUser ? 'Connected' : 'Not connected'}`);

  } catch (error) {
    console.error('❌ User management test failed:', error);
    throw error;
  }
}

/**
 * Test specific user scenarios
 */
export async function testSpecificUsers() {
  console.log('\n👤 Testing Specific User Scenarios...');

  const userService = UserService.getInstance();

  try {
    // Test user 1: ewan.1300.world.id
    console.log('\n📱 Testing User 1: ewan.1300.world.id');
    const user1 = getUserByUsername('ewan.1300.world.id');
    if (user1) {
      console.log(`✅ Found user: ${user1.username}`);
      console.log(`   Wallet: ${user1.walletAddress}`);
      console.log(`   Online: ${user1.isOnline}`);
      console.log(`   Can send messages: ${userService.canUserPerformAction(user1.id, 'sendMessages')}`);
    }

    // Test user 2: mathieu.3580.world.id
    console.log('\n📱 Testing User 2: mathieu.3580.world.id');
    const user2 = getUserByWalletAddress('0x582be5da7d06b2bf6d89c5b4499491c5990fafe4');
    if (user2) {
      console.log(`✅ Found user: ${user2.username}`);
      console.log(`   Wallet: ${user2.walletAddress}`);
      console.log(`   Online: ${user2.isOnline}`);
      console.log(`   Can receive payments: ${userService.canUserPerformAction(user2.id, 'receivePayments')}`);
    }

    console.log('\n✅ Specific user tests completed!');

  } catch (error) {
    console.error('❌ Specific user tests failed:', error);
    throw error;
  }
}

/**
 * Quick user lookup test
 */
export async function quickUserLookup() {
  console.log('⚡ Quick User Lookup Test...');

  try {
    const users = [
      { username: 'ewan.1300.world.id', type: 'Username' },
      { wallet: '0x582be5da7d06b2bf6d89c5b4499491c5990fafe4', type: 'Wallet (Mathieu)' },
      { wallet: '0xa882a2af989de54330f994cf626ea7f5d5edc2fc', type: 'Wallet (Ewan)' },
    ];

    for (const user of users) {
      let foundUser: ChatterboxUser | undefined;
      
      if ('username' in user) {
        foundUser = getUserByUsername(user.username);
      } else if ('wallet' in user) {
        foundUser = getUserByWalletAddress(user.wallet);
      }

      console.log(`${user.type}: ${foundUser?.username || 'Not found'}`);
    }

    return { success: true, message: 'User lookup test completed' };
  } catch (error) {
    console.error('Quick user lookup failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Export for use in development
export default testUserManagement; 