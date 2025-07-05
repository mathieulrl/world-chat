/**
 * Verify transaction hash and check status across different sources
 */

import { createPublicClient, http } from 'viem';

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
} as const;

export async function verifyTransactionHash(transactionHash: string) {
  console.log('🔍 Verifying Transaction Hash');
  console.log('============================');
  console.log(`📋 Transaction Hash: ${transactionHash}`);
  console.log(`🌐 Network: Worldcoin Sepolia (Chain ID: 4801)`);
  console.log('');
  
  if (!transactionHash.startsWith('0x') || transactionHash.length !== 66) {
    console.log('❌ Invalid transaction hash format');
    console.log('   Expected: 0x + 64 hex characters');
    console.log(`   Got: ${transactionHash}`);
    return;
  }
  
  try {
    // Initialize public client
    const publicClient = createPublicClient({
      chain: worldcoinSepolia,
      transport: http('https://worldchain-sepolia.drpc.org'),
    });
    
    console.log('🔍 Step 1: Checking transaction on RPC node...');
    
    // Check transaction receipt
    try {
      const receipt = await publicClient.getTransactionReceipt({
        hash: transactionHash as `0x${string}`,
      });
      
      console.log('✅ Transaction found on RPC node!');
      console.log(`📊 Status: ${receipt.status === 'success' ? '✅ Success' : '❌ Failed'}`);
      console.log(`🔢 Block Number: ${receipt.blockNumber}`);
      console.log(`⛽ Gas Used: ${receipt.gasUsed.toString()}`);
      console.log(`💰 Effective Gas Price: ${receipt.effectiveGasPrice.toString()}`);
      
      if (receipt.status === 'success') {
        console.log('\n🎉 Transaction was successful!');
        console.log('💡 The transaction is confirmed on-chain');
        console.log('⚠️  If WorldScan doesn\'t show it, it might be a sync issue');
      } else {
        console.log('\n❌ Transaction failed on-chain');
        console.log('💡 Check the transaction details for the failure reason');
      }
      
    } catch (error) {
      console.log('❌ Transaction not found on RPC node');
      console.log(`   Error: ${error}`);
      console.log('\n💡 Possible reasons:');
      console.log('   - Transaction not yet submitted to blockchain');
      console.log('   - Wrong network (check chain ID)');
      console.log('   - RPC node not synced');
      console.log('   - Transaction hash is invalid');
    }
    
    // Check transaction details
    console.log('\n🔍 Step 2: Getting transaction details...');
    try {
      const transaction = await publicClient.getTransaction({
        hash: transactionHash as `0x${string}`,
      });
      
      console.log('✅ Transaction details retrieved!');
      console.log(`📤 From: ${transaction.from}`);
      console.log(`📥 To: ${transaction.to}`);
      console.log(`💰 Value: ${transaction.value.toString()} wei`);
      console.log(`⛽ Gas Limit: ${transaction.gas.toString()}`);
      console.log(`🔢 Nonce: ${transaction.nonce}`);
      console.log(`📝 Data: ${(transaction as any).data?.substring(0, 66) || 'N/A'}...`);
      
    } catch (error) {
      console.log('❌ Could not get transaction details');
      console.log(`   Error: ${error}`);
    }
    
    // Check block information
    console.log('\n🔍 Step 3: Checking block information...');
    try {
      const transaction = await publicClient.getTransaction({
        hash: transactionHash as `0x${string}`,
      });
      
      if (transaction.blockNumber) {
        const block = await publicClient.getBlock({
          blockNumber: transaction.blockNumber,
        });
        
        console.log('✅ Block information retrieved!');
        console.log(`🔢 Block Number: ${block.number}`);
        console.log(`⏰ Block Timestamp: ${new Date(Number(block.timestamp) * 1000).toISOString()}`);
        console.log(`📊 Block Hash: ${block.hash}`);
        console.log(`⛽ Gas Used: ${block.gasUsed.toString()}`);
        console.log(`⛽ Gas Limit: ${block.gasLimit.toString()}`);
        
      } else {
        console.log('⚠️ Transaction not yet included in a block');
        console.log('💡 Transaction is pending or failed');
      }
      
    } catch (error) {
      console.log('❌ Could not get block information');
      console.log(`   Error: ${error}`);
    }
    
    // Check WorldScan URL
    console.log('\n🔍 Step 4: WorldScan Information...');
    const worldScanUrl = `https://sepolia.worldscan.org/tx/${transactionHash}`;
    console.log(`🌐 WorldScan URL: ${worldScanUrl}`);
    console.log('💡 If transaction exists on RPC but not on WorldScan:');
    console.log('   - WorldScan might not be synced with this RPC node');
    console.log('   - Try checking other block explorers');
    console.log('   - Wait a few minutes for sync');
    
    // Alternative block explorers
    console.log('\n🔍 Step 5: Alternative Block Explorers...');
    console.log('🌐 Alternative URLs to check:');
    console.log(`   - WorldScan: https://sepolia.worldscan.org/tx/${transactionHash}`);
    console.log(`   - Etherscan (if supported): https://sepolia.etherscan.io/tx/${transactionHash}`);
    console.log(`   - Blockscout: https://sepolia.blockscout.com/tx/${transactionHash}`);
    
  } catch (error) {
    console.error('❌ Verification failed:', error);
  }
  
  console.log('\n✅ Transaction verification complete');
  console.log('==================================');
}

// Make available globally
if (typeof window !== 'undefined') {
  (window as any).verifyTransactionHash = verifyTransactionHash;
}

export default {
  verifyTransactionHash
}; 