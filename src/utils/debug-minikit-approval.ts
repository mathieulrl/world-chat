/**
 * Debug MiniKit transaction approval issue
 */

import { WorldcoinService } from '../services/worldcoinService';
import { messagingContractAbi } from '../abis/messagingContractAbi';

export async function debugMiniKitApproval() {
  console.log('🔍 Debugging MiniKit Transaction Approval Issue');
  console.log('==============================================');
  console.log('Issue: Transaction approved in MiniKit but not sent to blockchain');
  console.log('');
  
  const worldcoinService = WorldcoinService.getInstance();
  const contractAddress = '0x063816286ae3312e759f80Afdb10C8879b30688D';
  const testUserAddress = '0x582be5da7d06b2bf6d89c5b4499491c5990fafe4';
  
  console.log(`📋 Contract Address: ${contractAddress}`);
  console.log(`👤 Test User: ${testUserAddress}`);
  console.log(`🔧 MiniKit App ID: app_633eda004e32e457ef84472c6ef7714c`);
  
  try {
    // Step 1: Check MiniKit initialization
    console.log('\n📱 Step 1: Checking MiniKit initialization...');
    const initialized = await worldcoinService.initializeMiniKit();
    if (!initialized) {
      console.log('❌ MiniKit initialization failed');
      return;
    }
    console.log('✅ MiniKit initialized successfully');
    
    // Step 2: Prepare a simple test transaction
    console.log('\n📝 Step 2: Preparing test transaction...');
    const testMessageRecord = {
      blobId: 'debug_test_' + Date.now(),
      conversationId: 'debug_conversation_' + Date.now(),
      messageType: 'text',
      suiObjectId: '',
      txDigest: '',
    };
    
    console.log('📋 Test message record:', testMessageRecord);
    
    // Step 3: Extract the storeMessage ABI
    console.log('\n🔧 Step 3: Extracting storeMessage ABI...');
    const storeMessageAbi = messagingContractAbi.find((item: any) => 
      item.type === 'function' && item.name === 'storeMessage'
    );
    
    if (!storeMessageAbi) {
      console.log('❌ storeMessage function not found in ABI');
      return;
    }
    
    console.log('✅ storeMessage ABI found:', storeMessageAbi);
    
    // Step 4: Create transaction payload
    console.log('\n📦 Step 4: Creating transaction payload...');
    const transaction = {
      address: contractAddress,
      abi: [storeMessageAbi],
      functionName: 'storeMessage',
      args: [
        testMessageRecord.blobId,
        testMessageRecord.conversationId,
        testMessageRecord.messageType,
        testMessageRecord.suiObjectId,
        testMessageRecord.txDigest,
      ],
    };
    
    console.log('📋 Transaction payload:', {
      address: transaction.address,
      functionName: transaction.functionName,
      args: transaction.args,
      abi: transaction.abi,
    });
    
    // Step 5: Send transaction and capture detailed response
    console.log('\n📤 Step 5: Sending transaction via MiniKit...');
    console.log('⚠️  User will see transaction approval in World App');
    console.log('⚠️  After approval, check the console for detailed response');
    
    const result = await worldcoinService.storeMessageMetadata(
      contractAddress,
      messagingContractAbi,
      testMessageRecord,
      testUserAddress
    );
    
    // Step 6: Analyze the result
    console.log('\n📊 Step 6: Analyzing transaction result...');
    console.log('===========================================');
    console.log(`Success: ${result.success}`);
    console.log(`Transaction Hash: ${result.transactionHash || 'N/A'}`);
    console.log(`Error: ${result.error || 'N/A'}`);
    
    if (result.success) {
      console.log('\n✅ Transaction appears successful!');
      console.log('💡 Check if transaction hash is a real hash or just an ID');
      
      if (result.transactionHash?.startsWith('0x') && result.transactionHash.length === 66) {
        console.log('✅ Real transaction hash detected');
        console.log('💡 Check WorldScan to verify the transaction was mined');
      } else {
        console.log('⚠️ Transaction ID received but not a real hash');
        console.log('💡 This might indicate the transaction was approved but not relayed');
      }
      
    } else {
      console.log('\n❌ Transaction failed!');
      console.log('💡 Error analysis:');
      
      if (result.error?.includes('invalid_contract')) {
        console.log('   - Contract not whitelisted in Worldcoin Developer Portal');
        console.log('   - Solution: Add contract to MiniKit whitelist');
      } else if (result.error?.includes('simulation_failed')) {
        console.log('   - Transaction simulation failed');
        console.log('   - Check debug URL for detailed error');
      } else if (result.error?.includes('user_rejected')) {
        console.log('   - User rejected the transaction');
        console.log('   - This is normal if user cancels');
      } else {
        console.log(`   - Unknown error: ${result.error}`);
        console.log('   - Check MiniKit documentation for error codes');
      }
    }
    
    // Step 7: Additional checks
    console.log('\n🔍 Step 7: Additional diagnostic checks...');
    console.log('==========================================');
    
    // Check if contract is accessible
    try {
      const { createPublicClient, http } = await import('viem');
      
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
      
      const publicClient = createPublicClient({
        chain: worldcoinSepolia,
        transport: http('https://worldchain-sepolia.drpc.org'),
      });
      
      const code = await publicClient.getBytecode({
        address: contractAddress as `0x${string}`,
      });
      
      if (code && code !== '0x') {
        console.log('✅ Contract code exists on-chain');
      } else {
        console.log('❌ No contract code found at address');
      }
    } catch (error) {
      console.log('⚠️ Could not verify contract on-chain:', error);
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
  
  console.log('\n✅ Debug complete');
  console.log('================');
  console.log('💡 Next steps:');
  console.log('   1. Check the detailed logs above');
  console.log('   2. If transaction ID received but no hash, check MiniKit relay');
  console.log('   3. Verify contract is whitelisted in Worldcoin Developer Portal');
  console.log('   4. Check WorldScan for any pending transactions');
}

// Make available globally
if (typeof window !== 'undefined') {
  (window as any).debugMiniKitApproval = debugMiniKitApproval;
}

export default {
  debugMiniKitApproval
}; 