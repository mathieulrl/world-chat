import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { MiniKit } from '@worldcoin/minikit-js';
import { Message, Conversation, User, PaymentRequest, MoneyRequest } from '../types/messaging';
import { WalrusMessageService } from '../services/walrusService';
import { WorldcoinService } from '../services/worldcoinService';

interface MessagingContextType {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];
  currentUser: User | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  sendMessage: (content: string, conversationId: string) => Promise<void>;
  sendPayment: (amount: number, token: 'WLD' | 'USDC', recipientAddress: string, conversationId: string) => Promise<void>;
  requestMoney: (amount: number, token: 'WLD' | 'USDC', description: string, conversationId: string) => Promise<void>;
  acceptMoneyRequest: (messageId: string, conversationId: string) => Promise<void>;
  declineMoneyRequest: (messageId: string, conversationId: string) => Promise<void>;
  createConversation: (participants: User[]) => Promise<Conversation>;
  createConversationWithContacts: () => Promise<void>;
  selectConversation: (conversationId: string) => void;
  searchMessages: (query: string) => Promise<Message[]>;
  loadMessages: (conversationId: string) => Promise<void>;
  loadConversations: () => Promise<void>;
  isCreatingConversation: boolean;
}

const MessagingContext = createContext<MessagingContextType | undefined>(undefined);

export const useMessaging = () => {
  const context = useContext(MessagingContext);
  if (!context) {
    throw new Error('useMessaging must be used within a MessagingProvider');
  }
  return context;
};

interface MessagingProviderProps {
  children: ReactNode;
}

