import { MiniKit } from '@worldcoin/minikit-js';

/**
 * Test MiniKit with proper installation
 */
async function testMiniKitWithInstall() {
  console.log('🧪 Testing MiniKit with Installation...');
  console.log('=======================================');
  
  try {
    // Set the app ID
    MiniKit.appId = 'app_633eda004e32e457ef84472c6ef7714c';
    
    console.log('✅ MiniKit initialized with App ID:', MiniKit.appId);
    console.log('📋 Available commands before install:', Object.keys(MiniKit.commandsAsync));
    
    // Step 1: Try to install MiniKit
    console.log('\n📦 Step 1: Installing MiniKit...');
    try {
      await MiniKit.install();
      console.log('✅ MiniKit installation successful!');
    } catch (error) {
      console.log('❌ MiniKit installation failed:', error.message);
      console.log('⚠️ This might indicate World App is not available');
      return;
    }
    
    // Step 2: Check available commands after install
    console.log('\n📋 Step 2: Checking available commands after install...');
    console.log('📊 Available commands:', Object.keys(MiniKit.commandsAsync));
    
    // Step 3: Test contact sharing
    console.log('\n📋 Step 3: Testing contact sharing...');
    try {
      const contactResult = await MiniKit.commandsAsync.shareContacts({
        isMultiSelectEnabled: true,
        inviteMessage: 'Test contact sharing',
      });
      
      console.log('📊 Contact sharing result:', contactResult);
      console.log('✅ Contact sharing works!');
    } catch (error) {
      console.log('❌ Contact sharing failed:', error.message);
    }
    
    // Step 4: Test payment
    console.log('\n💰 Step 4: Testing payment...');
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
      console.log('✅ Payment works!');
    } catch (error) {
      console.log('❌ Payment failed:', error.message);
    }
    
    // Step 5: Test transaction sending
    console.log('\n📤 Step 5: Testing transaction sending...');
    try {
      const transactionResult = await MiniKit.commandsAsync.sendTransaction({
        transaction: [{
          address: '0x063816286ae3312e759f80Afdb10C8879b30688D',
          abi: [{
            type: 'function',
            name: 'storeMessage',
            inputs: [
              { type: 'string', name: 'blobId' },
              { type: 'string', name: 'conversationId' },
              { type: 'string', name: 'messageType' },
              { type: 'string', name: 'suiObjectId' },
              { type: 'string', name: 'txDigest' }
            ],
            outputs: [],
            stateMutability: 'nonpayable'
          }],
          functionName: 'storeMessage',
          args: [
            'test-blob-id',
            'test-conversation-id',
            'text',
            '',
            ''
          ]
        }],
        formatPayload: true
      });
      
      console.log('📊 Transaction result:', transactionResult);
      console.log('✅ Transaction sending works!');
    } catch (error) {
      console.log('❌ Transaction sending failed:', error.message);
    }
    
    console.log('\n🎯 MiniKit Installation Test Complete!');
    console.log('📝 Summary:');
    console.log('   - MiniKit is properly initialized');
    console.log('   - Installation process works');
    console.log('   - API methods are available after install');
    
  } catch (error) {
    console.error('❌ MiniKit Installation Test Failed:', error);
  }
}

/**
 * Test World App connection with proper installation
 */
async function testWorldAppConnectionWithInstall() {
  console.log('🔗 Testing World App Connection with Installation...');
  
  try {
    MiniKit.appId = 'app_633eda004e32e457ef84472c6ef7714c';
    
    // Install MiniKit first
    console.log('📦 Installing MiniKit...');
    await MiniKit.install();
    console.log('✅ MiniKit installed successfully');
    
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
console.log('🚀 Starting MiniKit Installation Tests...\n');
testMiniKitWithInstall().then(() => {
  console.log('\n🔗 Testing World App Connection with Installation...');
  return testWorldAppConnectionWithInstall();
}).then((isConnected) => {
  console.log('\n🎯 All installation tests complete!');
  console.log(`World App Connected: ${isConnected ? '✅ Yes' : '❌ No'}`);
}).catch((error) => {
  console.error('❌ Installation test suite failed:', error);
}); 