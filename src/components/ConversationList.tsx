import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { useMessaging } from '../contexts/MessagingContext';
import { Conversation } from '../types/messaging';
import { MessageCircle, Send, Plus, Loader2 } from 'lucide-react';

interface ConversationListProps {
  onMobileClose?: () => void;
}

export const ConversationList: React.FC<ConversationListProps> = ({ onMobileClose }) => {
  const { 
    conversations, 
    currentConversation, 
    selectConversation, 
    currentUser, 
    createConversationWithContacts,
    isCreatingConversation 
  } = useMessaging();

  const getOtherParticipant = (conversation: Conversation) => {
    if (!currentUser) return null;
    return conversation.participants.find((p) => p.id !== currentUser.id);
  };

  const getLastMessagePreview = (conversation: Conversation) => {
    if (!conversation.lastMessage) return 'No messages yet';
    
    if (conversation.lastMessage.messageType === 'payment') {
      return `💰 ${conversation.lastMessage.content}`;
    }
    
    return conversation.lastMessage.content.length > 50 
      ? conversation.lastMessage.content.substring(0, 50) + '...'
      : conversation.lastMessage.content;
  };

  if (!currentUser) {
    return (
      <div className="w-full h-full bg-background md:w-80">
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-semibold">Conversations</h2>
        </div>
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <p className="text-muted-foreground">Loading user...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-background md:w-80">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Conversations</h2>
          <Button
            onClick={createConversationWithContacts}
            disabled={isCreatingConversation}
            size="sm"
            className="flex items-center space-x-1"
          >
            {isCreatingConversation ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">
              {isCreatingConversation ? 'Selecting...' : 'New Chat'}
            </span>
          </Button>
        </div>
      </div>
      
      <ScrollArea className="h-[calc(100vh-80px)]">
        <div className="p-2">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center p-4">
              <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No conversations yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Start chatting with your World App contacts
              </p>
              <Button
                onClick={createConversationWithContacts}
                disabled={isCreatingConversation}
                className="flex items-center space-x-2"
              >
                {isCreatingConversation ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                <span>{isCreatingConversation ? 'Selecting Contacts...' : 'Start New Chat'}</span>
              </Button>
            </div>
          ) : (
            conversations.map((conversation) => {
            const otherParticipant = getOtherParticipant(conversation);
            const isSelected = currentConversation?.id === conversation.id;
            
            if (!otherParticipant) {
              return null; // Skip conversations where we can't find the other participant
            }
            
            const handleSelectConversation = () => {
              selectConversation(conversation.id);
              onMobileClose?.(); // Close mobile sidebar when conversation is selected
            };

            return (
              <div
                key={conversation.id}
                onClick={handleSelectConversation}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  isSelected 
                    ? 'bg-accent text-accent-foreground' 
                    : 'hover:bg-muted/50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={otherParticipant?.profilePicture} />
                    <AvatarFallback>
                      {otherParticipant?.username?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-sm truncate">
                        {otherParticipant?.username || 'Unknown User'}
                      </h3>
                      {conversation.unreadCount > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {conversation.unreadCount}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-1 mt-1">
                      {conversation.lastMessage?.messageType === 'payment' ? (
                        <Send className="h-3 w-3 text-green-500" />
                      ) : (
                        <MessageCircle className="h-3 w-3 text-muted-foreground" />
                      )}
                      <p className="text-xs text-muted-foreground truncate">
                        {getLastMessagePreview(conversation)}
                      </p>
                    </div>
                    
                    {conversation.lastMessage && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(conversation.lastMessage.timestamp, { addSuffix: true })}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })
          )}
        </div>
      </ScrollArea>
    </div>
  );
}; 