export const MessagingProvider: React.FC<MessagingProviderProps> = ({ children }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);

  const walrusService = WalrusMessageService.getInstance();
  const worldcoinService = WorldcoinService.getInstance();

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      setIsLoading(true);
      
      // Check if World App is installed
      if (!worldcoinService.isInstalled()) {
        setError('World App is not installed. Please install World App to use this messaging app.');
        return;
      }

      // Get current user
      const user = worldcoinService.getCurrentUser();
      if (user) {
        const currentUserData: User = {
          id: user.address,
          username: user.username || 'Unknown User',
          address: user.address,
          profilePicture: user.profilePicture,
        };
        setCurrentUser(currentUserData);
        
        // Load conversations after user is set
        await loadConversations(currentUserData);
      } else {
        setError('Failed to get current user');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize app');
    } finally {
      setIsLoading(false);
    }
  };

  const loadConversations = async (user?: User) => {
    try {
      const userToUse = user || currentUser;
      if (!userToUse) {
        console.warn('No user available to load conversations');
        return;
      }

      // For now, we'll create mock conversations
      // In a real app, you'd fetch this from your backend
      const mockConversations: Conversation[] = [
        {
          id: '1',
          participants: [
            userToUse,
            { id: '2', username: 'alice.world', address: '0x1234567890123456789012345678901234567890', profilePicture: 'https://via.placeholder.com/40' }
          ],
          unreadCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          participants: [
            userToUse,
            { id: '3', username: 'bob.world', address: '0x4567890123456789012345678901234567890123', profilePicture: 'https://via.placeholder.com/40' }
          ],
          unreadCount: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      
      setConversations(mockConversations);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load conversations');
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      setIsLoading(true);
      const conversationMessages = await walrusService.getMessages(conversationId);
      setMessages(conversationMessages.reverse()); // Show oldest first
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (content: string, conversationId: string) => {
    if (!currentUser) {
      console.error('No current user available');
      return;
    }

    try {
      const message: Message = {
        id: crypto.randomUUID(),
        conversationId,
        senderId: currentUser.id,
        content,
        timestamp: new Date(),
        messageType: 'text',
      };

      // Store in Walrus
      await walrusService.storeMessage(message);

      // Update local state
      setMessages(prev => [...prev, message]);

      // Update conversation
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId 
            ? { ...conv, lastMessage: message, updatedAt: new Date() }
            : conv
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    }
  };

  const sendPayment = async (amount: number, token: 'WLD' | 'USDC', recipientAddress: string, conversationId: string) => {
    if (!currentUser) {
      console.error('No current user available');
      return;
    }

    try {
      setIsLoading(true);

      // Initiate payment
      const { id: reference } = await worldcoinService.initiatePayment();

      // Create payment request
      const paymentRequest: PaymentRequest = {
        reference,
        to: recipientAddress,
        tokens: [{
          symbol: token,
          token_amount: worldcoinService.tokenToDecimals(amount, token),
        }],
        description: `Payment from ${currentUser.username}`,
      };

      // Send payment
      const paymentResult = await worldcoinService.sendPayment(paymentRequest);

      if (paymentResult.status === 'success') {
        // Confirm payment
        await worldcoinService.confirmPayment(paymentResult);

        // Create payment message
        const message: Message = {
          id: crypto.randomUUID(),
          conversationId,
          senderId: currentUser.id,
          content: `Sent ${amount} ${token}`,
          timestamp: new Date(),
          messageType: 'payment',
          paymentAmount: amount,
          paymentToken: token,
          paymentReference: reference,
          paymentStatus: 'success',
        };

        // Store in Walrus
        await walrusService.storeMessage(message);

        // Update local state
        setMessages(prev => [...prev, message]);

        // Update conversation
        setConversations(prev => 
          prev.map(conv => 
            conv.id === conversationId 
              ? { ...conv, lastMessage: message, updatedAt: new Date() }
              : conv
          )
        );
      } else {
        throw new Error('Payment failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send payment');
    } finally {
      setIsLoading(false);
    }
  };

  const requestMoney = async (amount: number, token: 'WLD' | 'USDC', description: string, conversationId: string) => {
    if (!currentUser) {
      console.error('No current user available');
      return;
    }

    try {
      const requestId = crypto.randomUUID();
      const message: Message = {
        id: requestId,
        conversationId,
        senderId: currentUser.id,
        content: `Requested ${amount} ${token}${description ? `: ${description}` : ''}`,
        timestamp: new Date(),
        messageType: 'payment_request',
        paymentAmount: amount,
        paymentToken: token,
        requestStatus: 'pending',
      };

      // Store in Walrus
      await walrusService.storeMessage(message);

      // Update local state
      setMessages(prev => [...prev, message]);

      // Update conversation
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId 
            ? { ...conv, lastMessage: message, updatedAt: new Date() }
            : conv
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to request money');
    }
  };

  const acceptMoneyRequest = async (messageId: string, conversationId: string) => {
    if (!currentUser) {
      console.error('No current user available');
      return;
    }

    try {
      // Find the request message
      const requestMessage = messages.find(m => m.id === messageId);
      if (!requestMessage || requestMessage.messageType !== 'payment_request') {
        throw new Error('Invalid money request');
      }

      // Find the requester (the person who sent the request)
      const requester = currentConversation?.participants.find(p => p.id === requestMessage.senderId);
      if (!requester) {
        throw new Error('Requester not found');
      }

      // Update request status to accepted
      await walrusService.updateMessageStatus(messageId, 'accepted');

      // Send the actual payment to the requester
      await sendPayment(
        requestMessage.paymentAmount!,
        requestMessage.paymentToken!,
        requester.address, // Send to the requester's address
        conversationId
      );

      // Update the request message status
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, requestStatus: 'accepted' }
            : msg
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to accept money request');
    }
  };

  const declineMoneyRequest = async (messageId: string, conversationId: string) => {
    try {
      // Update request status
      await walrusService.updateMessageStatus(messageId, 'declined');

      // Update the request message status
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, requestStatus: 'declined' }
            : msg
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to decline money request');
    }
  };

  const createConversation = async (participants: User[]): Promise<Conversation> => {
    const conversation: Conversation = {
      id: crypto.randomUUID(),
      participants,
      unreadCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setConversations(prev => [...prev, conversation]);
    return conversation;
  };

  const createConversationWithContacts = useCallback(async () => {
    if (!MiniKit.isInstalled()) {
      setError('World App is not installed. Please install World App to share contacts.');
      return;
    }

    setIsCreatingConversation(true);
    setError(null);

    try {
      const shareContactsPayload = {
        isMultiSelectEnabled: true,
        inviteMessage: "Join me on this secure chat app!",
      };

      const { finalPayload } = await MiniKit.commandsAsync.shareContacts(shareContactsPayload);

      if (finalPayload.status === 'success') {
        const worldAppContacts = finalPayload.contacts;
        
        // Convert World App contacts to User objects
        const selectedUsers: User[] = worldAppContacts.map(contact => ({
          id: contact.walletAddress,
          username: contact.username,
          address: contact.walletAddress,
          profilePicture: contact.profilePictureUrl || undefined,
        }));

        // Create conversation with selected contacts
        if (currentUser && selectedUsers.length > 0) {
          const allParticipants = [currentUser, ...selectedUsers];
          const newConversation = await createConversation(allParticipants);
          selectConversation(newConversation.id);
        }
      } else {
        // Any non-success status is treated as user cancellation
        // Contact sharing errors are almost always user cancellations (closing modal)
        // so we don't show error messages to avoid UX issues
        console.log('Contact sharing cancelled by user');
      }
    } catch (error) {
      // Contact sharing exceptions are almost always user cancellations
      // We don't show any error messages to avoid UX issues
      console.log('Contact sharing cancelled by user');
    } finally {
      setIsCreatingConversation(false);
    }
  }, [currentUser]);

  const selectConversation = (conversationId: string) => {
    const conversation = conversations.find(c => c.id === conversationId);
    if (conversation) {
      setCurrentConversation(conversation);
      loadMessages(conversationId);
    }
  };

  const searchMessages = async (query: string): Promise<Message[]> => {
    try {
      return await walrusService.searchMessages(query, currentConversation?.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search messages');
      return [];
    }
  };

  const value: MessagingContextType = {
    conversations,
    currentConversation,
    messages,
    currentUser,
    isLoading,
    error,
    sendMessage,
    sendPayment,
    requestMoney,
    acceptMoneyRequest,
    declineMoneyRequest,
    createConversation,
    createConversationWithContacts,
    selectConversation,
    searchMessages,
    loadMessages,
    loadConversations,
    isCreatingConversation,
  };

  return (
    <MessagingContext.Provider value={value}>
      {children}
    </MessagingContext.Provider>
  );
}; 