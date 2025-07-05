import { useAccount, useConnect, useDisconnect, useSignMessage, useSendTransaction } from "@cometh/connect-react-hooks";
import { useEffect } from "react";

export const useComethConnect = () => {
  const { address, isConnected } = useAccount();
  const { connect, connectAsync, error, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { signMessage, signMessageAsync } = useSignMessage();
  const { sendTransaction, sendTransactionAsync } = useSendTransaction();

  useEffect(() => {
    if (address) {
      localStorage.setItem("walletAddress", address);
      console.log('✅ Cometh wallet connected:', address);
    }
  }, [address]);

  const connectWallet = async () => {
    try {
      console.log('🔗 Connecting to Cometh wallet...');
      const result = await connectAsync();
      console.log('✅ Wallet connection result:', result);
      return result;
    } catch (error) {
      console.error('❌ Wallet connection failed:', error);
      throw error;
    }
  };

  const disconnectWallet = async () => {
    try {
      console.log('🔌 Disconnecting wallet...');
      await disconnect();
      localStorage.removeItem("walletAddress");
      console.log('✅ Wallet disconnected');
    } catch (error) {
      console.error('❌ Wallet disconnection failed:', error);
      throw error;
    }
  };

  const signMessageWithWallet = async (message: string) => {
    try {
      console.log('✍️ Signing message:', message);
      const signature = await signMessageAsync({ message });
      console.log('✅ Message signed:', signature);
      return signature;
    } catch (error) {
      console.error('❌ Message signing failed:', error);
      throw error;
    }
  };

  const sendTransactionWithWallet = async (transaction: any) => {
    try {
      console.log('📤 Sending transaction:', transaction);
      const result = await sendTransactionAsync(transaction);
      console.log('✅ Transaction sent:', result);
      return result;
    } catch (error) {
      console.error('❌ Transaction failed:', error);
      throw error;
    }
  };

  return {
    // State
    address,
    isConnected,
    isPending,
    error,
    
    // Actions
    connect,
    connectAsync,
    connectWallet,
    disconnect,
    disconnectWallet,
    signMessage,
    signMessageAsync,
    signMessageWithWallet,
    sendTransaction,
    sendTransactionAsync,
    sendTransactionWithWallet,
  };
}; 