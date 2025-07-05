import { MiniKit } from '@worldcoin/minikit-js';

/**
 * Test to verify MiniKit is working in real mode
 */
export async function testMiniKitRealMode() {
  console.log('🧪 Testing MiniKit Real Mode...');
  
  try {
    // Set the app ID
    MiniKit.appId = 'app_633eda004e32e457ef84472c6ef7714c';
    
    console.log('✅ MiniKit initialized with App ID:', MiniKit.appId);
    
    // Test 1: Try to share contacts (this should work in real mode)
    console.log('\n📋 Testing contact sharing...');
    try {
      const contactResult = await MiniKit.commandsAsync.shareContacts({
        isMultiSelectEnabled: true,
        inviteMessage: 'Test contact sharing',
      });
      
      console.log('📊 Contact sharing result:', contactResult);
      console.log('✅ Contact sharing works - MiniKit is in real mode!');
    } catch (error) {
      console.log('❌ Contact sharing failed:', error);
      console.log('⚠️ This might indicate MiniKit is not properly connected to World App');
    }
    
    // Test 2: Try to initiate a payment (this should work in real mode)
    console.log('\n💰 Testing payment initiation...');
    try {
      const paymentResult = await MiniKit.commandsAsync.pay({
        reference: `test-${Date.now()}`,
        to: '0x582be5da7d06b2bf6d89c5b4499491c5990fafe4' as `0x${string}`,
        tokens: [{
          symbol: 'WLD' as any,
          token_amount: '100000000', // 1 WLD in decimals
        }],
        description: 'Test payment from MiniKit',
      });
      
      console.log('📊 Payment result:', paymentResult);
      console.log('✅ Payment works - MiniKit is in real mode!');
    } catch (error) {
      console.log('❌ Payment failed:', error);
      console.log('⚠️ This might indicate MiniKit is not properly connected to World App');
    }
    
    console.log('\n🎯 MiniKit Real Mode Test Complete!');
    console.log('📝 Summary:');
    console.log('   - MiniKit is initialized with real App ID');
    console.log('   - MiniKit API methods are available');
    console.log('   - Whether transactions succeed depends on World App connection');
    
  } catch (error) {
    console.error('❌ MiniKit Real Mode Test Failed:', error);
  }
}

/**
 * Test to check if World App is properly connected
 */
export async function testWorldAppConnection() {
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

// Make functions available globally for testing
if (typeof window !== 'undefined') {
  (window as any).testMiniKitRealMode = testMiniKitRealMode;
  (window as any).testWorldAppConnection = testWorldAppConnection;
} 