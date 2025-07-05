import { getComethConfig } from '../config/cometh';

export const debugComethConfig = () => {
  console.log('🔍 Debugging Cometh Configuration...');
  
  try {
    // Check environment variables directly
    console.log('\n📋 Environment Variables:');
    console.log('VITE_COMETH_API_KEY:', import.meta.env.VITE_COMETH_API_KEY ? '✅ Set' : '❌ Missing');
    console.log('VITE_SAFE_ADDRESS:', import.meta.env.VITE_SAFE_ADDRESS ? '✅ Set' : '❌ Missing');
    console.log('VITE_4337_BUNDLER_URL:', import.meta.env.VITE_4337_BUNDLER_URL || 'Using default');
    console.log('VITE_4337_PAYMASTER_URL:', import.meta.env.VITE_4337_PAYMASTER_URL || 'Using default');
    console.log('VITE_ENTRYPOINT_ADDRESS:', import.meta.env.VITE_ENTRYPOINT_ADDRESS || 'Using default');
    
    // Check if any required variables are missing
    const missingVars = [];
    if (!import.meta.env.VITE_COMETH_API_KEY) missingVars.push('VITE_COMETH_API_KEY');
    if (!import.meta.env.VITE_SAFE_ADDRESS) missingVars.push('VITE_SAFE_ADDRESS');
    
    if (missingVars.length > 0) {
      console.log('\n❌ Missing required environment variables:', missingVars.join(', '));
      console.log('\n📋 Add these to your .env file:');
      console.log('VITE_COMETH_API_KEY=your_cometh_api_key');
      console.log('VITE_SAFE_ADDRESS=your_worldcoin_safe_address');
      console.log('VITE_4337_BUNDLER_URL=https://bundler.cometh.io/480');
      console.log('VITE_4337_PAYMASTER_URL=https://paymaster.cometh.io/480');
      console.log('VITE_ENTRYPOINT_ADDRESS=0x0000000071727De22E5E9d8BAf0edAc6f37da032');
      console.log('\n💡 Note: Replace "your_cometh_api_key" and "your_worldcoin_safe_address" with your actual values');
      
      return {
        success: false,
        error: `Missing environment variables: ${missingVars.join(', ')}`,
        missingVars: missingVars,
      };
    }
    
    // Try to get config
    console.log('\n📋 Cometh Config:');
    const config = getComethConfig();
    console.log('✅ Config loaded successfully:', {
      apiKey: config.apiKey ? '✅ Set' : '❌ Missing',
      safeAddress: config.safeAddress,
      bundlerUrl: config.bundlerUrl,
      paymasterUrl: config.paymasterUrl,
      entryPointAddress: config.entryPointAddress,
    });
    
    return {
      success: true,
      config: config,
    };
    
  } catch (error) {
    console.error('❌ Config debug failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// Test function that can be called from browser console
(window as any).debugComethConfig = debugComethConfig; 