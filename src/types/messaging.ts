export interface User {
  id: string;
  username: string;
  address: string;
  profilePicture?: string;
}

export interface PaymentData {
  amount: number;
  token: 'WLD' | 'USDC';
  recipientAddress: string;
  transactionHash: string;
  status: 'pending' | 'completed' | 'failed';
}

export interface MoneyRequest {
  id: string;
  amount: number;
  token: 'WLD' | 'USDC';
  description: string;
  requesterId: string;
  requesterAddress: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: Date;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  timestamp: Date;
  messageType: 'text' | 'payment' | 'payment_request';
  paymentData?: PaymentData;
  moneyRequestData?: MoneyRequest;
  // Legacy fields for backward compatibility
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

export interface WalrusMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  timestamp: string;
  messageType: 'text' | 'payment' | 'payment_request';
  paymentData?: PaymentData;
  moneyRequestData?: MoneyRequest;
  // Legacy fields for backward compatibility
  paymentAmount?: number;
  paymentToken?: 'WLD' | 'USDC';
  paymentReference?: string;
  paymentStatus?: 'pending' | 'success' | 'failed';
  requestStatus?: 'pending' | 'accepted' | 'declined';
} 