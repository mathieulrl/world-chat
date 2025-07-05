import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { MiniKit } from '@worldcoin/minikit-js';
import { Message, Conversation, User, PaymentRequest, MoneyRequest } from '../types/messaging';
import { DecentralizedMessagingService } from '../services/decentralizedMessagingService';
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

  // Initialize decentralized messaging service
  const decentralizedService = new DecentralizedMessagingService({
    walrus: {
      aggregatorUrl: 'https://aggregator.walrus-testnet.walrus.space',
      publisherUrl: 'https://publisher.walrus-testnet.walrus.space',
      network: 'testnet',
    },
    smartContract: {
      contractAddress: '0x063816286ae3312e759f80Afdb10C8879b30688D', // Updated contract address
      network: 'testnet',
      rpcUrl: 'https://worldchain-sepolia.drpc.org',
    },
  });

  const worldcoinService = WorldcoinService.getInstance();

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      console.log('🚀 Initializing app...');
      setIsLoading(true);
      
      // Check if World App is installed
      if (!worldcoinService.isInstalled()) {
        console.error('❌ World App is not installed');
        setError('World App is not installed. Please install World App to use this messaging app.');
        return;
      }
      console.log('✅ World App is installed');

      // Get current user
      console.log('👤 Getting current user...');
      const user = await worldcoinService.getCurrentUser();
      if (user) {
        console.log('✅ Current user found:', user);
        const currentUserData: User = {
          id: user.address,
          username: user.username || 'Unknown User',
          address: user.address,
          profilePicture: user.profilePicture,
        };
        setCurrentUser(currentUserData);
        
        // Load conversations after user is set
        console.log('💬 Loading conversations for user:', currentUserData.address);
        await loadConversations(currentUserData);
      } else {
        console.error('❌ Failed to get current user');
        setError('Failed to get current user');
      }
    } catch (err) {
      console.error('❌ App initialization failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to initialize app');
    } finally {
      setIsLoading(false);
      console.log('✅ App initialization complete');
    }
  };

  const loadConversations = async (user?: User) => {
    try {
      console.log('📋 Loading conversations...');
      const userToUse = user || currentUser;
      if (!userToUse) {
        console.warn('⚠️ No user available to load conversations');
        return;
      }

      console.log('🔍 Getting conversations for address:', userToUse.address);
      // Get real conversations from decentralized service
      const realConversations = await decentralizedService.getUserConversations(userToUse.address);
      console.log('📥 Raw conversations from service:', realConversations);
      
      if (realConversations.length === 0) {
        console.log('ℹ️ No conversations found - this is normal for a new user');
        setConversations([]);
        return;
      }
      
      // Convert to Conversation format expected by the UI
      const conversations: Conversation[] = realConversations.map((conv: any) => ({
        id: conv.id,
        participants: conv.participants.map((addr: string) => ({
          id: addr,
          username: addr, // You can enhance this with user lookup
          address: addr,
          profilePicture: 'https://via.placeholder.com/40'
        })),
        unreadCount: 0, // You can implement unread logic if needed
        createdAt: conv.createdAt,
        updatedAt: conv.updatedAt,
      }));
      
      console.log('✅ Processed conversations:', conversations);
      setConversations(conversations);
    } catch (err) {
      console.error('❌ Failed to load conversations:', err);
      // Don't set error for empty conversations - this is normal
      if (!err.message?.includes('returned no data')) {
        setError(err instanceof Error ? err.message : 'Failed to load conversations');
      }
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      setIsLoading(true);
      
      // Use decentralized service to get messages
      const conversationMessages = await decentralizedService.getConversationMessages(conversationId);
      setMessages(conversationMessages.reverse()); // Show oldest first
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (content: string, conversationId: string) => {
    if (!currentUser) {
      console.error('❌ No current user available for sending message');
      return;
    }

    try {
      console.log('💬 Sending message:', { content, conversationId, sender: currentUser.id });
      const message: Message = {
        id: crypto.randomUUID(),
        conversationId,
        senderId: currentUser.id,
        content,
        timestamp: new Date(),
        messageType: 'text',
      };

      console.log('📤 Storing message in decentralized system...');
      // Store in decentralized system (Walrus + Smart Contract)
      const { walrusResult, contractTxHash } = await decentralizedService.sendMessage(
        message,
        currentUser.address
      );

      console.log(`✅ Message sent! Walrus Blob ID: ${walrusResult.blobId}, Contract TX: ${contractTxHash}`);

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
      console.log('✅ Message state updated successfully');
    } catch (err) {
      console.error('❌ Failed to send message:', err);
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

      // Execute payment
      const paymentResult = await worldcoinService.executePayment(paymentRequest);
      console.log('Payment executed:', paymentResult);

      // Create payment message
      const paymentMessage: Message = {
        id: crypto.randomUUID(),
        conversationId,
        senderId: currentUser.id,
        content: `Sent ${amount} ${token} to ${recipientAddress}`,
        timestamp: new Date(),
        messageType: 'payment',
        paymentData: {
          amount,
          token,
          recipientAddress,
          transactionHash: paymentResult.transactionHash || 'pending',
          status: 'completed',
        },
      };

      // Store payment message in decentralized system
      const { walrusResult, contractTxHash } = await decentralizedService.sendMessage(
        paymentMessage,
        currentUser.address
      );

      console.log(`Payment message stored! Walrus Blob ID: ${walrusResult.blobId}, Contract TX: ${contractTxHash}`);

      // Update local state
      setMessages(prev => [...prev, paymentMessage]);

      // Update conversation
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId 
            ? { ...conv, lastMessage: paymentMessage, updatedAt: new Date() }
            : conv
        )
      );
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
      // Create money request message
      const moneyRequest: MoneyRequest = {
        id: crypto.randomUUID(),
        amount,
        token,
        description,
        requesterId: currentUser.id,
        requesterAddress: currentUser.address,
        status: 'pending',
        createdAt: new Date(),
      };

      const requestMessage: Message = {
        id: crypto.randomUUID(),
        conversationId,
        senderId: currentUser.id,
        content: `Requested ${amount} ${token}: ${description}`,
        timestamp: new Date(),
        messageType: 'payment_request',
        moneyRequestData: moneyRequest,
      };

      // Store money request message in decentralized system
      const { walrusResult, contractTxHash } = await decentralizedService.sendMessage(
        requestMessage,
        currentUser.address
      );

      console.log(`Money request stored! Walrus Blob ID: ${walrusResult.blobId}, Contract TX: ${contractTxHash}`);

      // Update local state
      setMessages(prev => [...prev, requestMessage]);

      // Update conversation
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId 
            ? { ...conv, lastMessage: requestMessage, updatedAt: new Date() }
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
      setIsLoading(true);

      // Find the money request message
      const requestMessage = messages.find(msg => msg.id === messageId);
      if (!requestMessage || !requestMessage.moneyRequestData) {
        throw new Error('Money request not found');
      }

      const { amount, token, requesterAddress } = requestMessage.moneyRequestData;

      // Execute payment to the requester
      const { id: reference } = await worldcoinService.initiatePayment();
      const paymentRequest: PaymentRequest = {
        reference,
        to: requesterAddress,
        tokens: [{
          symbol: token,
          token_amount: worldcoinService.tokenToDecimals(amount, token),
        }],
        description: `Payment for money request`,
      };

      const paymentResult = await worldcoinService.executePayment(paymentRequest);
      console.log('Payment executed for money request:', paymentResult);

      // Create acceptance message
      const acceptanceMessage: Message = {
        id: crypto.randomUUID(),
        conversationId,
        senderId: currentUser.id,
        content: `Accepted money request: ${amount} ${token}`,
        timestamp: new Date(),
        messageType: 'payment',
        paymentData: {
          amount,
          token,
          recipientAddress: requesterAddress,
          transactionHash: paymentResult.transactionHash || 'pending',
          status: 'completed',
        },
      };

      // Store acceptance message in decentralized system
      const { walrusResult, contractTxHash } = await decentralizedService.sendMessage(
        acceptanceMessage,
        currentUser.address
      );

      console.log(`Acceptance message stored! Walrus Blob ID: ${walrusResult.blobId}, Contract TX: ${contractTxHash}`);

      // Update the original request status
      const updatedMessages = messages.map(msg => 
        msg.id === messageId 
          ? { ...msg, moneyRequestData: { ...msg.moneyRequestData!, status: 'accepted' } }
          : msg
      );
      setMessages(updatedMessages as Message[]);

      // Add acceptance message
      setMessages(prev => [...prev, acceptanceMessage]);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to accept money request');
    } finally {
      setIsLoading(false);
    }
  };

  const declineMoneyRequest = async (messageId: string, conversationId: string) => {
    try {
      // Update the request status
      const updatedMessages = messages.map(msg => 
        msg.id === messageId 
          ? { ...msg, moneyRequestData: { ...msg.moneyRequestData!, status: 'declined' } }
          : msg
      );
      setMessages(updatedMessages as Message[]);

      // Create decline message
      const declineMessage: Message = {
        id: crypto.randomUUID(),
        conversationId,
        senderId: currentUser!.id,
        content: 'Declined money request',
        timestamp: new Date(),
        messageType: 'text',
      };

      // Store decline message in decentralized system
      const { walrusResult, contractTxHash } = await decentralizedService.sendMessage(
        declineMessage,
        currentUser!.address
      );

      console.log(`Decline message stored! Walrus Blob ID: ${walrusResult.blobId}, Contract TX: ${contractTxHash}`);

      // Add decline message
      setMessages(prev => [...prev, declineMessage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to decline money request');
    }
  };

  const createConversation = async (participants: User[]): Promise<Conversation> => {
    const newConversation: Conversation = {
      id: crypto.randomUUID(),
      participants,
      unreadCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setConversations(prev => [...prev, newConversation]);
    return newConversation;
  };

  const createConversationWithContacts = async () => {
    try {
      setIsCreatingConversation(true);
      
      // Get contacts from World App
      const contacts = await worldcoinService.getContacts();
      
      if (contacts.length === 0) {
        setError('No contacts found. Please add contacts in World App.');
        return;
      }

      // Create conversation with first contact
      const firstContact = contacts[0];
      const newConversation = await createConversation([
        currentUser!,
        {
          id: firstContact.address,
          username: firstContact.username || 'Unknown',
          address: firstContact.address,
          profilePicture: firstContact.profilePicture,
        }
      ]);

      // Select the new conversation
      selectConversation(newConversation.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create conversation');
    } finally {
      setIsCreatingConversation(false);
    }
  };

  const selectConversation = (conversationId: string) => {
    const conversation = conversations.find(c => c.id === conversationId);
    setCurrentConversation(conversation || null);
    if (conversation) {
      loadMessages(conversationId);
    }
  };

  const searchMessages = async (query: string): Promise<Message[]> => {
    try {
      // In a real implementation, you would search through your message history
      // For now, we'll return an empty array
      return [];
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