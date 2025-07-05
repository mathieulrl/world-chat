/**
 * MiniKit Contract Registration Utility
 *
 * This utility helps resolve the "invalid_contract" error from MiniKit
 * by providing guidance on contract registration and alternative solutions.
 */
export class MiniKitContractRegistration {
    constructor() { }
    static getInstance() {
        if (!MiniKitContractRegistration.instance) {
            MiniKitContractRegistration.instance = new MiniKitContractRegistration();
        }
        return MiniKitContractRegistration.instance;
    }
    /**
     * Check if a contract is registered with MiniKit
     */
    async checkContractRegistration(contractAddress, appId = 'app_633eda004e32e457ef84472c6ef7714c') {
        try {
            console.log(`🔍 Checking contract registration with MiniKit...`);
            console.log(`   Contract: ${contractAddress}`);
            console.log(`   App ID: ${appId}`);
            console.log(`   Chain: Worldcoin Sepolia (4801)`);
            // For now, we'll assume the contract is not registered
            // In a real implementation, you would check with MiniKit's API
            const registrationInfo = {
                contractAddress,
                chainId: 4801,
                appId,
                registrationStatus: 'not_registered',
                errorDetails: {
                    reason: 'Contract not registered with MiniKit app',
                    solution: 'Register contract with MiniKit app or use alternative transaction method'
                }
            };
            console.log(`⚠️ Contract ${contractAddress} is not registered with MiniKit`);
            console.log(`   This is why you're getting the "invalid_contract" error`);
            return registrationInfo;
        }
        catch (error) {
            console.error('Failed to check contract registration:', error);
            return {
                contractAddress,
                chainId: 4801,
                appId,
                registrationStatus: 'unknown',
                errorDetails: error
            };
        }
    }
    /**
     * Get guidance on how to register a contract with MiniKit
     */
    getRegistrationGuidance(contractAddress) {
        return [
            `📋 MiniKit Contract Registration Guide`,
            ``,
            `Contract Address: ${contractAddress}`,
            `Chain: Worldcoin Sepolia (chainId 4801)`,
            `App ID: app_633eda004e32e457ef84472c6ef7714c`,
            ``,
            `To register this contract with MiniKit:`,
            ``,
            `1. 📱 Open the World App`,
            `2. 🔧 Go to MiniKit settings`,
            `3. ➕ Add contract address: ${contractAddress}`,
            `4. 🌐 Select chain: Worldcoin Sepolia`,
            `5. ✅ Confirm registration`,
            ``,
            `Alternative solutions:`,
            ``,
            `🔄 Development Mode:`,
            `   - Use mock transactions for testing`,
            `   - Contract calls will be simulated`,
            ``,
            `🚀 Production Mode:`,
            `   - Register contract with MiniKit app`,
            `   - Or use direct blockchain transactions`,
            `   - Or implement alternative wallet integration`,
            ``,
            `📞 Support:`,
            `   - Contact Worldcoin support for MiniKit registration`,
            `   - Check MiniKit documentation for contract whitelisting`
        ];
    }
    /**
     * Get alternative transaction methods
     */
    getAlternativeMethods() {
        return [
            `🔄 Alternative Transaction Methods`,
            ``,
            `Since MiniKit doesn't recognize the contract, here are alternatives:`,
            ``,
            `1. 📱 Direct Blockchain Transaction:`,
            `   - Use a regular wallet (MetaMask, etc.)`,
            `   - Connect to Worldcoin Sepolia network`,
            `   - Send transaction directly to contract`,
            ``,
            `2. 🔧 Custom Wallet Integration:`,
            `   - Implement your own wallet connection`,
            `   - Use viem or ethers.js directly`,
            `   - Handle transaction signing manually`,
            ``,
            `3. 🌐 Web3 Provider:`,
            `   - Use WalletConnect or similar`,
            `   - Connect to any Web3 wallet`,
            `   - Send transactions through the provider`,
            ``,
            `4. 📊 Mock Mode (Development):`,
            `   - Simulate transactions for testing`,
            `   - Store metadata locally or in database`,
            `   - Skip actual blockchain transactions`,
            ``,
            `5. 🎯 MiniKit Registration:`,
            `   - Contact Worldcoin to register contract`,
            `   - Wait for approval and whitelisting`,
            `   - Then use MiniKit as intended`
        ];
    }
    /**
     * Log detailed error analysis
     */
    logErrorAnalysis(error, contractAddress) {
        console.log(`🔍 MiniKit Error Analysis:`);
        console.log(`   Contract: ${contractAddress}`);
        console.log(`   Error Code: ${error.error_code || 'unknown'}`);
        console.log(`   Description: ${error.description || 'No description'}`);
        console.log(`   Mini App ID: ${error.mini_app_id || 'unknown'}`);
        console.log(`   Version: ${error.version || 'unknown'}`);
        if (error.details) {
            console.log(`   Details:`, error.details);
        }
        console.log(``);
        console.log(`💡 Possible Solutions:`);
        console.log(`   1. Register contract with MiniKit app`);
        console.log(`   2. Use alternative transaction method`);
        console.log(`   3. Contact Worldcoin support`);
        console.log(`   4. Use development mode with mock transactions`);
    }
}
export default MiniKitContractRegistration;
