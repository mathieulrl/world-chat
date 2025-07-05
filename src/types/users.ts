export interface ChatterboxUser {
  id: string;
  username: string;
  walletAddress?: string;
  profilePicture?: string;
  isOnline?: boolean;
  lastSeen?: Date;
  permissions?: {
    canSendMessages: boolean;
    canReceivePayments: boolean;
    canRequestPayments: boolean;
  };
}

export interface UserSession {
  userId: string;
  isConnected: boolean;
  connectionTime?: Date;
  lastActivity?: Date;
}

export interface UserPreferences {
  userId: string;
  theme: 'light' | 'dark' | 'auto';
  notifications: {
    messages: boolean;
    payments: boolean;
    requests: boolean;
  };
  privacy: {
    showOnlineStatus: boolean;
    allowContactRequests: boolean;
  };
} 