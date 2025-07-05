import { ChatterboxUser } from '../types/users';

export const CHATTERBOX_USERS: ChatterboxUser[] = [
  {
    id: 'ewan.1300.world.id',
    username: 'ewan.1300.world.id',
    walletAddress: '0xa882a2af989de54330f994cf626ea7f5d5edc2fc', // Placeholder
    profilePicture: 'https://via.placeholder.com/150/10B981/FFFFFF?text=E',
    isOnline: false,
    lastSeen: new Date(),
    permissions: {
      canSendMessages: true,
      canReceivePayments: true,
      canRequestPayments: true,
    },
  },
  {
    id: 'mathieu.3580.world.id',
    username: 'mathieu.3580.world.id',
    walletAddress: '0x582be5da7d06b2bf6d89c5b4499491c5990fafe4',
    profilePicture: 'https://via.placeholder.com/150/F59E0B/FFFFFF?text=M',
    isOnline: false,
    lastSeen: new Date(),
    permissions: {
      canSendMessages: true,
      canReceivePayments: true,
      canRequestPayments: true,
    },
  },
];

export const getUserById = (id: string): ChatterboxUser | undefined => {
  return CHATTERBOX_USERS.find(user => user.id === id);
};

export const getUserByUsername = (username: string): ChatterboxUser | undefined => {
  return CHATTERBOX_USERS.find(user => user.username === username);
};

export const getUserByWalletAddress = (walletAddress: string): ChatterboxUser | undefined => {
  return CHATTERBOX_USERS.find(user => user.walletAddress?.toLowerCase() === walletAddress.toLowerCase());
};

export const getAllUsers = (): ChatterboxUser[] => {
  return CHATTERBOX_USERS;
};

export const getOnlineUsers = (): ChatterboxUser[] => {
  return CHATTERBOX_USERS.filter(user => user.isOnline);
};

export const updateUserStatus = (userId: string, isOnline: boolean): void => {
  const user = getUserById(userId);
  if (user) {
    user.isOnline = isOnline;
    user.lastSeen = new Date();
  }
};

export const updateUserWalletAddress = (userId: string, walletAddress: string): void => {
  const user = getUserById(userId);
  if (user) {
    user.walletAddress = walletAddress;
  }
}; 