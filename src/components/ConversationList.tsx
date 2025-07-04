import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { useMessaging } from '../contexts/MessagingContext';
import { MessageCircle, Send } from 'lucide-react';

export const ConversationList: React.FC = () => {
  const { conversations, currentConversation, selectConversation, currentUser } = useMessaging();

  const getOtherParticipant = (conversation: any) => {
    if (!currentUser) return null;
    return conversation.participants.find((p: any) => p.id !== currentUser.id);
  };

  const getLastMessagePreview = (conversation: any) => {
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
      <div className="w-80 border-r border-border bg-background">
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
    <div className="w-80 border-r border-border bg-background">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold">Conversations</h2>
      </div>
      
      <ScrollArea className="h-[calc(100vh-80px)]">
        <div className="p-2">
          {conversations.map((conversation) => {
            const otherParticipant = getOtherParticipant(conversation);
            const isSelected = currentConversation?.id === conversation.id;
            
            if (!otherParticipant) {
              return null; // Skip conversations where we can't find the other participant
            }
            
            return (
              <div
                key={conversation.id}
                onClick={() => selectConversation(conversation.id)}
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
          })}
        </div>
      </ScrollArea>
    </div>
  );
}; 