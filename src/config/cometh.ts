export interface ComethConfig {
  apiKey: string;
  bundlerUrl: string;
  paymasterUrl: string;
  entryPointAddress: string;
  safeAddress: string;
}

// Environment variables for Cometh Connect
export const COMETH_CONFIG: ComethConfig = {
  apiKey: import.meta.env.VITE_COMETH_API_KEY || '',
  bundlerUrl: import.meta.env.VITE_4337_BUNDLER_URL || 'https://bundler.cometh.io/480',
  paymasterUrl: import.meta.env.VITE_4337_PAYMASTER_URL || 'https://paymaster.cometh.io/480',
  entryPointAddress: import.meta.env.VITE_ENTRYPOINT_ADDRESS || '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789',
  safeAddress: import.meta.env.VITE_SAFE_ADDRESS || '', // Your Worldcoin Safe address
};

// Validate configuration
export const validateComethConfig = (config: ComethConfig): boolean => {
  return !!(
    config.apiKey &&
    config.bundlerUrl &&
    config.paymasterUrl &&
    config.entryPointAddress &&
    config.safeAddress
  );
};

// Get validated config
export const getComethConfig = (): ComethConfig => {
  if (!validateComethConfig(COMETH_CONFIG)) {
    throw new Error('Invalid Cometh configuration. Please check your environment variables.');
  }
  return COMETH_CONFIG;
}; 