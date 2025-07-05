/**
 * Debug utility for message persistence issues
 */
import { SmartContractService } from '../services/smartContractService';
import { DecentralizedMessagingService } from '../services/decentralizedMessagingService';
import { WorldcoinService } from '../services/worldcoinService';
export async function debugMessagePersistence() {
    console.log('🔍 Debugging Message Persistence');
    console.log('==================================');
    // Initialize services
    const smartContractService = new SmartContractService({
        contractAddress: '0x063816286ae3312e759f80Afdb10C8879b30688D',
        network: 'testnet',
        rpcUrl: 'https://worldchain-sepolia.drpc.org',
    });
    const decentralizedService = new DecentralizedMessagingService({
        walrus: {
            aggregatorUrl: 'https://aggregator.walrus-testnet.walrus.space',
            publisherUrl: 'https://publisher.walrus-testnet.walrus.space',
            network: 'testnet',
        },
        smartContract: {
            contractAddress: '0x063816286ae3312e759f80Afdb10C8879b30688D',
            network: 'testnet',
            rpcUrl: 'https://worldchain-sepolia.drpc.org',
        },
    });
    const worldcoinService = WorldcoinService.getInstance();
    // Test user addresses
    const testUsers = [
        '0x582be5da7d06b2bf6d89c5b4499491c5990fafe4', // mathieu
        '0xa882a2af989de54330f994cf626ea7f5d5edc2fc', // ewan
    ];
    console.log('\n📋 Contract Information:');
    console.log('------------------------');
    const contractInfo = smartContractService.getContractInfo();
    console.log(`Address: ${contractInfo.address}`);
    console.log(`Network: ${contractInfo.network}`);
    console.log(`RPC URL: ${contractInfo.rpcUrl}`);
    console.log('\n🔍 Testing Contract Connection:');
    console.log('-------------------------------');
    try {
        const isConnected = await smartContractService.testContractConnection();
        console.log(`✅ Contract connection: ${isConnected ? 'SUCCESS' : 'FAILED'}`);
    }
    catch (error) {
        console.log(`❌ Contract connection failed: ${error.message}`);
    }
    console.log('\n👥 Testing User Message History:');
    console.log('--------------------------------');
    for (const userAddress of testUsers) {
        console.log(`\n🔍 Testing user: ${userAddress}`);
        try {
            // Test 1: Get user message count
            const messageCount = await smartContractService.getUserMessageCount(userAddress);
            console.log(`   📊 Message count: ${messageCount}`);
            // Test 2: Get user messages
            const userMessages = await smartContractService.getMessageHistory(userAddress);
            console.log(`   📨 User messages found: ${userMessages.length}`);
            if (userMessages.length > 0) {
                console.log(`   📝 Sample message:`, {
                    blobId: userMessages[0].blobId,
                    conversationId: userMessages[0].conversationId,
                    messageType: userMessages[0].messageType,
                    timestamp: userMessages[0].timestamp,
                });
                // Test 3: Get conversation messages for the first message's conversation
                const conversationId = userMessages[0].conversationId;
                console.log(`   💬 Testing conversation: ${conversationId}`);
                try {
                    const conversationMessages = await smartContractService.getConversationMessages(conversationId);
                    console.log(`   📨 Conversation messages: ${conversationMessages.length}`);
                }
                catch (error) {
                    console.log(`   ❌ Failed to get conversation messages: ${error.message}`);
                }
                // Test 4: Get conversation details
                try {
                    const conversationDetails = await smartContractService.getConversation(conversationId);
                    console.log(`   💬 Conversation details:`, conversationDetails);
                }
                catch (error) {
                    console.log(`   ❌ Failed to get conversation details: ${error.message}`);
                }
            }
            // Test 5: Get user conversations
            const userConversations = await smartContractService.getUserConversations(userAddress);
            console.log(`   💬 User conversations: ${userConversations.length}`);
            if (userConversations.length > 0) {
                console.log(`   📋 Conversation IDs:`, userConversations);
            }
        }
        catch (error) {
            console.log(`   ❌ Error testing user ${userAddress}: ${error.message}`);
        }
    }
    console.log('\n🧪 Testing Decentralized Service:');
    console.log('---------------------------------');
    for (const userAddress of testUsers) {
        console.log(`\n🔍 Testing decentralized service for user: ${userAddress}`);
        try {
            // Test 1: Get message history from decentralized service
            const messageHistory = await decentralizedService.getMessageHistory(userAddress);
            console.log(`   📨 Message history: ${messageHistory.length} messages`);
            if (messageHistory.length > 0) {
                console.log(`   📝 Sample message:`, {
                    id: messageHistory[0].id,
                    conversationId: messageHistory[0].conversationId,
                    content: messageHistory[0].content.substring(0, 50) + '...',
                    messageType: messageHistory[0].messageType,
                    timestamp: messageHistory[0].timestamp,
                });
            }
            // Test 2: Get user conversations from decentralized service
            const userConversations = await decentralizedService.getUserConversations(userAddress);
            console.log(`   💬 User conversations: ${userConversations.length}`);
            if (userConversations.length > 0) {
                console.log(`   📋 First conversation:`, userConversations[0]);
                // Test 3: Get conversation messages
                const conversationId = userConversations[0].id;
                const conversationMessages = await decentralizedService.getConversationMessages(conversationId);
                console.log(`   📨 Conversation messages: ${conversationMessages.length}`);
            }
        }
        catch (error) {
            console.log(`   ❌ Error testing decentralized service for ${userAddress}: ${error.message}`);
        }
    }
    console.log('\n🎯 Potential Issues Identified:');
    console.log('--------------------------------');
    console.log('1. Conversation IDs might not be properly stored in smart contract');
    console.log('2. Messages might be stored but conversations not created');
    console.log('3. Conversation lookup might be failing');
    console.log('4. Walrus retrieval might be failing for stored messages');
    console.log('\n🔧 Recommended Fixes:');
    console.log('---------------------');
    console.log('1. Ensure conversation IDs are properly stored when messages are sent');
    console.log('2. Add fallback conversation creation logic');
    console.log('3. Improve error handling for conversation loading');
    console.log('4. Add local storage backup for conversations');
    console.log('\n✅ Debug Complete');
    console.log('==================');
}
// Export for use in other files
export default {
    debugMessagePersistence
};
