export interface MongoDBConfig {
  connectionString: string;
  databaseName: string;
  collections: {
    messages: string;
    payments: string;
    paymentRequests: string;
  };
}

// Environment variables for MongoDB
export const MONGODB_CONFIG: MongoDBConfig = {
  connectionString: import.meta.env.VITE_MONGODB_URI || 'mongodb://localhost:27017',
  databaseName: import.meta.env.VITE_MONGODB_DATABASE || 'chatterbox',
  collections: {
    messages: 'messages',
    payments: 'payments',
    paymentRequests: 'payment_requests',
  },
};

// Validate configuration
export const validateMongoDBConfig = (config: MongoDBConfig): boolean => {
  const missingVars = [];
  
  if (!config.connectionString) missingVars.push('VITE_MONGODB_URI');
  if (!config.databaseName) missingVars.push('VITE_MONGODB_DATABASE');
  
  if (missingVars.length > 0) {
    console.error('❌ Missing MongoDB environment variables:', missingVars.join(', '));
    console.log('📋 Required environment variables:');
    console.log('  VITE_MONGODB_URI=mongodb://localhost:27017');
    console.log('  VITE_MONGODB_DATABASE=chatterbox');
    return false;
  }
  
  return true;
};

// Get validated config
export const getMongoDBConfig = (): MongoDBConfig => {
  if (!validateMongoDBConfig(MONGODB_CONFIG)) {
    throw new Error('Invalid MongoDB configuration. Please check your environment variables.');
  }
  return MONGODB_CONFIG;
}; 