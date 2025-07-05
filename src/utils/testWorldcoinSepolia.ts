import { createPublicClient, http } from 'viem';
import { messagingContractAbi } from '../abis/messagingContractAbi';

// Define Worldcoin Sepolia chain (chainId 4801)
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
} as const;

/**
 * Test the contract on Worldcoin Sepolia
 */
async function testWorldcoinSepolia() {
  console.log('🌍 Testing Contract on Worldcoin Sepolia...\n');

  const contractAddress = '0x063816286ae3312e759f80Afdb10C8879b30688D';
  const rpcUrl = 'https://worldchain-sepolia.drpc.org';
  
  const publicClient = createPublicClient({
    chain: worldcoinSepolia,
    transport: http(rpcUrl),
  });

  console.log(`Contract: ${contractAddress}`);
  console.log(`Chain: Worldcoin Sepolia (4801)`);
  console.log(`RPC URL: ${rpcUrl}\n`);

  // Test 1: Check if contract exists
  console.log('🔗 Test 1: Checking if contract exists...');
  try {
    const code = await publicClient.getBytecode({ address: contractAddress as `0x${string}` });
    if (code) {
      console.log('✅ Contract exists and has bytecode');
      
      // Test 2: Try to get user messages
      console.log('\n📨 Test 2: Testing getUserMessages function...');
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

      // Test 3: Try to get user message count
      console.log('\n🔢 Test 3: Testing getUserMessageCount function...');
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

      console.log('\n🎉 Contract found and working on Worldcoin Sepolia!');
    } else {
      console.log('❌ Contract does not exist or has no bytecode');
    }
  } catch (error) {
    console.error('❌ Error checking contract:', error.message);
  }
}

// Run the test
testWorldcoinSepolia(); 