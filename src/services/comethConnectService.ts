import { createConfig, http } from "wagmi";
import { worldchain } from "wagmi/chains";
import { getComethConfig } from '../config/cometh';

export interface ComethConnectConfig {
  apiKey: string;
  bundlerUrl: string;
  paymasterUrl: string;
  entryPointAddress: string;
}

export class ComethConnectService {
  private config: ComethConnectConfig;
  private wagmiConfig: any;

  constructor(config: ComethConnectConfig) {
    this.config = config;
    
    // Create wagmi config like in the example
    this.wagmiConfig = createConfig({
      chains: [worldchain],
      transports: {
        [worldchain.id]: http(),
      },
    });
  }

  /**
   * Get the Cometh Connect provider configuration
   */
  getConnectProviderConfig() {
    return {
      apiKey: this.config.apiKey,
      networksConfig: [
        {
          bundlerUrl: this.config.bundlerUrl,
          paymasterUrl: this.config.paymasterUrl,
          chain: worldchain,
        },
      ],
      comethSignerConfig: {
        webAuthnOptions: {
          authenticatorSelection: {
            residentKey: "preferred",
            userVerification: "preferred",
          },
        },
      },
    };
  }

  /**
   * Get the wagmi config
   */
  getWagmiConfig() {
    return this.wagmiConfig;
  }

  /**
   * Check if the service is properly configured
   */
  isConfigured(): boolean {
    return !!(
      this.config.apiKey &&
      this.config.bundlerUrl &&
      this.config.paymasterUrl &&
      this.config.entryPointAddress
    );
  }

  /**
   * Get configuration details
   */
  getConfig() {
    return {
      apiKey: this.config.apiKey ? '✅ Set' : '❌ Missing',
      bundlerUrl: this.config.bundlerUrl,
      paymasterUrl: this.config.paymasterUrl,
      entryPointAddress: this.config.entryPointAddress,
    };
  }
}

// Singleton instance
let comethConnectServiceInstance: ComethConnectService | null = null;

export const getComethConnectService = (): ComethConnectService => {
  try {
    if (!comethConnectServiceInstance) {
      const config = getComethConfig();
      comethConnectServiceInstance = new ComethConnectService(config);
    }
    return comethConnectServiceInstance;
  } catch (error) {
    console.error('❌ Failed to create Cometh Connect service:', error);
    throw new Error(`Cometh Connect service initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}; 