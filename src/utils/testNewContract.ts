import { SmartContractService } from '../services/smartContractService';
import { DecentralizedMessagingService } from '../services/decentralizedMessagingService';
import { createPublicClient, http } from 'viem';
import { messagingContractAbi } from '../abis/messagingContractAbi';

// Define custom chain for chainId 4801
const customChain = {
  id: 4801,
  name: 'Custom Chain',
  network: 'custom',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: { http: ['https://sepolia.infura.io/v3/e34629cc701f45ffbdb1d83ae332b4cf'] },
    public: { http: ['https://sepolia.infura.io/v3/e34629cc701f45ffbdb1d83ae332b4cf'] },
  },
} as const;

/**
 * Test the new contract address and getUserConversations functionality
 */
export async function testNewContract() {
  console.log('🆕 Testing New Contract Address and Features...');
  console.log('===============================================');

  try {
    // Initialize services with new contract address
    const smartContractService = new SmartContractService({
      contractAddress: '0xA27F6614c53ce3c4E7ac92A64d03bA1853e3c304',
      network: 'testnet',
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

    // Test 1: Check contract connection
    console.log('\n🔗 Test 1: Testing contract connection');
    const connectionTest = await smartContractService.testContractConnection();
    console.log(`✅ Contract connection: ${connectionTest ? 'SUCCESS' : 'FAILED'}`);

    // Test 2: Get user conversations (new functionality)
    console.log('\n💬 Test 2: Testing getUserConversations');
    const testUserAddress = '0x582be5da7d06b2bf6d89c5b4499491c5990fafe4'; // mathieu's address
    const userConversations = await smartContractService.getUserConversations(testUserAddress);
    console.log(`✅ Found ${userConversations.length} conversations for user`);

    // Test 3: Get conversation details
    console.log('\n📋 Test 3: Testing conversation details');
    if (userConversations.length > 0) {
      const firstConversationId = userConversations[0];
      const conversationDetails = await smartContractService.getConversation(firstConversationId);
      console.log(`✅ Conversation details: ${conversationDetails.id}`);
      console.log(`   Participants: ${conversationDetails.participants?.length || 0}`);
    }

    // Test 4: Test decentralized service getUserConversations
    console.log('\n🌐 Test 4: Testing decentralized service getUserConversations');
    const decentralizedConversations = await decentralizedService.getUserConversations(testUserAddress);
    console.log(`✅ Decentralized service found ${decentralizedConversations.length} conversations`);

    // Test 5: Get message history
    console.log('\n📚 Test 5: Testing message history');
    const messageHistory = await smartContractService.getMessageHistory(testUserAddress);
    console.log(`✅ Found ${messageHistory.length} messages in user history`);

    console.log('\n🎉 New contract test completed!');
    console.log('\n📋 Summary:');
    console.log(`   - Contract connection: ${connectionTest ? '✅ Success' : '❌ Failed'}`);
    console.log(`   - User conversations: ${userConversations.length} found`);
    console.log(`   - Decentralized conversations: ${decentralizedConversations.length} found`);
    console.log(`   - Message history: ${messageHistory.length} messages`);

    return {
      success: true,
      contractConnected: connectionTest,
      userConversations: userConversations.length,
      decentralizedConversations: decentralizedConversations.length,
      messageHistory: messageHistory.length,
    };

  } catch (error) {
    console.error('❌ New contract test failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Quick test for new contract address
 */
export async function quickNewContractTest() {
  console.log('⚡ Quick New Contract Test...');

  try {
    const smartContractService = new SmartContractService({
      contractAddress: '0xA27F6614c53ce3c4E7ac92A64d03bA1853e3c304',
      network: 'testnet',
    });

    const connectionTest = await smartContractService.testContractConnection();
    console.log(`Contract connected: ${connectionTest ? '✅ Yes' : '❌ No'}`);

    return {
      success: connectionTest,
      contractAddress: '0xA27F6614c53ce3c4E7ac92A64d03bA1853e3c304',
    };
  } catch (error) {
    console.error('Quick test failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Test the new contract to see what functions are actually available
 */
async function testNewContractFunctions() {
  console.log('🔍 Testing New Contract Functions...\n');

  const contractAddress = '0x063816286ae3312e759f80Afdb10C8879b30688D';
  
  // Use Infura RPC URL for chainId 4801
  const rpcUrl = 'https://sepolia.infura.io/v3/e34629cc701f45ffbdb1d83ae332b4cf';
  
  const publicClient = createPublicClient({
    chain: customChain,
    transport: http(rpcUrl),
  });

  console.log(`Testing contract: ${contractAddress}`);
  console.log(`Chain ID: 4801`);
  console.log(`RPC URL: ${rpcUrl}\n`);

  // Test 1: Check if contract exists
  console.log('🔗 Test 1: Checking if contract exists...');
  try {
    const code = await publicClient.getBytecode({ address: contractAddress as `0x${string}` });
    if (code) {
      console.log('✅ Contract exists and has bytecode');
    } else {
      console.log('❌ Contract does not exist or has no bytecode');
      return;
    }
  } catch (error) {
    console.error('❌ Error checking contract:', error);
    return;
  }

  // Test 2: Try to call a simple function that should exist
  console.log('\n📝 Test 2: Testing storeMessage function...');
  try {
    // This should fail because we're not providing the right parameters, but it will tell us if the function exists
    await publicClient.readContract({
      address: contractAddress as `0x${string}`,
      abi: messagingContractAbi,
      functionName: 'storeMessage',
      args: ['test', 'test', 'text', 'test', 'test'],
    });
  } catch (error) {
    console.log('ℹ️ storeMessage function test result:', error.message);
  }

  // Test 3: Try to get conversation details
  console.log('\n💬 Test 3: Testing getConversation function...');
  try {
    const conversation = await publicClient.readContract({
      address: contractAddress as `0x${string}`,
      abi: messagingContractAbi,
      functionName: 'getConversation',
      args: ['test-conversation'],
    });
    console.log('✅ getConversation works:', conversation);
  } catch (error) {
    console.log('❌ getConversation failed:', error.message);
  }

  // Test 4: Try to get user messages
  console.log('\n📨 Test 4: Testing getUserMessages function...');
  try {
    const messages = await publicClient.readContract({
      address: contractAddress as `0x${string}`,
      abi: messagingContractAbi,
      functionName: 'getUserMessages',
      args: ['0x582be5da7d06b2bf6d89c5b4499491c5990fafe4'],
    });
    console.log('✅ getUserMessages works:', messages);
  } catch (error) {
    console.log('❌ getUserMessages failed:', error.message);
  }

  // Test 5: Try to get user message count
  console.log('\n🔢 Test 5: Testing getUserMessageCount function...');
  try {
    const count = await publicClient.readContract({
      address: contractAddress as `0x${string}`,
      abi: messagingContractAbi,
      functionName: 'getUserMessageCount',
      args: ['0x582be5da7d06b2bf6d89c5b4499491c5990fafe4'],
    });
    console.log('✅ getUserMessageCount works:', count);
  } catch (error) {
    console.log('❌ getUserMessageCount failed:', error.message);
  }

  // Test 6: List all functions in the ABI
  console.log('\n📋 Test 6: Available functions in ABI:');
  const functions = messagingContractAbi.filter(item => item.type === 'function');
  functions.forEach((func: any) => {
    console.log(`  - ${func.name}(${func.inputs?.map((input: any) => `${input.type} ${input.name}`).join(', ') || ''})`);
  });

  console.log('\n✅ Contract testing completed!');
}

// Run the test
testNewContractFunctions();

// Export for use in development
export default testNewContract; 