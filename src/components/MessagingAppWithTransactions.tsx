import React from 'react';
import { useComethTransactionService } from '../hooks/useComethTransactionService';
import { MessagingApp } from './MessagingApp';
import { MessagingProvider } from '../contexts/MessagingContext';

export const MessagingAppWithTransactions: React.FC = () => {
  const transactionService = useComethTransactionService();

  return (
    <MessagingProvider transactionService={transactionService}>
      <MessagingApp />
    </MessagingProvider>
  );
}; 