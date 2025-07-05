import { WorldcoinService } from '../services/worldcoinService';
import { messagingContractAbi } from '../abis/messagingContractAbi';

/**
 * Test the real Worldcoin MiniKit integration
 * This verifies that the MiniKit is properly connected and working
 */
export async function testRealMiniKit() {
  console.log('🌍 Testing Real Worldcoin MiniKit Integration...');
  console.log('===============================================');

  const worldcoinService = WorldcoinService.getInstance();

  try {
    // Test 1: Initialize MiniKit
    console.log('\n📱 Test 1: Initializing MiniKit');
    const isInitialized = await worldcoinService.initializeMiniKit();
    console.log(`✅ MiniKit initialized: ${isInitialized ? 'YES' : 'NO'}`);

    // Test 2: Check if installed
    console.log('\n📱 Test 2: Checking MiniKit installation');
    const isInstalled = await worldcoinService.isInstalled();
    console.log(`✅ MiniKit installed: ${isInstalled ? 'YES' : 'NO'}`);

    // Test 3: Get current user
    console.log('\n👤 Test 3: Getting current user');
    const currentUser = await worldcoinService.getCurrentUser();
    if (currentUser) {
      console.log(`✅ Current user: ${currentUser.username} (${currentUser.address})`);
    } else {
      console.log('⚠️ No user connected to MiniKit');
    }

    // Test 4: Get contacts
    console.log('\n👥 Test 4: Getting contacts');
    const contacts = await worldcoinService.getContacts();
    console.log(`✅ Retrieved ${contacts.length} contacts`);

    // Test 5: Test gas estimation
    console.log('\n⛽ Test 5: Testing gas estimation');
    const estimatedGas = await worldcoinService.estimateGas(
      '0xA27F6614c53ce3c4E7ac92A64d03bA1853e3c304',
      [],
      'storeMessage',
      ['test_blob', 'test_conv', 'text', '', '']
    );
    console.log(`✅ Estimated gas: ${estimatedGas.toString()}`);

    // Test 6: Store message metadata
    console.log('\n📄 Test 6: Storing message metadata');
    const testUserAddress = currentUser?.address || '0x1234567890123456789012345678901234567890';
    const result = await worldcoinService.storeMessageMetadata(
      '0xA27F6614c53ce3c4E7ac92A64d03bA1853e3c304',
      messagingContractAbi,
      {
        blobId: 'test_blob_id',
        conversationId: 'test_conversation',
        messageType: 'text',
        suiObjectId: '',
        txDigest: '',
      },
      testUserAddress
    );
    console.log(`✅ Message metadata stored: ${result.success ? 'SUCCESS' : 'FAILURE'}`);

    console.log('\n🎉 Real MiniKit integration test completed!');
    console.log('\n📋 Summary:');
    console.log(`   - MiniKit initialized: ${isInitialized ? '✅ Yes' : '❌ No'}`);
    console.log(`   - MiniKit installed: ${isInstalled ? '✅ Yes' : '❌ No'}`);
    console.log(`   - Current user: ${currentUser ? '✅ Connected' : '⚠️ Not connected'}`);
    console.log(`   - Contacts: ${contacts.length} contacts`);
    console.log(`   - Gas estimation: ${estimatedGas.toString()} gas`);

    if (!isInstalled) {
      console.log('\n⚠️ MiniKit is not installed. Please install the World App to test full functionality.');
    }

  } catch (error) {
    console.error('❌ Real MiniKit integration test failed:', error);
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Make sure the World App is installed on your device');
    console.log('   2. Check if you have the correct app ID configured');
    console.log('   3. Ensure you are running this in the World App environment');
    console.log('   4. Verify your internet connection');
    throw error;
  }
}

/**
 * Quick test for MiniKit availability
 */
export async function quickMiniKitTest() {
  console.log('⚡ Quick MiniKit Test...');

  const worldcoinService = WorldcoinService.getInstance();

  try {
    const isInstalled = await worldcoinService.isInstalled();
    const currentUser = await worldcoinService.getCurrentUser();

    console.log(`MiniKit installed: ${isInstalled ? '✅ Yes' : '❌ No'}`);
    console.log(`User connected: ${currentUser ? '✅ Yes' : '❌ No'}`);

    if (currentUser) {
      console.log(`User: ${currentUser.username} (${currentUser.address})`);
    }

    return {
      isInstalled,
      hasUser: !!currentUser,
      user: currentUser,
    };
  } catch (error) {
    console.error('Quick test failed:', error);
    return {
      isInstalled: false,
      hasUser: false,
      user: null,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Export for use in development
export default testRealMiniKit; 