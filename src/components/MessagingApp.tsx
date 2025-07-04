import React from 'react';
import { ConversationList } from './ConversationList';
import { ChatInterface } from './ChatInterface';
import { useMessaging } from '../contexts/MessagingContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

export const MessagingApp: React.FC = () => {
  const { isLoading, error } = useMessaging();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading messaging app...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen p-4">
        <Alert className="max-w-md">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <ConversationList />
      <ChatInterface />
    </div>
  );
};
