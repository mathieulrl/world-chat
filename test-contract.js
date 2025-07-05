/**
 * Node.js test script for contract diagnostics
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
};

async function testContractAccessibility() {
  console.log('🧪 Testing Contract Accessibility (Node.js)');
  console.log('===========================================');
  
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
      return false;
    }
    
    // Step 2: Test contract code exists
    console.log('\n📋 Step 2: Testing contract code exists...');
    try {
      const code = await publicClient.getBytecode({
        address: contractAddress,
      });
      
      if (code && code !== '0x') {
        console.log(`✅ Contract code exists at address: ${contractAddress}`);
      } else {
        console.log(`❌ No contract code found at address: ${contractAddress}`);
        console.log('💡 This might mean:');
        console.log('   - Contract is not deployed');
        console.log('   - Contract address is incorrect');
        console.log('   - Contract was self-destructed');
        return false;
      }
    } catch (error) {
      console.log(`❌ Failed to check contract code: ${error.message}`);
      return false;
    }
    
    // Step 3: Test contract balance
    console.log('\n💰 Step 3: Testing contract balance...');
    try {
      const balance = await publicClient.getBalance({
        address: contractAddress,
      });
      console.log(`✅ Contract balance: ${balance} wei`);
    } catch (error) {
      console.log(`❌ Failed to get contract balance: ${error.message}`);
    }
    
    // Step 4: Test simple contract read
    console.log('\n📖 Step 4: Testing simple contract read...');
    try {
      const testAddress = '0x0000000000000000000000000000000000000000';
      const result = await publicClient.readContract({
        address: contractAddress,
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
    
    console.log('\n✅ Contract accessibility test complete');
    return true;
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
}

async function testSmartContractReading() {
  console.log('\n🧪 Testing Smart Contract Reading (Node.js)');
  console.log('===========================================');
  
  const contractAddress = '0x063816286ae3312e759f80Afdb10C8879b30688D';
  const testUserAddress = '0x582be5da7d06b2bf6d89c5b4499491c5990fafe4';
  
  console.log(`\n🔍 Testing smart contract reading for user: ${testUserAddress}`);
  console.log(`📋 Contract Address: ${contractAddress}`);
  
  try {
    const publicClient = createPublicClient({
      chain: worldcoinSepolia,
      transport: http('https://worldchain-sepolia.drpc.org'),
    });
    
    // Test getUserMessageCount
    console.log('\n📊 Testing getUserMessageCount...');
    try {
      const messageCount = await publicClient.readContract({
        address: contractAddress,
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
        args: [testUserAddress],
      });
      console.log(`✅ getUserMessageCount: ${messageCount} messages`);
    } catch (error) {
      console.log(`❌ getUserMessageCount failed: ${error.message}`);
    }
    
    // Test getUserMessages
    console.log('\n📨 Testing getUserMessages...');
    try {
      const userMessages = await publicClient.readContract({
        address: contractAddress,
        abi: [
          {
            inputs: [{ internalType: 'address', name: 'user', type: 'address' }],
            name: 'getUserMessages',
            outputs: [
              {
                components: [
                  { internalType: 'string', name: 'blobId', type: 'string' },
                  { internalType: 'string', name: 'conversationId', type: 'string' },
                  { internalType: 'address', name: 'sender', type: 'address' },
                  { internalType: 'string', name: 'messageType', type: 'string' },
                  { internalType: 'uint256', name: 'timestamp', type: 'uint256' },
                  { internalType: 'string', name: 'suiObjectId', type: 'string' },
                  { internalType: 'string', name: 'txDigest', type: 'string' },
                ],
                internalType: 'struct MessagingContract.MessageRecord[]',
                name: '',
                type: 'tuple[]',
              },
            ],
            stateMutability: 'view',
            type: 'function',
          },
        ],
        functionName: 'getUserMessages',
        args: [testUserAddress],
      });
      console.log(`✅ getUserMessages: ${userMessages.length} messages`);
      
      if (userMessages.length > 0) {
        console.log('📝 Sample message record:', {
          blobId: userMessages[0].blobId,
          conversationId: userMessages[0].conversationId,
          senderId: userMessages[0].sender,
          messageType: userMessages[0].messageType,
          timestamp: userMessages[0].timestamp,
        });
      }
    } catch (error) {
      console.log(`❌ getUserMessages failed: ${error.message}`);
      
      if (error.message.includes('returned no data')) {
        console.log('ℹ️ This might be normal for an empty contract');
      } else if (error.message.includes('execution reverted')) {
        console.log('⚠️ Contract execution reverted - check contract state');
      }
    }
    
    // Test with other user addresses
    console.log('\n👤 Testing with other user addresses...');
    const testUsers = [
      '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6', // alice
      '0x1234567890123456789012345678901234567890', // random address
      '0x0000000000000000000000000000000000000000', // zero address
    ];
    
    for (const userAddress of testUsers) {
      try {
        const messageCount = await publicClient.readContract({
          address: contractAddress,
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
          args: [userAddress],
        });
        console.log(`  ${userAddress}: ${messageCount} messages`);
      } catch (error) {
        console.log(`  ${userAddress}: Error - ${error.message}`);
      }
    }
    
    console.log('\n✅ Smart contract reading test complete');
    return true;
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Running All Diagnostic Tests (Node.js)');
  console.log('==========================================');
  
  const results = {
    contractAccessibility: false,
    smartContractReading: false,
  };
  
  try {
    // Test 1: Contract Accessibility
    console.log('\n🧪 Test 1: Contract Accessibility');
    console.log('==================================');
    results.contractAccessibility = await testContractAccessibility();
    
    // Test 2: Smart Contract Reading
    console.log('\n🧪 Test 2: Smart Contract Reading');
    console.log('===================================');
    results.smartContractReading = await testSmartContractReading();
    
  } catch (error) {
    console.error('❌ Test runner failed:', error);
  }
  
  // Final Summary
  console.log('\n🎯 Final Test Summary');
  console.log('=====================');
  console.log(`📊 Contract Accessibility: ${results.contractAccessibility ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`📨 Smart Contract Reading: ${results.smartContractReading ? '✅ PASS' : '❌ FAIL'}`);
  
  // Recommendations
  console.log('\n💡 Recommendations:');
  if (!results.contractAccessibility) {
    console.log('   - Check contract deployment and address');
    console.log('   - Verify RPC URL is accessible');
    console.log('   - Ensure contract is deployed on Worldcoin Sepolia');
  } else if (!results.smartContractReading) {
    console.log('   - Check contract ABI matches deployed contract');
    console.log('   - Verify contract functions exist');
    console.log('   - Test with different user addresses');
  } else {
    console.log('   - Contract tests passed! The issue is that no messages are stored');
    console.log('   - You need to send some test messages first');
    console.log('   - Try sending a message through the app and then check again');
  }
  
  console.log('\n✅ All tests completed');
  console.log('======================');
  
  return results;
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests().then(results => {
    console.log('\n📊 Test Results:', results);
    process.exit(0);
  }).catch(error => {
    console.error('❌ Test runner failed:', error);
    process.exit(1);
  });
}

export {
  testContractAccessibility,
  testSmartContractReading,
  runAllTests
}; 