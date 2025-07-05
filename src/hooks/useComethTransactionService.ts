import { useSendTransaction, useAccount } from "@cometh/connect-react-hooks";
import { createComethTransactionService, ComethTransactionService } from '../services/comethTransactionService';
import { useMemo } from 'react';

export const useComethTransactionService = (): ComethTransactionService | null => {
  const { sendTransactionAsync } = useSendTransaction();
  const { smartAccountClient } = useAccount();

  const transactionService = useMemo(() => {
    console.log('🔍 Checking Cometh Connect hooks availability:');
    console.log('  sendTransactionAsync:', sendTransactionAsync ? '✅ Available' : '❌ Not available');
    console.log('  smartAccountClient:', smartAccountClient ? '✅ Available' : '❌ Not available');
    
    if (!sendTransactionAsync || !smartAccountClient) {
      console.log('⚠️ Cometh Connect not ready for transactions');
      console.log('💡 To enable transactions:');
      console.log('  1. Connect your Cometh wallet using the "Connect Wallet" button');
      console.log('  2. Wait for the connection to complete');
      console.log('  3. Then try sending messages again');
      return null;
    }

    console.log('✅ Creating Cometh transaction service with hooks');
    return createComethTransactionService(sendTransactionAsync, smartAccountClient);
  }, [sendTransactionAsync, smartAccountClient]);

  return transactionService;
}; 