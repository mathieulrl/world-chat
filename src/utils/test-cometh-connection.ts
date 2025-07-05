import { getComethConnectService } from '../services/comethConnectService';

export const testComethConnection = async () => {
  console.log('🧪 Testing Cometh Connect setup...');
  
  try {
    // Test 1: Check if Cometh service can be created
    console.log('\n📋 Test 1: Creating Cometh Connect service...');
    const comethService = getComethConnectService();
    console.log('✅ Cometh Connect service created successfully');
    
    // Test 2: Check configuration
    console.log('\n📋 Test 2: Checking configuration...');
    const config = comethService.getConfig();
    console.log('📊 Configuration:', config);
    
    // Test 3: Check if service is configured
    console.log('\n📋 Test 3: Checking if service is configured...');
    const isConfigured = comethService.isConfigured();
    console.log(`✅ Service configured: ${isConfigured}`);
    
    // Test 4: Get provider config
    console.log('\n📋 Test 4: Getting provider configuration...');
    const providerConfig = comethService.getConnectProviderConfig();
    console.log('📊 Provider config:', {
      apiKey: providerConfig.apiKey ? '✅ Set' : '❌ Missing',
      networksConfig: providerConfig.networksConfig.length,
      comethSignerConfig: providerConfig.comethSignerConfig ? '✅ Set' : '❌ Missing',
    });
    
    // Test 5: Get wagmi config
    console.log('\n📋 Test 5: Getting wagmi configuration...');
    const wagmiConfig = comethService.getWagmiConfig();
    console.log('✅ Wagmi config created successfully');
    
    console.log('\n🎉 All Cometh Connect tests passed!');
    console.log('\n💡 Next steps:');
    console.log('  1. Make sure you have the Cometh Connect wallet installed');
    console.log('  2. Click "Connect Cometh Wallet" in the app');
    console.log('  3. Complete the wallet connection process');
    console.log('  4. Then try sending messages');
    
    return true;
  } catch (error) {
    console.error('❌ Cometh Connect test failed:', error);
    return false;
  }
};

// Make it available globally for browser console testing
if (typeof window !== 'undefined') {
  (window as any).testComethConnection = testComethConnection;
} 