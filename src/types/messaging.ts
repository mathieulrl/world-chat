export interface User {
  id: string;
  username: string;
  address: string;
  profilePicture?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  timestamp: Date;
  messageType: 'text' | 'payment' | 'payment_request';
  paymentAmount?: number;
  paymentToken?: 'WLD' | 'USDC';
  paymentReference?: string;
  paymentStatus?: 'pending' | 'success' | 'failed';
  requestStatus?: 'pending' | 'accepted' | 'declined';
}

export interface Conversation {
  id: string;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentRequest {
  reference: string;
  to: string;
  tokens: {
    symbol: 'WLD' | 'USDC';
    token_amount: string;
  }[];
  description: string;
}

export interface MoneyRequest {
  amount: number;
  token: 'WLD' | 'USDC';
  description?: string;
  requestId: string;
}

export interface WalrusMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  timestamp: string;
  messageType: 'text' | 'payment' | 'payment_request';
  paymentAmount?: number;
  paymentToken?: 'WLD' | 'USDC';
  paymentReference?: string;
  paymentStatus?: 'pending' | 'success' | 'failed';
  requestStatus?: 'pending' | 'accepted' | 'declined';
} 