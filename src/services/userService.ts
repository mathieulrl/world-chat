import { ChatterboxUser, UserSession, UserPreferences } from '../types/users';
import { 
  getUserById, 
  getUserByUsername, 
  getUserByWalletAddress, 
  getAllUsers, 
  getOnlineUsers,
  updateUserStatus,
  updateUserWalletAddress 
} from '../data/users';
import { WorldcoinService } from './worldcoinService';

export class UserService {
  private static instance: UserService;
  private worldcoinService: WorldcoinService;
  private currentUser: ChatterboxUser | null = null;
  private userSessions: Map<string, UserSession> = new Map();
  private userPreferences: Map<string, UserPreferences> = new Map();

  private constructor() {
    this.worldcoinService = WorldcoinService.getInstance();
  }

  public static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  /**
   * Initialize user service and sync with Worldcoin MiniKit
   */
  async initialize(): Promise<void> {
    try {
      console.log('Initializing User Service...');
      
      // Initialize Worldcoin MiniKit
      await this.worldcoinService.initializeMiniKit();
      
      // Try to get current user from MiniKit
      const minikitUser = await this.worldcoinService.getCurrentUser();
      
      if (minikitUser) {
        // Try to find matching user in our system
        const existingUser = getUserByWalletAddress(minikitUser.address) || 
                           getUserByUsername(minikitUser.username);
        
        if (existingUser) {
          this.currentUser = existingUser;
          // Update wallet address if it changed
          if (existingUser.walletAddress !== minikitUser.address) {
            updateUserWalletAddress(existingUser.id, minikitUser.address);
            existingUser.walletAddress = minikitUser.address;
          }
          console.log(`✅ User connected: ${existingUser.username}`);
        } else {
          // Create new user from MiniKit
          const newUser: ChatterboxUser = {
            id: minikitUser.username,
            username: minikitUser.username,
            walletAddress: minikitUser.address,
            profilePicture: minikitUser.profilePicture,
            isOnline: true,
            lastSeen: new Date(),
            permissions: {
              canSendMessages: true,
              canReceivePayments: true,
              canRequestPayments: true,
            },
          };
          this.currentUser = newUser;
          console.log(`✅ New user connected: ${newUser.username}`);
        }
      } else {
        console.log('⚠️ No user connected to Worldcoin MiniKit');
      }
      
      console.log('✅ User Service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize User Service:', error);
    }
  }

  /**
   * Get current user
   */
  getCurrentUser(): ChatterboxUser | null {
    return this.currentUser;
  }

  /**
   * Set current user
   */
  setCurrentUser(user: ChatterboxUser): void {
    this.currentUser = user;
    updateUserStatus(user.id, true);
  }

  /**
   * Get user by ID
   */
  getUserById(id: string): ChatterboxUser | undefined {
    return getUserById(id);
  }

  /**
   * Get user by username
   */
  getUserByUsername(username: string): ChatterboxUser | undefined {
    return getUserByUsername(username);
  }

  /**
   * Get user by wallet address
   */
  getUserByWalletAddress(walletAddress: string): ChatterboxUser | undefined {
    return getUserByWalletAddress(walletAddress);
  }

  /**
   * Get all users
   */
  getAllUsers(): ChatterboxUser[] {
    return getAllUsers();
  }

  /**
   * Get online users
   */
  getOnlineUsers(): ChatterboxUser[] {
    return getOnlineUsers();
  }

  /**
   * Get user session
   */
  getUserSession(userId: string): UserSession | undefined {
    return this.userSessions.get(userId);
  }

  /**
   * Update user session
   */
  updateUserSession(userId: string, session: Partial<UserSession>): void {
    const existingSession = this.userSessions.get(userId) || {
      userId,
      isConnected: false,
    };
    
    this.userSessions.set(userId, {
      ...existingSession,
      ...session,
      lastActivity: new Date(),
    });
  }

  /**
   * Get user preferences
   */
  getUserPreferences(userId: string): UserPreferences | undefined {
    return this.userPreferences.get(userId);
  }

  /**
   * Update user preferences
   */
  updateUserPreferences(userId: string, preferences: Partial<UserPreferences>): void {
    const existingPreferences = this.userPreferences.get(userId) || {
      userId,
      theme: 'auto',
      notifications: {
        messages: true,
        payments: true,
        requests: true,
      },
      privacy: {
        showOnlineStatus: true,
        allowContactRequests: true,
      },
    };
    
    this.userPreferences.set(userId, {
      ...existingPreferences,
      ...preferences,
    });
  }

  /**
   * Sync user with Worldcoin MiniKit
   */
  async syncWithMiniKit(): Promise<void> {
    try {
      const minikitUser = await this.worldcoinService.getCurrentUser();
      
      if (minikitUser && this.currentUser) {
        // Update current user with MiniKit data
        this.currentUser.walletAddress = minikitUser.address;
        this.currentUser.profilePicture = minikitUser.profilePicture;
        updateUserWalletAddress(this.currentUser.id, minikitUser.address);
        
        console.log(`✅ User synced with MiniKit: ${this.currentUser.username}`);
      }
    } catch (error) {
      console.error('Failed to sync with MiniKit:', error);
    }
  }

  /**
   * Get user contacts from Worldcoin MiniKit
   */
  async getUserContacts(): Promise<ChatterboxUser[]> {
    try {
      const contacts = await this.worldcoinService.getContacts();
      
      // Map MiniKit contacts to our user format
      return contacts.map(contact => ({
        id: contact.username || contact.address,
        username: contact.username || `${contact.address.slice(0, 6)}...${contact.address.slice(-4)}`,
        walletAddress: contact.address,
        profilePicture: contact.profilePicture,
        isOnline: false,
        lastSeen: new Date(),
        permissions: {
          canSendMessages: true,
          canReceivePayments: true,
          canRequestPayments: true,
        },
      }));
    } catch (error) {
      console.error('Failed to get user contacts:', error);
      return [];
    }
  }

  /**
   * Check if user can perform action
   */
  canUserPerformAction(userId: string, action: 'sendMessages' | 'receivePayments' | 'requestPayments'): boolean {
    const user = getUserById(userId);
    if (!user) return false;
    
    switch (action) {
      case 'sendMessages':
        return user.permissions?.canSendMessages || false;
      case 'receivePayments':
        return user.permissions?.canReceivePayments || false;
      case 'requestPayments':
        return user.permissions?.canRequestPayments || false;
      default:
        return false;
    }
  }

  /**
   * Get user display name
   */
  getUserDisplayName(user: ChatterboxUser): string {
    return user.username || user.walletAddress?.slice(0, 6) + '...' + user.walletAddress?.slice(-4) || 'Unknown User';
  }

  /**
   * Get user avatar
   */
  getUserAvatar(user: ChatterboxUser): string {
    return user.profilePicture || `https://via.placeholder.com/150/6B7280/FFFFFF?text=${user.username?.charAt(0).toUpperCase() || 'U'}`;
  }

  /**
   * Disconnect current user
   */
  disconnectCurrentUser(): void {
    if (this.currentUser) {
      updateUserStatus(this.currentUser.id, false);
      this.currentUser = null;
      console.log('✅ User disconnected');
    }
  }
} 