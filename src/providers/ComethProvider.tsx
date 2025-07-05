"use client";

import React from 'react';
import { createConfig, http, WagmiProvider } from "wagmi";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { worldchain } from "wagmi/chains";
import { ConnectProvider } from "@cometh/connect-react-hooks";
import { getComethConfig } from '../config/cometh';

const queryClient = new QueryClient();

interface ComethProviderProps {
  children: React.ReactNode;
}

export const ComethProvider: React.FC<ComethProviderProps> = ({ children }) => {
  try {
    const config = getComethConfig();
    
    // Create wagmi config like in example-cometh
    const wagmiConfig = createConfig({
      chains: [worldchain],
      transports: {
        [worldchain.id]: http(),
      },
    });

    // Create ConnectProvider config like in example-cometh
    const connectConfig = {
      apiKey: config.apiKey,
      networksConfig: [
        {
          bundlerUrl: config.bundlerUrl,
          paymasterUrl: config.paymasterUrl,
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

    console.log('🔧 Cometh Provider Configuration:', {
      apiKey: config.apiKey ? '✅ Set' : '❌ Missing',
      bundlerUrl: config.bundlerUrl,
      paymasterUrl: config.paymasterUrl,
      networksConfig: connectConfig.networksConfig.length,
    });

    return (
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <ConnectProvider
            config={connectConfig}
            queryClient={queryClient}
          >
            {children}
          </ConnectProvider>
        </QueryClientProvider>
      </WagmiProvider>
    );
  } catch (error) {
    console.error('❌ Failed to initialize Cometh Provider:', error);
    
    // Fallback: render children without Cometh provider
    return <>{children}</>;
  }
}; 