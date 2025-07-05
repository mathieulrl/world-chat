import React, { useEffect } from 'react';
import { useComethTransactionService } from '../hooks/useComethTransactionService';
import { MessagingApp } from './MessagingApp';
import { MessagingProvider } from '../contexts/MessagingContext';

export const MessagingAppWithTransactions: React.FC = () => {
  const transactionService = useComethTransactionService();

  useEffect(() => {
    console.log('🔧 MessagingAppWithTransactions - Transaction service status:');
    console.log('  transactionService:', transactionService ? '✅ Available' : '❌ Not available');
    
    if (!transactionService) {
      console.log('💡 To enable on-chain transactions:');
      console.log('  1. Click "Show Cometh Test" in the sidebar');
      console.log('  2. Click "Connect Wallet" to connect your Cometh wallet');
      console.log('  3. Wait for the connection to complete');
      console.log('  4. Then try sending messages - they will be stored on-chain!');
    } else {
      console.log('✅ Transaction service is ready! Messages will be stored on-chain.');
    }
  }, [transactionService]);

  return (
    <MessagingProvider transactionService={transactionService}>
      <MessagingApp />
    </MessagingProvider>
  );
}; 