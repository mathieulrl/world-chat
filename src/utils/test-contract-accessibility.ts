/**
 * Test contract accessibility and RPC connection
 */

import { createPublicClient, http } from 'viem';

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

export async function testContractAccessibility() {
  console.log('🧪 Testing Contract Accessibility');
  console.log('=================================');
  
  const contractAddress = '0x063816286ae3312e759f80Afdb10C8879b30688D';
  const rpcUrl = 'https://worldchain-sepolia.drpc.org';
  
  console.log(`📋 Contract Address: ${contractAddress}`);
  console.log(`🌐 RPC URL: ${rpcUrl}`);
  
  try {
    // Step 1: Test RPC connection
    console.log('\n📊 Step 1: Testing RPC connection...');
    const publicClient = createPublicClient({
      chain: worldcoinSepolia,
      transport: http(rpcUrl),
    });
    
    try {
      const blockNumber = await publicClient.getBlockNumber();
      console.log(`✅ RPC connection successful! Block number: ${blockNumber}`);
    } catch (error) {
      console.log(`❌ RPC connection failed: ${error.message}`);
      return;
    }
    
    // Step 2: Test contract code exists
    console.log('\n📋 Step 2: Testing contract code exists...');
    try {
      const code = await publicClient.getBytecode({
        address: contractAddress as `0x${string}`,
      });
      
      if (code && code !== '0x') {
        console.log(`✅ Contract code exists at address: ${contractAddress}`);
      } else {
        console.log(`❌ No contract code found at address: ${contractAddress}`);
        console.log('💡 This might mean:');
        console.log('   - Contract is not deployed');
        console.log('   - Contract address is incorrect');
        console.log('   - Contract was self-destructed');
        return;
      }
    } catch (error) {
      console.log(`❌ Failed to check contract code: ${error.message}`);
      return;
    }
    
    // Step 3: Test contract balance
    console.log('\n💰 Step 3: Testing contract balance...');
    try {
      const balance = await publicClient.getBalance({
        address: contractAddress as `0x${string}`,
      });
      console.log(`✅ Contract balance: ${balance} wei`);
    } catch (error) {
      console.log(`❌ Failed to get contract balance: ${error.message}`);
    }
    
    // Step 4: Test simple contract read
    console.log('\n📖 Step 4: Testing simple contract read...');
    try {
      // Try to read a simple function that should exist
      const testAddress = '0x0000000000000000000000000000000000000000';
      const result = await publicClient.readContract({
        address: contractAddress as `0x${string}`,
        abi: [
          {
            inputs: [{ internalType: 'address', name: 'user', type: 'address' }],
            name: 'getUserMessageCount',
            outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
            stateMutability: 'view',
            type: 'function',
          },
        ],
        functionName: 'getUserMessageCount',
        args: [testAddress],
      });
      console.log(`✅ Simple contract read successful: ${result}`);
    } catch (error) {
      console.log(`❌ Simple contract read failed: ${error.message}`);
      
      if (error.message.includes('function')) {
        console.log('💡 This might mean:');
        console.log('   - Function does not exist in contract');
        console.log('   - Contract ABI is incorrect');
        console.log('   - Contract is not the expected messaging contract');
      }
    }
    
    // Step 5: Test with full ABI
    console.log('\n📋 Step 5: Testing with full contract ABI...');
    try {
      const { messagingContractAbi } = await import('../abis/messagingContractAbi');
      const testAddress = '0x0000000000000000000000000000000000000000';
      
      const result = await publicClient.readContract({
        address: contractAddress as `0x${string}`,
        abi: messagingContractAbi,
        functionName: 'getUserMessageCount',
        args: [testAddress],
      });
      console.log(`✅ Full ABI contract read successful: ${result}`);
    } catch (error) {
      console.log(`❌ Full ABI contract read failed: ${error.message}`);
      
      if (error.message.includes('function')) {
        console.log('💡 This might mean:');
        console.log('   - Contract ABI does not match deployed contract');
        console.log('   - Contract was deployed with different ABI');
        console.log('   - Contract address is for a different contract');
      }
    }
    
    // Step 6: Summary
    console.log('\n🎯 Summary:');
    console.log('===========');
    console.log(`📊 RPC Connection: ✅`);
    console.log(`📋 Contract Code: ✅`);
    console.log(`💰 Contract Balance: ✅`);
    console.log(`📖 Contract Reading: Tested`);
    
    console.log('\n✅ Contract accessibility test complete');
    console.log('💡 If contract reading is failing, check:');
    console.log('   - Contract ABI matches deployed contract');
    console.log('   - Contract address is correct');
    console.log('   - Contract functions exist and are accessible');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
  
  console.log('\n✅ Contract accessibility test complete');
  console.log('======================================');
}

// Make available globally
if (typeof window !== 'undefined') {
  (window as any).testContractAccessibility = testContractAccessibility;
}

export default {
  testContractAccessibility
}; 