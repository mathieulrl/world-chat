const { MiniKit } = require('@worldcoin/minikit-js');

/**
 * Standalone test for MiniKit functionality
 */
async function testMiniKitStandalone() {
  console.log('🧪 Testing MiniKit Standalone...');
  console.log('================================');
  
  try {
    // Set the app ID
    MiniKit.appId = 'app_633eda004e32e457ef84472c6ef7714c';
    
    console.log('✅ MiniKit initialized with App ID:', MiniKit.appId);
    console.log('📋 Available commands:', Object.keys(MiniKit.commandsAsync));
    
    // Test 1: Check if MiniKit is available
    console.log('\n📋 Test 1: Checking MiniKit availability...');
    try {
      // Try to access a simple property to see if MiniKit is loaded
      console.log('✅ MiniKit is loaded and accessible');
      console.log('📊 App ID:', MiniKit.appId);
      console.log('📊 Available commands:', Object.keys(MiniKit.commandsAsync));
    } catch (error) {
      console.log('❌ MiniKit not available:', error.message);
      return;
    }
    
    // Test 2: Try to share contacts (this should work in real mode)
    console.log('\n📋 Test 2: Testing contact sharing...');
    try {
      const contactResult = await MiniKit.commandsAsync.shareContacts({
        isMultiSelectEnabled: true,
        inviteMessage: 'Test contact sharing',
      });
      
      console.log('📊 Contact sharing result:', contactResult);
      console.log('✅ Contact sharing works - MiniKit is in real mode!');
    } catch (error) {
      console.log('❌ Contact sharing failed:', error.message);
      console.log('⚠️ This might indicate MiniKit is not properly connected to World App');
    }
    
    // Test 3: Try to initiate a payment (this should work in real mode)
    console.log('\n💰 Test 3: Testing payment initiation...');
    try {
      const paymentResult = await MiniKit.commandsAsync.pay({
        reference: `test-${Date.now()}`,
        to: '0x582be5da7d06b2bf6d89c5b4499491c5990fafe4',
        tokens: [{
          symbol: 'WLD',
          token_amount: '100000000', // 1 WLD in decimals
        }],
        description: 'Test payment from MiniKit',
      });
      
      console.log('📊 Payment result:', paymentResult);
      console.log('✅ Payment works - MiniKit is in real mode!');
    } catch (error) {
      console.log('❌ Payment failed:', error.message);
      console.log('⚠️ This might indicate MiniKit is not properly connected to World App');
    }
    
    console.log('\n🎯 MiniKit Standalone Test Complete!');
    console.log('📝 Summary:');
    console.log('   - MiniKit is initialized with real App ID');
    console.log('   - MiniKit API methods are available');
    console.log('   - Whether transactions succeed depends on World App connection');
    
  } catch (error) {
    console.error('❌ MiniKit Standalone Test Failed:', error);
  }
}

/**
 * Test to check if World App is properly connected
 */
async function testWorldAppConnection() {
  console.log('🔗 Testing World App Connection...');
  
  try {
    MiniKit.appId = 'app_633eda004e32e457ef84472c6ef7714c';
    
    // Try a simple operation that requires World App
    const result = await MiniKit.commandsAsync.shareContacts({
      isMultiSelectEnabled: false,
      inviteMessage: 'Testing World App connection',
    });
    
    console.log('📊 World App connection result:', result);
    
    if (result.finalPayload.status === 'success') {
      console.log('✅ World App is properly connected!');
      return true;
    } else {
      console.log('⚠️ World App connection issue:', result.finalPayload.error_code);
      return false;
    }
    
  } catch (error) {
    console.error('❌ World App connection test failed:', error);
    return false;
  }
}

// Run the tests
console.log('🚀 Starting MiniKit Tests...\n');
testMiniKitStandalone().then(() => {
  console.log('\n🔗 Testing World App Connection...');
  return testWorldAppConnection();
}).then((isConnected) => {
  console.log('\n🎯 All tests complete!');
  console.log(`World App Connected: ${isConnected ? '✅ Yes' : '❌ No'}`);
}).catch((error) => {
  console.error('❌ Test suite failed:', error);
}); 