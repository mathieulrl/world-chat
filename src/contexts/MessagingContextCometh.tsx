import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Message, Conversation, User, MoneyRequest } from '../types/messaging';
import { DecentralizedMessagingService } from '../services/decentralizedMessagingService';
import { getComethService, ComethConfig } from '../services/comethService';
import { getComethConfig } from '../config/cometh';

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
  createDefaultConversation: () => Promise<Conversation>;
  createConversationWithContacts: () => Promise<void>;
  selectConversation: (conversationId: string) => void;
  searchMessages: (query: string) => Promise<Message[]>;
  loadMessages: (conversationId: string) => Promise<void>;
  loadConversations: () => Promise<void>;
  refreshMessageHistory: () => Promise<void>;
  isCreatingConversation: boolean;
  
  // Cometh specific
  safeAddress: string | null;
  isComethInitialized: boolean;
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
  const [safeAddress, setSafeAddress] = useState<string | null>(null);
  const [isComethInitialized, setIsComethInitialized] = useState(false);

  // Initialize decentralized messaging service
  const decentralizedService = new DecentralizedMessagingService({
    walrus: {
      aggregatorUrl: 'https://aggregator.walrus-testnet.walrus.space',
      publisherUrl: 'https://publisher.walrus-testnet.walrus.space',
      network: 'testnet',
    },
    smartContract: {
      contractAddress: '0x34bF1A2460190e60e33309BF8c54D9A7c9eCB4B8',
      network: 'mainnet',
      rpcUrl: 'https://worldchain.drpc.org',
    },
  });

  // Initialize Cometh service
  const initializeCometh = async () => {
    try {
      console.log('🔧 Initializing Cometh service...');
      const config = getComethConfig();
      const comethService = getComethService(config);
      
      await comethService.initialize();
      
      setSafeAddress(comethService.getSafeAddress());
      setIsComethInitialized(true);
      
      console.log('✅ Cometh service initialized successfully');
      console.log('🏦 Safe address:', comethService.getSafeAddress());
    } catch (error) {
      console.error('❌ Failed to initialize Cometh service:', error);
      setError('Failed to initialize Safe wallet. Please check your configuration.');
    }
  };

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      console.log('🚀 Initializing app...');
      setIsLoading(true);
      setError(null);
      
      // Initialize Cometh service first
      await initializeCometh();
      
      if (!isComethInitialized) {
        console.error('❌ Cometh service not initialized');
        return;
      }
      
      // Create user from Safe address
      if (safeAddress) {
        const currentUserData: User = {
          id: safeAddress,
          username: 'Safe User',
          address: safeAddress,
          profilePicture: 'https://via.placeholder.com/40',
        };
        setCurrentUser(currentUserData);
        
        // Load conversations and message history
        console.log('💬 Loading conversations and message history for Safe:', safeAddress);
        await loadConversations(currentUserData);
        await refreshMessageHistory();
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
      
      // Get message history to see if there are any messages
      try {
        const messageHistory = await decentralizedService.getMessageHistory(userToUse.address);
        console.log(`📨 Found ${messageHistory.length} messages for user`);
        
        if (messageHistory.length > 0) {
          // Extract unique conversation IDs from messages
          const conversationIds = new Set<string>();
          messageHistory.forEach((message: Message) => {
            if (message.conversationId) {
              conversationIds.add(message.conversationId);
            }
          });
          
          const uniqueConversationIds = Array.from(conversationIds);
          console.log(`📋 Found ${uniqueConversationIds.length} unique conversation IDs:`, uniqueConversationIds);
          
          // Create conversation objects from the conversation IDs
          const conversations: Conversation[] = uniqueConversationIds.map((convId: string) => ({
            id: convId,
            participants: [
              {
                id: userToUse.address,
                username: userToUse.username,
                address: userToUse.address,
                profilePicture: userToUse.profilePicture,
              }
            ],
            unreadCount: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
          }));
          
          console.log('✅ Created conversations from message history:', conversations);
          setConversations(conversations);
          
          // Auto-select the first conversation if none is selected
          if (conversations.length > 0 && !currentConversation) {
            console.log('📋 Auto-selecting first conversation:', conversations[0].id);
            selectConversation(conversations[0].id);
          }
          
          return;
        }
      } catch (error) {
        console.log('⚠️ Failed to get message history:', error.message);
      }
      
      // Set empty conversations if none found
      setConversations([]);
    } catch (err) {
      console.error('❌ Failed to load conversations:', err);
      setConversations([]);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      setIsLoading(true);
      console.log(`📨 Loading messages for conversation: ${conversationId}`);
      
      const conversationMessages = await decentralizedService.getConversationMessages(conversationId);
      console.log(`📨 Found ${conversationMessages.length} messages for conversation ${conversationId}`);
      
      if (conversationMessages.length === 0) {
        console.log('ℹ️ No messages found for conversation - this is normal for a new conversation');
        setMessages([]);
        return;
      }
      
      // Sort messages by timestamp (oldest first)
      const sortedMessages = conversationMessages.sort((a, b) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
      
      console.log(`✅ Loaded ${sortedMessages.length} messages for conversation ${conversationId}`);
      setMessages(sortedMessages);
    } catch (err) {
      console.error(`❌ Failed to load messages for conversation ${conversationId}:`, err);
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  };

  const createDefaultConversation = async (): Promise<Conversation> => {
    if (!currentUser) {
      throw new Error('No current user available');
    }
    
    const defaultConversation: Conversation = {
      id: `default_${currentUser.id}_${Date.now()}`,
      participants: [currentUser],
      unreadCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    console.log('✅ Created default conversation:', defaultConversation);
    setConversations(prev => [...prev, defaultConversation]);
    return defaultConversation;
  };

  const sendMessage = async (content: string, conversationId: string) => {
    if (!currentUser) {
      console.error('❌ No current user available for sending message');
      return;
    }

    try {
      console.log('💬 Sending message:', { content, conversationId, sender: currentUser.id });
      
      // If no conversation is selected, create a default one
      let targetConversationId = conversationId;
      if (!conversationId || conversationId === '') {
        console.log('📝 No conversation ID provided, creating default conversation');
        const defaultConversation = await createDefaultConversation();
        targetConversationId = defaultConversation.id;
        setCurrentConversation(defaultConversation);
      }
      
      const message: Message = {
        id: crypto.randomUUID(),
        conversationId: targetConversationId,
        senderId: currentUser.id,
        content,
        timestamp: new Date(),
        messageType: 'text',
      };

      console.log('📤 Storing message in decentralized system...');
      
      // Store in decentralized system (Walrus + Smart Contract via Cometh)
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
          conv.id === targetConversationId 
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

      console.log(`💰 Payment Details:`);
      console.log(`   Amount: ${amount} ${token}`);
      console.log(`   Recipient: ${recipientAddress}`);

      // Use Cometh service to send payment
      const comethService = getComethService();
      const paymentResult = await comethService.sendPayment(
        recipientAddress,
        amount.toString(),
        token
      );

      if (!paymentResult.success) {
        throw new Error(paymentResult.error || 'Payment failed');
      }

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

      console.log(`💰 Money Request Payment Details:`);
      console.log(`   Requested amount: ${amount} ${token}`);
      console.log(`   Requester: ${requesterAddress}`);

      // Use Cometh service to send payment
      const comethService = getComethService();
      const paymentResult = await comethService.sendPayment(
        requesterAddress,
        amount.toString(),
        token
      );

      if (!paymentResult.success) {
        throw new Error(paymentResult.error || 'Payment failed');
      }

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
      
      // For now, just create a default conversation
      const newConversation = await createDefaultConversation();
      setCurrentConversation(newConversation);
    } catch (error) {
      console.log('Contact sharing cancelled by user');
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
      return [];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search messages');
      return [];
    }
  };

  const refreshMessageHistory = async () => {
    try {
      console.log('🔄 Refreshing message history...');
      setIsLoading(true);
      setError(null);
      
      if (!currentUser) {
        console.warn('⚠️ No current user available for refresh');
        return;
      }
      
      // Reload conversations
      await loadConversations(currentUser);
      
      // If there's a current conversation, reload its messages
      if (currentConversation) {
        console.log(`📨 Reloading messages for current conversation: ${currentConversation.id}`);
        await loadMessages(currentConversation.id);
      } else {
        // If no conversation is selected but we have conversations, select the first one
        if (conversations.length > 0) {
          console.log(`📋 Auto-selecting first conversation: ${conversations[0].id}`);
          selectConversation(conversations[0].id);
        }
      }
      
      console.log('✅ Message history refreshed successfully');
    } catch (err) {
      console.error('❌ Failed to refresh message history:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh message history');
    } finally {
      setIsLoading(false);
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
    createDefaultConversation,
    createConversationWithContacts,
    selectConversation,
    searchMessages,
    loadMessages,
    loadConversations,
    refreshMessageHistory,
    isCreatingConversation,
    safeAddress,
    isComethInitialized,
  };

  return (
    <MessagingContext.Provider value={value}>
      {children}
    </MessagingContext.Provider>
  );
}; 