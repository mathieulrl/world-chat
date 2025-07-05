import { useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect } from '@cometh/connect-react-hooks';

export const useComethConnect = () => {
  const { address, isConnected } = useAccount();
  const { connect, error, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  const [connectionError, setConnectionError] = useState<string | null>(null);

  const connectWallet = async () => {
    try {
      setConnectionError(null);
      console.log('🔗 Attempting to connect Cometh wallet...');
      
      await connect();
      
      console.log('✅ Cometh wallet connected successfully');
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect wallet';
      setConnectionError(errorMessage);
      console.error('❌ Cometh wallet connection failed:', error);
      throw error;
    }
  };

  const disconnectWallet = async () => {
    try {
      await disconnect();
      console.log('✅ Cometh wallet disconnected successfully');
    } catch (error) {
      console.error('❌ Failed to disconnect Cometh wallet:', error);
      throw error;
    }
  };

  // Clear connection error when connection status changes
  useEffect(() => {
    if (isConnected) {
      setConnectionError(null);
    }
  }, [isConnected]);

  return {
    address,
    isConnected,
    isPending,
    error: connectionError || error,
    connectWallet,
    disconnectWallet,
  };
}; 