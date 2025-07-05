import { useSendTransaction, useAccount } from "@cometh/connect-react-hooks";
import { createComethTransactionService, ComethTransactionService } from '../services/comethTransactionService';
import { useMemo } from 'react';

export const useComethTransactionService = (): ComethTransactionService | null => {
  const { sendTransactionAsync } = useSendTransaction();
  const { smartAccountClient } = useAccount();

  const transactionService = useMemo(() => {
    if (!sendTransactionAsync || !smartAccountClient) {
      console.log('⚠️ Cometh Connect not ready for transactions');
      return null;
    }

    console.log('✅ Creating Cometh transaction service with hooks');
    return createComethTransactionService(sendTransactionAsync, smartAccountClient);
  }, [sendTransactionAsync, smartAccountClient]);

  return transactionService;
}; 