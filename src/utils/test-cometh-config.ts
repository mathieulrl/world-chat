import { getComethConfig, validateComethConfig } from '../config/cometh';

export const testComethConfig = () => {
  try {
    console.log('🧪 Testing Cometh configuration...');
    
    const config = getComethConfig();
    console.log('✅ Configuration loaded successfully');
    console.log('📋 Config details:');
    console.log(`   API Key: ${config.apiKey ? '✅ Set' : '❌ Missing'}`);
    console.log(`   Bundler URL: ${config.bundlerUrl}`);
    console.log(`   Paymaster URL: ${config.paymasterUrl}`);
    console.log(`   Entry Point: ${config.entryPointAddress}`);
    console.log(`   Safe Address: ${config.safeAddress ? '✅ Set' : '❌ Missing'}`);
    
    const isValid = validateComethConfig(config);
    console.log(`🔍 Configuration valid: ${isValid ? '✅ Yes' : '❌ No'}`);
    
    return {
      success: isValid,
      config,
      missingFields: !isValid ? [
        !config.apiKey && 'VITE_COMETH_API_KEY',
        !config.bundlerUrl && 'VITE_4337_BUNDLER_URL',
        !config.paymasterUrl && 'VITE_4337_PAYMASTER_URL',
        !config.entryPointAddress && 'VITE_ENTRYPOINT_ADDRESS',
        !config.safeAddress && 'VITE_SAFE_ADDRESS',
      ].filter(Boolean) : []
    };
  } catch (error) {
    console.error('❌ Configuration test failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      config: null
    };
  }
};

// Run test if this file is executed directly
if (import.meta.url === import.meta.main) {
  testComethConfig();
} 