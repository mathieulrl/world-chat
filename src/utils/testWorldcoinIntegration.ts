import { testWorldcoinContractWriting } from './testContractIntegration';
import MessagingIntegrationExample from './integrationExample';

/**
 * Simple test script to demonstrate Worldcoin MiniKit contract writing
 * Run this in your browser console or as a test file
 */
export async function testWorldcoinIntegration() {
  console.log('🌍 Testing Worldcoin MiniKit Integration...');
  console.log('===========================================');

  try {
    // Test 1: Worldcoin MiniKit contract writing
    console.log('\n📝 Test 1: Worldcoin MiniKit Contract Writing');
    await testWorldcoinContractWriting();

    // Test 2: Complete messaging integration
    console.log('\n📝 Test 2: Complete Messaging Integration');
    const integration = new MessagingIntegrationExample();
    await integration.testCompleteIntegration();

    console.log('\n🎉 All Worldcoin MiniKit integration tests completed!');
    console.log('\n📋 Summary:');
    console.log('   ✅ Worldcoin MiniKit contract writing working');
    console.log('   ✅ Complete messaging flow working');
    console.log('   ✅ Smart contract integration working');
    console.log('   ✅ Walrus storage integration working');

  } catch (error) {
    console.error('❌ Worldcoin MiniKit integration test failed:', error);
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Check if your Infura/Alchemy API key is configured');
    console.log('   2. Verify the contract address is correct');
    console.log('   3. Ensure Worldcoin MiniKit is properly integrated');
    console.log('   4. Check if the Walrus storage is accessible');
    throw error;
  }
}

/**
 * Quick test for just the contract writing functionality
 */
export async function quickContractWritingTest() {
  console.log('⚡ Quick Contract Writing Test...');

  const integration = new MessagingIntegrationExample();
  const testUserAddress = '0x1234567890123456789012345678901234567890';
  const testConversationId = 'quick_test_conversation';

  try {
    // Send a simple text message
    const result = await integration.sendTextMessage(
      'Hello from Worldcoin MiniKit!',
      testConversationId,
      testUserAddress
    );

    if (result.success) {
      console.log('✅ Quick test successful!');
      console.log(`   Blob ID: ${result.blobId}`);
      console.log(`   Transaction Hash: ${result.transactionHash}`);
    } else {
      console.log('❌ Quick test failed:', result.error);
    }

  } catch (error) {
    console.error('❌ Quick test failed:', error);
  }
}

// Export for use in development
export default testWorldcoinIntegration; 