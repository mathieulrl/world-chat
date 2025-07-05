"use client";

import React from 'react';
import { createConfig, http, WagmiProvider } from "wagmi";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { worldchain } from "wagmi/chains";
import { ConnectProvider } from "@cometh/connect-react-hooks";
import { getComethConnectService } from '../services/comethConnectService';

const queryClient = new QueryClient();

interface ComethProviderProps {
  children: React.ReactNode;
}

export const ComethProvider: React.FC<ComethProviderProps> = ({ children }) => {
  try {
    const comethService = getComethConnectService();
    const wagmiConfig = comethService.getWagmiConfig();
    const connectConfig = comethService.getConnectProviderConfig();

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