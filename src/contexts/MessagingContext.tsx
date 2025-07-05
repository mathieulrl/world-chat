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
  createDefaultConversation: () => Promise<Conversation>;
  createConversationWithContacts: () => Promise<void>;
  selectConversation: (conversationId: string) => void;
  searchMessages: (query: string) => Promise<Message[]>;
  loadMessages: (conversationId: string) => Promise<void>;
  loadConversations: () => Promise<void>;
  refreshMessageHistory: () => Promise<void>;
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
  contractAddress: '0x34bF1A2460190e60e33309BF8c54D9A7c9eCB4B8', // Updated contract address
      network: 'mainnet', // Changed to mainnet
      rpcUrl: 'https://worldchain.drpc.org', // Updated to mainnet RPC
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
      
      // First, try to get message history to see if there are any messages
      try {
        const messageHistory = await decentralizedService.getMessageHistory(userToUse.address);
        console.log(`📨 Found ${messageHistory.length} messages for user`);
        
        if (messageHistory.length > 0) {
          // Extract unique conversation IDs from messages
          const conversationIds = new Set<string>();
          messageHistory.forEach((message: any) => {
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
            unreadCount: 0, // You can implement unread logic if needed
            createdAt: new Date(), // Use current date as fallback
            updatedAt: new Date(),
          }));
          
          console.log('✅ Created conversations from message history:', conversations);
          setConversations(conversations);
          return;
        }
      } catch (error) {
        console.log('⚠️ Failed to get message history:', error.message);
      }
      
      // Fallback: try to get conversations from smart contract
      try {
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
      } catch (error) {
        console.log('⚠️ Failed to get conversations from service:', error.message);
        console.log('ℹ️ Setting empty conversations array');
        setConversations([]);
      }
    } catch (err) {
      console.error('❌ Failed to load conversations:', err);
      // Don't set error for empty conversations - this is normal
      if (!err.message?.includes('returned no data')) {
        setError(err instanceof Error ? err.message : 'Failed to load conversations');
      }
      // Set empty conversations as fallback
      setConversations([]);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      setIsLoading(true);
      console.log(`📨 Loading messages for conversation: ${conversationId}`);
      
      // Use decentralized service to get messages
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
      
      // Don't set error for empty conversations - this is normal
      if (!err.message?.includes('returned no data') && !err.message?.includes('No messages found')) {
        setError(err instanceof Error ? err.message : 'Failed to load messages');
      }
      
      // Set empty messages as fallback
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
          conv.id === targetConversationId 
            ? { ...conv, lastMessage: message, updatedAt: new Date() }
            : conv
        )
      );
      console.log('✅ Message state updated successfully');
    } catch (err) {
      console.error('❌ Failed to send message:', err);
      
      // Provide a more detailed error message
      let errorMessage = 'Failed to send message';
      
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      } else if (err && typeof err === 'object') {
        // Try to extract meaningful error information
        if ('error' in err) {
          errorMessage = String(err.error);
        } else if ('message' in err) {
          errorMessage = String(err.message);
        } else {
          errorMessage = JSON.stringify(err);
        }
      }
      
      setError(errorMessage);
    }
  };

  const sendPayment = async (amount: number, token: 'WLD' | 'USDC', recipientAddress: string, conversationId: string) => {
    if (!currentUser) {
      console.error('No current user available');
      return;
    }

    try {
      setIsLoading(true);

      // Convert amount to decimals for MiniKit
      const tokenAmount = worldcoinService.tokenToDecimals(amount, token);
      const humanReadableAmount = parseInt(tokenAmount) / Math.pow(10, token === 'WLD' ? 8 : 6);
      
      console.log(`💰 Payment Details:`);
      console.log(`   Input amount: ${amount} ${token}`);
      console.log(`   Decimal amount: ${tokenAmount}`);
      console.log(`   Human readable: ${humanReadableAmount} ${token}`);
      console.log(`   Recipient: ${recipientAddress}`);

      // Initiate payment
      const { id: reference } = await worldcoinService.initiatePayment();

      // Create payment request
      const paymentRequest: PaymentRequest = {
        reference,
        to: recipientAddress,
        tokens: [{
          symbol: token,
          token_amount: tokenAmount,
        }],
        description: `Payment from ${currentUser.username}: ${amount} ${token}`,
      };

      console.log(`📋 Payment Request:`);
      console.log(`   Reference: ${reference}`);
      console.log(`   To: ${recipientAddress}`);
      console.log(`   Token: ${token}`);
      console.log(`   Amount (decimal): ${tokenAmount}`);
      console.log(`   Amount (human): ${amount} ${token}`);
      console.log(`   Description: ${paymentRequest.description}`);

      // Execute payment
      const paymentResult = await worldcoinService.executePayment(paymentRequest);
      console.log('Payment executed:', paymentResult);

      // Create payment message with both amounts for clarity
      const paymentMessage: Message = {
        id: crypto.randomUUID(),
        conversationId,
        senderId: currentUser.id,
        content: `Sent ${amount} ${token} to ${recipientAddress} (${tokenAmount} decimals)`,
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

      // Convert amount to decimals for MiniKit
      const tokenAmount = worldcoinService.tokenToDecimals(amount, token);
      const humanReadableAmount = parseInt(tokenAmount) / Math.pow(10, token === 'WLD' ? 8 : 6);
      
      console.log(`💰 Money Request Payment Details:`);
      console.log(`   Requested amount: ${amount} ${token}`);
      console.log(`   Decimal amount: ${tokenAmount}`);
      console.log(`   Human readable: ${humanReadableAmount} ${token}`);
      console.log(`   Requester: ${requesterAddress}`);

      // Execute payment to the requester
      const { id: reference } = await worldcoinService.initiatePayment();
      const paymentRequest: PaymentRequest = {
        reference,
        to: requesterAddress,
        tokens: [{
          symbol: token,
          token_amount: tokenAmount,
        }],
        description: `Payment for money request: ${amount} ${token}`,
      };

      console.log(`📋 Money Request Payment:`);
      console.log(`   Reference: ${reference}`);
      console.log(`   To: ${requesterAddress}`);
      console.log(`   Token: ${token}`);
      console.log(`   Amount (decimal): ${tokenAmount}`);
      console.log(`   Amount (human): ${amount} ${token}`);
      console.log(`   Description: ${paymentRequest.description}`);

      const paymentResult = await worldcoinService.executePayment(paymentRequest);
      console.log('Payment executed for money request:', paymentResult);

      // Create acceptance message with both amounts for clarity
      const acceptanceMessage: Message = {
        id: crypto.randomUUID(),
        conversationId,
        senderId: currentUser.id,
        content: `Accepted money request: ${amount} ${token} (${tokenAmount} decimals)`,
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
  };

  return (
    <MessagingContext.Provider value={value}>
      {children}
    </MessagingContext.Provider>
  );
}; 