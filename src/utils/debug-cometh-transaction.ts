import { getComethConnectService } from '../services/comethConnectService';

export const debugComethTransaction = () => {
  console.log('🔍 Debugging Cometh Transaction Service...');
  console.log('==========================================');
  
  try {
    // Check if Cometh service is available
    console.log('\n📋 Step 1: Checking Cometh Connect service...');
    const comethService = getComethConnectService();
    console.log('✅ Cometh Connect service available');
    
    // Check configuration
    console.log('\n📋 Step 2: Checking configuration...');
    const config = comethService.getConfig();
    console.log('📊 Configuration:', config);
    
    // Check if service is properly configured
    const isConfigured = comethService.isConfigured();
    console.log(`✅ Service configured: ${isConfigured}`);
    
    if (!isConfigured) {
      console.log('\n❌ ISSUE: Cometh service is not properly configured');
      console.log('💡 Solution: Check your environment variables');
      console.log('   - VITE_COMETH_API_KEY');
      console.log('   - VITE_4337_BUNDLER_URL');
      console.log('   - VITE_4337_PAYMASTER_URL');
      console.log('   - VITE_ENTRYPOINT_ADDRESS');
      return false;
    }
    
    // Check provider configuration
    console.log('\n📋 Step 3: Checking provider configuration...');
    const providerConfig = comethService.getConnectProviderConfig();
    console.log('📊 Provider config:', {
      apiKey: providerConfig.apiKey ? '✅ Set' : '❌ Missing',
      networksConfig: providerConfig.networksConfig.length,
      comethSignerConfig: providerConfig.comethSignerConfig ? '✅ Set' : '❌ Missing',
    });
    
    // Check wagmi config
    console.log('\n📋 Step 4: Checking wagmi configuration...');
    const wagmiConfig = comethService.getWagmiConfig();
    console.log('✅ Wagmi config available');
    
    console.log('\n🎉 Cometh Transaction Service is properly configured!');
    console.log('\n💡 Next steps:');
    console.log('  1. Make sure you have the Cometh Connect wallet installed');
    console.log('  2. Connect your wallet using the "Connect Cometh Wallet" button');
    console.log('  3. Wait for the connection to complete');
    console.log('  4. Try sending a message - it should now work with on-chain storage');
    
    return true;
  } catch (error) {
    console.error('❌ Cometh Transaction Service debug failed:', error);
    console.log('\n💡 Common issues:');
    console.log('  1. Missing environment variables');
    console.log('  2. Invalid API key');
    console.log('  3. Network configuration issues');
    console.log('  4. Cometh Connect not properly initialized');
    
    return false;
  }
};

// Make it available globally for browser console testing
if (typeof window !== 'undefined') {
  (window as any).debugComethTransaction = debugComethTransaction;
} 