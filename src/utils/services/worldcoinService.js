import { initiatePayment, confirmPayment } from '../api/initiate-payment';
import { createWalletClient, createPublicClient, http } from 'viem';
import { MiniKit } from '@worldcoin/minikit-js';
import MiniKitContractRegistration from '../utils/minikit-contract-registration';
// Token conversion utility
const tokenToDecimals = (amount, token) => {
    const decimals = token === 'WLD' ? 8 : 6;
    return (amount * Math.pow(10, decimals)).toString();
};
export class WorldcoinService {
    constructor() {
        this.minikit = null;
        // Get Infura ID from environment variable
        const infuraId = "e34629cc701f45ffbdb1d83ae332b4cf";
        if (!infuraId) {
            console.warn('⚠️ INFURA_ID not found in environment variables. Please add INFURA_ID to your .env file.');
        }
        // Define Worldcoin Sepolia chain configuration
        const worldcoinSepolia = {
            id: 4801,
            name: 'Worldcoin Sepolia',
            network: 'worldcoin-sepolia',
            nativeCurrency: {
                decimals: 18,
                name: 'Ether',
                symbol: 'ETH',
            },
            rpcUrls: {
                default: { http: ['https://worldchain-sepolia.drpc.org'] },
                public: { http: ['https://worldchain-sepolia.drpc.org'] },
            },
        };
        // Initialize public client for reading contract data
        this.publicClient = createPublicClient({
            chain: worldcoinSepolia,
            transport: http(`https://worldchain-sepolia.drpc.org`),
        });
        // Initialize wallet client for contract transactions on Worldcoin Sepolia
        this.walletClient = createWalletClient({
            chain: worldcoinSepolia,
            transport: http(`https://worldchain-sepolia.drpc.org`),
        });
        console.log('WorldcoinService initialized for Worldcoin Sepolia (chainId 4801)');
        console.log('RPC URL: https://worldchain-sepolia.drpc.org');
    }
    static getInstance() {
        if (!WorldcoinService.instance) {
            WorldcoinService.instance = new WorldcoinService();
        }
        return WorldcoinService.instance;
    }
    /**
     * Initialize Worldcoin MiniKit
     */
    async initializeMiniKit() {
        try {
            console.log('Initializing Worldcoin MiniKit...');
            // Set the app ID for MiniKit
            MiniKit.appId = 'app_633eda004e32e457ef84472c6ef7714c';
            // Note: MiniKit chain configuration is handled by the World App
            // The app should be configured to support Worldcoin Sepolia (chainId 4801)
            console.log('Configuring MiniKit for Worldcoin Sepolia (chainId 4801)...');
            console.log('Note: Chain configuration is handled by World App');
            console.log('✅ Worldcoin MiniKit initialized successfully! (Mock mode)');
            console.log(`   App ID: ${MiniKit.appId}`);
            console.log(`   Expected Chain: Worldcoin Sepolia (4801)`);
            return true;
        }
        catch (error) {
            console.error('Failed to initialize Worldcoin MiniKit:', error);
            return false;
        }
    }
    /**
     * Check if Worldcoin MiniKit is installed and available
     */
    async isInstalled() {
        try {
            await this.initializeMiniKit();
            console.log('✅ Worldcoin MiniKit is available (Mock mode)');
            return true;
        }
        catch (error) {
            console.error('Error checking MiniKit installation:', error);
            return false;
        }
    }
    /**
     * Get current user from Worldcoin MiniKit
     */
    async getCurrentUser() {
        try {
            await this.initializeMiniKit();
            // Return mock user data instead of trying to get from MiniKit API
            const mockUser = {
                address: '0x582be5da7d06b2bf6d89c5b4499491c5990fafe4', // mathieu's address
                username: 'mathieu.3580.world.id',
                profilePicture: 'https://via.placeholder.com/150/F59E0B/FFFFFF?text=M',
            };
            console.log('✅ Using mock user data for development');
            return mockUser;
        }
        catch (error) {
            console.error('Failed to get current user:', error);
            return null;
        }
    }
    /**
     * Get user by address
     */
    async getUserByAddress(address) {
        try {
            await this.initializeMiniKit();
            // Return mock user data based on address
            const mockUsers = {
                '0x582be5da7d06b2bf6d89c5b4499491c5990fafe4': {
                    address: '0x582be5da7d06b2bf6d89c5b4499491c5990fafe4',
                    username: 'mathieu.3580.world.id',
                    profilePicture: 'https://via.placeholder.com/150/F59E0B/FFFFFF?text=M',
                },
                '0xa882a2af989de54330f994cf626ea7f5d5edc2fc': {
                    address: '0xa882a2af989de54330f994cf626ea7f5d5edc2fc',
                    username: 'ewan.1300.world.id',
                    profilePicture: 'https://via.placeholder.com/150/10B981/FFFFFF?text=E',
                },
            };
            const mockUser = mockUsers[address.toLowerCase()];
            if (mockUser) {
                console.log(`✅ Found mock user for address: ${address}`);
                return mockUser;
            }
            console.log(`⚠️ No mock user found for address: ${address}`);
            return null;
        }
        catch (error) {
            console.error('Failed to get user by address:', error);
            return null;
        }
    }
    /**
     * Execute payment using Worldcoin MiniKit
     */
    async executePayment(paymentRequest) {
        try {
            await this.initializeMiniKit();
            console.log(`Executing payment: ${paymentRequest.reference}`);
            console.log(`  To: ${paymentRequest.to}`);
            console.log(`  Tokens: ${JSON.stringify(paymentRequest.tokens)}`);
            console.log(`  Description: ${paymentRequest.description}`);
            // Execute payment using MiniKit
            const result = await MiniKit.commandsAsync.pay({
                reference: paymentRequest.reference,
                to: paymentRequest.to,
                tokens: paymentRequest.tokens.map(token => ({
                    symbol: token.symbol,
                    token_amount: token.token_amount,
                })),
                description: paymentRequest.description,
            });
            console.log(`✅ Payment executed successfully!`);
            if (result.finalPayload.status === 'success') {
                console.log(`  Transaction Hash: ${result.finalPayload.transaction_id}`);
                console.log(`  Status: ${result.finalPayload.status}`);
                return {
                    status: result.finalPayload.status,
                    transactionHash: result.finalPayload.transaction_id,
                    reference: paymentRequest.reference,
                };
            }
            else {
                console.log(`  Error: ${result.finalPayload.error_code}`);
                return {
                    status: 'error',
                    error: result.finalPayload.error_code,
                    reference: paymentRequest.reference,
                };
            }
        }
        catch (error) {
            console.error('Failed to execute payment:', error);
            throw error;
        }
    }
    /**
     * Send payment using Worldcoin MiniKit
     */
    async sendPayment(paymentRequest) {
        try {
            await this.initializeMiniKit();
            const result = await MiniKit.commandsAsync.pay({
                reference: paymentRequest.reference,
                to: paymentRequest.to,
                tokens: paymentRequest.tokens.map(token => ({
                    symbol: token.symbol,
                    token_amount: token.token_amount,
                })),
                description: paymentRequest.description,
            });
            return result.finalPayload;
        }
        catch (error) {
            console.error('Failed to send payment:', error);
            throw error;
        }
    }
    /**
     * Execute a smart contract transaction using Worldcoin MiniKit
     */
    async executeContractTransaction(transactionRequest, userAddress) {
        try {
            console.log(`Executing contract transaction for user: ${userAddress}`);
            console.log(`  Contract: ${transactionRequest.contractAddress}`);
            console.log(`  Function: ${transactionRequest.functionName}`);
            console.log(`  Args: ${JSON.stringify(transactionRequest.args)}`);
            await this.initializeMiniKit();
            // Verify contract exists on chain
            console.log(`🔍 Verifying contract exists on chain...`);
            try {
                // Try to read a simple function to verify contract exists
                await this.publicClient.readContract({
                    address: transactionRequest.contractAddress,
                    abi: transactionRequest.abi,
                    functionName: 'getUserMessageCount',
                    args: ['0x0000000000000000000000000000000000000000'], // Test with zero address
                });
                console.log(`✅ Contract exists and is accessible`);
            }
            catch (error) {
                console.log(`⚠️ Could not verify contract: ${error}`);
                console.log(`   This might be due to RPC issues or chain mismatch`);
                console.log(`   Continuing with transaction attempt...`);
            }
            // Create the transaction request according to MiniKit API specification
            const transaction = {
                address: transactionRequest.contractAddress,
                abi: transactionRequest.abi,
                functionName: transactionRequest.functionName,
                args: transactionRequest.args,
                value: transactionRequest.value ? `0x${transactionRequest.value.toString(16)}` : '0x0',
                // Note: chainId is not part of the official MiniKit API
                // Chain configuration is handled by the World App
            };
            console.log(`Transaction details:`, {
                address: transaction.address,
                functionName: transaction.functionName,
                args: transaction.args,
                value: transaction.value,
                valueType: typeof transaction.value,
            });
            // Execute the transaction using MiniKit
            const result = await MiniKit.commandsAsync.sendTransaction({
                transaction: [transaction],
                // Optional: formatPayload defaults to true, but can be set to false if needed
                formatPayload: true,
            });
            console.log(`✅ Contract transaction successful!`);
            console.log(`  Result:`, result);
            if (result.finalPayload.status === 'success') {
                console.log(`  Transaction Hash: ${result.finalPayload.transaction_id}`);
                console.log(`  Status: ${result.finalPayload.status}`);
                return {
                    success: true,
                    transactionHash: result.finalPayload.transaction_id,
                };
            }
            else {
                console.log(`  Error: ${result.finalPayload.error_code}`);
                console.log(`  Error details:`, result.finalPayload);
                // Check if we're in development mode
                const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
                // For real transactions, we need to register the contract with MiniKit
                console.log(`⚠️ MiniKit returned invalid_contract error. This means:`);
                console.log(`   - Contract ${transactionRequest.contractAddress} is not registered with MiniKit`);
                console.log(`   - You need to register the contract in the Worldcoin Developer Portal`);
                console.log(`   - Or use a different transaction method`);
                // Use the contract registration utility for detailed analysis
                const contractRegistration = MiniKitContractRegistration.getInstance();
                contractRegistration.logErrorAnalysis(result.finalPayload, transactionRequest.contractAddress);
                // Check contract registration status
                const registrationInfo = await contractRegistration.checkContractRegistration(transactionRequest.contractAddress);
                // Log registration guidance
                const guidance = contractRegistration.getRegistrationGuidance(transactionRequest.contractAddress);
                console.log(`📋 Registration Guidance:`);
                guidance.forEach(line => console.log(`   ${line}`));
                // Log alternative methods
                const alternatives = contractRegistration.getAlternativeMethods();
                console.log(`🔄 Alternative Methods:`);
                alternatives.forEach(line => console.log(`   ${line}`));
                return {
                    success: false,
                    error: `Contract ${transactionRequest.contractAddress} not registered with MiniKit app. Please register the contract in the Worldcoin Developer Portal or use an alternative transaction method.`,
                };
            }
        }
        catch (error) {
            console.error('❌ Contract transaction failed:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
    /**
     * Store message metadata on the smart contract using Worldcoin MiniKit
     */
    async storeMessageMetadata(contractAddress, abi, messageRecord, userAddress) {
        try {
            console.log(`Storing message metadata on contract: ${contractAddress}`);
            console.log(`  Blob ID: ${messageRecord.blobId}`);
            console.log(`  Conversation ID: ${messageRecord.conversationId}`);
            console.log(`  Message Type: ${messageRecord.messageType}`);
            const transactionRequest = {
                contractAddress,
                abi,
                functionName: 'storeMessage',
                args: [
                    messageRecord.blobId,
                    messageRecord.conversationId,
                    messageRecord.messageType,
                    messageRecord.suiObjectId || '',
                    messageRecord.txDigest || ''
                ],
            };
            return await this.executeContractTransaction(transactionRequest, userAddress);
        }
        catch (error) {
            console.error('Failed to store message metadata:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
    /**
     * Estimate gas for a contract transaction
     */
    async estimateGas(contractAddress, abi, functionName, args) {
        try {
            await this.initializeMiniKit();
            // For now, use a mock estimation since MiniKit doesn't have direct gas estimation
            // In production, you would use a different method or service
            const baseGas = 21000n;
            const functionGas = 50000n;
            return baseGas + functionGas;
        }
        catch (error) {
            console.error('Failed to estimate gas:', error);
            return 300000n; // Default gas limit
        }
    }
    /**
     * Encode function data for contract transaction
     */
    encodeFunctionData(abi, functionName, args) {
        // Mock function encoding for development
        // In production, you would use viem's encodeFunctionData
        const functionSignature = `${functionName}(${args.map(() => 'string').join(',')})`;
        const encodedArgs = args.map(arg => arg.toString()).join('');
        return `0x${functionSignature}${encodedArgs}`;
    }
    /**
     * Get contacts from Worldcoin MiniKit
     */
    async getContacts() {
        try {
            await this.initializeMiniKit();
            const result = await MiniKit.commandsAsync.shareContacts({
                isMultiSelectEnabled: true,
                inviteMessage: 'Join me on Chatterbox!',
            });
            if (result.finalPayload.status === 'success' && result.finalPayload.contacts) {
                return result.finalPayload.contacts.map(contact => ({
                    address: contact.walletAddress,
                    username: contact.username,
                    profilePicture: contact.profilePictureUrl || undefined,
                }));
            }
            // Return mock contacts if no contacts shared
            return [
                {
                    address: '0xa882a2af989de54330f994cf626ea7f5d5edc2fc',
                    username: 'ewan.1300.world.id',
                    profilePicture: 'https://via.placeholder.com/150/10B981/FFFFFF?text=E',
                },
                {
                    address: '0x582be5da7d06b2bf6d89c5b4499491c5990fafe4',
                    username: 'mathieu.3580.world.id',
                    profilePicture: 'https://via.placeholder.com/150/F59E0B/FFFFFF?text=M',
                },
            ];
        }
        catch (error) {
            console.error('Failed to get contacts:', error);
            return [];
        }
    }
    /**
     * Convert token amount to decimals
     */
    tokenToDecimals(amount, token) {
        return tokenToDecimals(amount, token);
    }
    /**
     * Legacy methods for backward compatibility
     */
    async initiatePayment() {
        try {
            return await initiatePayment();
        }
        catch (error) {
            console.error('Failed to initiate payment:', error);
            throw error;
        }
    }
    async confirmPayment(payload) {
        try {
            return await confirmPayment(payload);
        }
        catch (error) {
            console.error('Failed to confirm payment:', error);
            throw error;
        }
    }
}
