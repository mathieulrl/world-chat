import { Message, PaymentData, MoneyRequest } from '../types/messaging';

export interface MongoDBConfig {
  connectionString: string;
  databaseName: string;
  collections: {
    messages: string;
    payments: string;
    paymentRequests: string;
  };
}

export interface MessageRecord {
  _id?: string;
  messageId: string;
  conversationId: string;
  senderId: string;
  senderAddress: string;
  content: string;
  timestamp: Date;
  messageType: 'text' | 'payment' | 'payment_request';
  paymentData?: PaymentData;
  moneyRequestData?: MoneyRequest;
  walrusBlobId?: string;
  contractTxHash?: string;
  status: 'pending' | 'stored' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentRecord {
  _id?: string;
  paymentId: string;
  messageId: string;
  conversationId: string;
  senderId: string;
  senderAddress: string;
  recipientAddress: string;
  amount: number;
  token: 'WLD' | 'USDC';
  description?: string;
  transactionHash?: string;
  status: 'pending' | 'completed' | 'failed';
  walrusBlobId?: string;
  contractTxHash?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentRequestRecord {
  _id?: string;
  requestId: string;
  messageId: string;
  conversationId: string;
  requesterId: string;
  requesterAddress: string;
  amount: number;
  token: 'WLD' | 'USDC';
  description: string;
  status: 'pending' | 'accepted' | 'declined';
  responseTransactionHash?: string;
  walrusBlobId?: string;
  contractTxHash?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class MongoDBService {
  private config: MongoDBConfig;
  private isConnected: boolean = false;
  private client: any;

  constructor(config: MongoDBConfig) {
    this.config = config;
  }

  /**
   * Initialize MongoDB connection
   */
  async initialize(): Promise<void> {
    try {
      console.log('🔌 Initializing MongoDB connection...');
      
      // Dynamic import for MongoDB driver
      const { MongoClient } = await import('mongodb');
      
      this.client = new MongoClient(this.config.connectionString);
      await this.client.connect();
      
      this.isConnected = true;
      console.log('✅ MongoDB connected successfully');
      
      // Create indexes for better performance
      await this.createIndexes();
      
    } catch (error) {
      console.error('❌ Failed to connect to MongoDB:', error);
      throw error;
    }
  }

  /**
   * Create database indexes for better performance
   */
  private async createIndexes(): Promise<void> {
    try {
      const db = this.client.db(this.config.databaseName);
      
      // Messages collection indexes
      const messagesCollection = db.collection(this.config.collections.messages);
      await messagesCollection.createIndex({ senderId: 1 });
      await messagesCollection.createIndex({ conversationId: 1 });
      await messagesCollection.createIndex({ timestamp: -1 });
      await messagesCollection.createIndex({ status: 1 });
      
      // Payments collection indexes
      const paymentsCollection = db.collection(this.config.collections.payments);
      await paymentsCollection.createIndex({ senderId: 1 });
      await paymentsCollection.createIndex({ recipientAddress: 1 });
      await paymentsCollection.createIndex({ status: 1 });
      await paymentsCollection.createIndex({ createdAt: -1 });
      
      // Payment requests collection indexes
      const paymentRequestsCollection = db.collection(this.config.collections.paymentRequests);
      await paymentRequestsCollection.createIndex({ requesterId: 1 });
      await paymentRequestsCollection.createIndex({ conversationId: 1 });
      await paymentRequestsCollection.createIndex({ status: 1 });
      await paymentRequestsCollection.createIndex({ createdAt: -1 });
      
      console.log('✅ MongoDB indexes created successfully');
    } catch (error) {
      console.warn('⚠️ Failed to create MongoDB indexes:', error);
    }
  }

  /**
   * Store a message record before sending to Walrus/contract
   */
  async storeMessageRecord(message: Message, senderAddress: string): Promise<string> {
    try {
      if (!this.isConnected) {
        await this.initialize();
      }

      const db = this.client.db(this.config.databaseName);
      const collection = db.collection(this.config.collections.messages);

      const messageRecord: MessageRecord = {
        messageId: message.id,
        conversationId: message.conversationId,
        senderId: message.senderId,
        senderAddress: senderAddress,
        content: message.content,
        timestamp: message.timestamp,
        messageType: message.messageType,
        paymentData: message.paymentData,
        moneyRequestData: message.moneyRequestData,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await collection.insertOne(messageRecord);
      console.log(`📝 Message record stored in MongoDB: ${result.insertedId}`);
      
      return result.insertedId.toString();
    } catch (error) {
      console.error('❌ Failed to store message record in MongoDB:', error);
      throw error;
    }
  }

  /**
   * Update message record with Walrus blob ID and contract transaction hash
   */
  async updateMessageRecord(
    messageId: string, 
    walrusBlobId?: string, 
    contractTxHash?: string, 
    status: 'pending' | 'stored' | 'failed' = 'stored'
  ): Promise<void> {
    try {
      if (!this.isConnected) {
        await this.initialize();
      }

      const db = this.client.db(this.config.databaseName);
      const collection = db.collection(this.config.collections.messages);

      const updateData: any = {
        status,
        updatedAt: new Date(),
      };

      if (walrusBlobId) {
        updateData.walrusBlobId = walrusBlobId;
      }

      if (contractTxHash) {
        updateData.contractTxHash = contractTxHash;
      }

      const result = await collection.updateOne(
        { messageId },
        { $set: updateData }
      );

      if (result.matchedCount > 0) {
        console.log(`✅ Message record updated in MongoDB: ${messageId}`);
      } else {
        console.warn(`⚠️ Message record not found in MongoDB: ${messageId}`);
      }
    } catch (error) {
      console.error('❌ Failed to update message record in MongoDB:', error);
      throw error;
    }
  }

  /**
   * Store a payment record
   */
  async storePaymentRecord(
    paymentId: string,
    messageId: string,
    conversationId: string,
    senderId: string,
    senderAddress: string,
    recipientAddress: string,
    amount: number,
    token: 'WLD' | 'USDC',
    description?: string
  ): Promise<string> {
    try {
      if (!this.isConnected) {
        await this.initialize();
      }

      const db = this.client.db(this.config.databaseName);
      const collection = db.collection(this.config.collections.payments);

      const paymentRecord: PaymentRecord = {
        paymentId,
        messageId,
        conversationId,
        senderId,
        senderAddress,
        recipientAddress,
        amount,
        token,
        description,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await collection.insertOne(paymentRecord);
      console.log(`💰 Payment record stored in MongoDB: ${result.insertedId}`);
      
      return result.insertedId.toString();
    } catch (error) {
      console.error('❌ Failed to store payment record in MongoDB:', error);
      throw error;
    }
  }

  /**
   * Update payment record with transaction hash
   */
  async updatePaymentRecord(
    paymentId: string,
    transactionHash?: string,
    status: 'pending' | 'completed' | 'failed' = 'completed'
  ): Promise<void> {
    try {
      if (!this.isConnected) {
        await this.initialize();
      }

      const db = this.client.db(this.config.databaseName);
      const collection = db.collection(this.config.collections.payments);

      const updateData: any = {
        status,
        updatedAt: new Date(),
      };

      if (transactionHash) {
        updateData.transactionHash = transactionHash;
      }

      const result = await collection.updateOne(
        { paymentId },
        { $set: updateData }
      );

      if (result.matchedCount > 0) {
        console.log(`✅ Payment record updated in MongoDB: ${paymentId}`);
      } else {
        console.warn(`⚠️ Payment record not found in MongoDB: ${paymentId}`);
      }
    } catch (error) {
      console.error('❌ Failed to update payment record in MongoDB:', error);
      throw error;
    }
  }

  /**
   * Store a payment request record
   */
  async storePaymentRequestRecord(
    requestId: string,
    messageId: string,
    conversationId: string,
    requesterId: string,
    requesterAddress: string,
    amount: number,
    token: 'WLD' | 'USDC',
    description: string
  ): Promise<string> {
    try {
      if (!this.isConnected) {
        await this.initialize();
      }

      const db = this.client.db(this.config.databaseName);
      const collection = db.collection(this.config.collections.paymentRequests);

      const paymentRequestRecord: PaymentRequestRecord = {
        requestId,
        messageId,
        conversationId,
        requesterId,
        requesterAddress,
        amount,
        token,
        description,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await collection.insertOne(paymentRequestRecord);
      console.log(`📋 Payment request record stored in MongoDB: ${result.insertedId}`);
      
      return result.insertedId.toString();
    } catch (error) {
      console.error('❌ Failed to store payment request record in MongoDB:', error);
      throw error;
    }
  }

  /**
   * Update payment request record with response
   */
  async updatePaymentRequestRecord(
    requestId: string,
    status: 'pending' | 'accepted' | 'declined',
    responseTransactionHash?: string
  ): Promise<void> {
    try {
      if (!this.isConnected) {
        await this.initialize();
      }

      const db = this.client.db(this.config.databaseName);
      const collection = db.collection(this.config.collections.paymentRequests);

      const updateData: any = {
        status,
        updatedAt: new Date(),
      };

      if (responseTransactionHash) {
        updateData.responseTransactionHash = responseTransactionHash;
      }

      const result = await collection.updateOne(
        { requestId },
        { $set: updateData }
      );

      if (result.matchedCount > 0) {
        console.log(`✅ Payment request record updated in MongoDB: ${requestId}`);
      } else {
        console.warn(`⚠️ Payment request record not found in MongoDB: ${requestId}`);
      }
    } catch (error) {
      console.error('❌ Failed to update payment request record in MongoDB:', error);
      throw error;
    }
  }

  /**
   * Get message history from MongoDB
   */
  async getMessageHistory(userAddress: string): Promise<MessageRecord[]> {
    try {
      if (!this.isConnected) {
        await this.initialize();
      }

      const db = this.client.db(this.config.databaseName);
      const collection = db.collection(this.config.collections.messages);

      const messages = await collection
        .find({ senderAddress: userAddress })
        .sort({ timestamp: -1 })
        .toArray();

      console.log(`📨 Retrieved ${messages.length} messages from MongoDB for user: ${userAddress}`);
      return messages as MessageRecord[];
    } catch (error) {
      console.error('❌ Failed to get message history from MongoDB:', error);
      throw error;
    }
  }

  /**
   * Get conversation messages from MongoDB
   */
  async getConversationMessages(conversationId: string): Promise<MessageRecord[]> {
    try {
      if (!this.isConnected) {
        await this.initialize();
      }

      const db = this.client.db(this.config.databaseName);
      const collection = db.collection(this.config.collections.messages);

      const messages = await collection
        .find({ conversationId })
        .sort({ timestamp: -1 })
        .toArray();

      console.log(`📨 Retrieved ${messages.length} messages from MongoDB for conversation: ${conversationId}`);
      return messages as MessageRecord[];
    } catch (error) {
      console.error('❌ Failed to get conversation messages from MongoDB:', error);
      throw error;
    }
  }

  /**
   * Get payment history from MongoDB
   */
  async getPaymentHistory(userAddress: string): Promise<PaymentRecord[]> {
    try {
      if (!this.isConnected) {
        await this.initialize();
      }

      const db = this.client.db(this.config.databaseName);
      const collection = db.collection(this.config.collections.payments);

      const payments = await collection
        .find({ 
          $or: [
            { senderAddress: userAddress },
            { recipientAddress: userAddress }
          ]
        })
        .sort({ createdAt: -1 })
        .toArray();

      console.log(`💰 Retrieved ${payments.length} payments from MongoDB for user: ${userAddress}`);
      return payments as PaymentRecord[];
    } catch (error) {
      console.error('❌ Failed to get payment history from MongoDB:', error);
      throw error;
    }
  }

  /**
   * Get payment request history from MongoDB
   */
  async getPaymentRequestHistory(userAddress: string): Promise<PaymentRequestRecord[]> {
    try {
      if (!this.isConnected) {
        await this.initialize();
      }

      const db = this.client.db(this.config.databaseName);
      const collection = db.collection(this.config.collections.paymentRequests);

      const paymentRequests = await collection
        .find({ requesterAddress: userAddress })
        .sort({ createdAt: -1 })
        .toArray();

      console.log(`📋 Retrieved ${paymentRequests.length} payment requests from MongoDB for user: ${userAddress}`);
      return paymentRequests as PaymentRequestRecord[];
    } catch (error) {
      console.error('❌ Failed to get payment request history from MongoDB:', error);
      throw error;
    }
  }

  /**
   * Close MongoDB connection
   */
  async close(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.isConnected = false;
      console.log('🔌 MongoDB connection closed');
    }
  }
}

// Singleton instance
let mongoDBServiceInstance: MongoDBService | null = null;

export const getMongoDBService = (config?: MongoDBConfig): MongoDBService => {
  if (!mongoDBServiceInstance) {
    if (!config) {
      // Default configuration
      config = {
        connectionString: import.meta.env.VITE_MONGODB_URI || 'mongodb://localhost:27017',
        databaseName: import.meta.env.VITE_MONGODB_DATABASE || 'chatterbox',
        collections: {
          messages: 'messages',
          payments: 'payments',
          paymentRequests: 'payment_requests',
        },
      };
    }
    mongoDBServiceInstance = new MongoDBService(config);
  }
  return mongoDBServiceInstance;
}; 