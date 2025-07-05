export interface ComethConfig {
  apiKey: string;
  bundlerUrl: string;
  paymasterUrl: string;
  entryPointAddress: string;
}

// Environment variables for Cometh Connect
export const COMETH_CONFIG: ComethConfig = {
  apiKey: import.meta.env.VITE_COMETH_API_KEY || '',
  bundlerUrl: import.meta.env.VITE_4337_BUNDLER_URL || 'https://bundler.cometh.io/480',
  paymasterUrl: import.meta.env.VITE_4337_PAYMASTER_URL || 'https://paymaster.cometh.io/480',
  entryPointAddress: import.meta.env.VITE_ENTRYPOINT_ADDRESS || '0x0000000071727De22E5E9d8BAf0edAc6f37da032',
};

// Validate configuration
export const validateComethConfig = (config: ComethConfig): boolean => {
  const missingVars = [];
  
  if (!config.apiKey) missingVars.push('VITE_COMETH_API_KEY');
  if (!config.bundlerUrl) missingVars.push('VITE_4337_BUNDLER_URL');
  if (!config.paymasterUrl) missingVars.push('VITE_4337_PAYMASTER_URL');
  if (!config.entryPointAddress) missingVars.push('VITE_ENTRYPOINT_ADDRESS');
  
  if (missingVars.length > 0) {
    console.error('❌ Missing environment variables:', missingVars.join(', '));
    console.log('📋 Required environment variables:');
    console.log('  VITE_COMETH_API_KEY=your_cometh_api_key');
    console.log('  VITE_4337_BUNDLER_URL=https://bundler.cometh.io/480');
    console.log('  VITE_4337_PAYMASTER_URL=https://paymaster.cometh.io/480');
    console.log('  VITE_ENTRYPOINT_ADDRESS=0x0000000071727De22E5E9d8BAf0edAc6f37da032');
    return false;
  }
  
  return true;
};

// Get validated config
export const getComethConfig = (): ComethConfig => {
  if (!validateComethConfig(COMETH_CONFIG)) {
    throw new Error('Invalid Cometh configuration. Please check your environment variables.');
  }
  return COMETH_CONFIG;
}; 