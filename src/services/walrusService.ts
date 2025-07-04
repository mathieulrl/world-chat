import { Message, WalrusMessage } from '../types/messaging';

// Mock Walrus client for development
// TODO: Replace with actual Walrus API when available
class MockWalrusClient {
  private storage: Map<string, any[]> = new Map();

  async store(params: { collection: string; data: any; metadata?: any }) {
    const { collection, data } = params;
    if (!this.storage.has(collection)) {
      this.storage.set(collection, []);
    }
    this.storage.get(collection)!.push(data);
  }

  async search(params: { collection: string; query: string; limit: number; sort?: any }) {
    const { collection, query, limit } = params;
    const data = this.storage.get(collection) || [];
    
    // Simple filtering based on query
    const filtered = data.filter(item => {
      if (query.includes('conversationId:')) {
        const conversationId = query.split('conversationId:')[1];
        return item.conversationId === conversationId;
      }
      return item.content.toLowerCase().includes(query.toLowerCase());
    });

    // Sort by timestamp desc
    const sorted = filtered.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return {
      results: sorted.slice(0, limit).map(item => ({ data: item }))
    };
  }

  async update(params: { collection: string; id: string; data: any }) {
    const { collection, id, data } = params;
    const items = this.storage.get(collection) || [];
    const index = items.findIndex(item => item.id === id);
    if (index !== -1) {
      items[index] = { ...items[index], ...data };
    }
  }
}

// Initialize mock Walrus client for development
const walrusClient = new MockWalrusClient();

export class WalrusMessageService {
  private static instance: WalrusMessageService;
  
  private constructor() {}
  
  public static getInstance(): WalrusMessageService {
    if (!WalrusMessageService.instance) {
      WalrusMessageService.instance = new WalrusMessageService();
    }
    return WalrusMessageService.instance;
  }

  async storeMessage(message: Message): Promise<void> {
    const walrusMessage: WalrusMessage = {
      ...message,
      timestamp: message.timestamp.toISOString(),
    };

    try {
      await walrusClient.store({
        collection: 'messages',
        data: walrusMessage,
        metadata: {
          conversationId: message.conversationId,
          senderId: message.senderId,
          messageType: message.messageType,
        },
      });
    } catch (error) {
      console.error('Failed to store message in Walrus:', error);
      throw error;
    }
  }

  async getMessages(conversationId: string, limit: number = 50): Promise<Message[]> {
    try {
      const response = await walrusClient.search({
        collection: 'messages',
        query: `conversationId:${conversationId}`,
        limit,
        sort: { timestamp: 'desc' },
      });

      return response.results.map((result) => ({
        ...result.data,
        timestamp: new Date(result.data.timestamp),
      })) as Message[];
    } catch (error) {
      console.error('Failed to retrieve messages from Walrus:', error);
      throw error;
    }
  }

  async searchMessages(query: string, conversationId?: string): Promise<Message[]> {
    try {
      const searchQuery = conversationId 
        ? `${query} AND conversationId:${conversationId}`
        : query;

      const response = await walrusClient.search({
        collection: 'messages',
        query: searchQuery,
        limit: 20,
        sort: { timestamp: 'desc' },
      });

      return response.results.map((result) => ({
        ...result.data,
        timestamp: new Date(result.data.timestamp),
      })) as Message[];
    } catch (error) {
      console.error('Failed to search messages in Walrus:', error);
      throw error;
    }
  }

  async updateMessageStatus(messageId: string, status: 'pending' | 'success' | 'failed' | 'accepted' | 'declined'): Promise<void> {
    try {
      await walrusClient.update({
        collection: 'messages',
        id: messageId,
        data: { 
          paymentStatus: status === 'accepted' ? 'success' : status === 'declined' ? 'failed' : status,
          requestStatus: status === 'accepted' || status === 'declined' ? status : undefined,
        },
      });
    } catch (error) {
      console.error('Failed to update message status in Walrus:', error);
      throw error;
    }
  }
} 