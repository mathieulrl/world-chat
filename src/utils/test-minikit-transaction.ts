/**
 * Test MiniKit transaction sending with detailed logging
 */

import { WorldcoinService } from '../services/worldcoinService';
import { messagingContractAbi } from '../abis/messagingContractAbi';

export async function testMiniKitTransaction() {
  console.log('🧪 Testing MiniKit Transaction Sending');
  console.log('=====================================');
  
  const worldcoinService = WorldcoinService.getInstance();
  const contractAddress = '0x063816286ae3312e759f80Afdb10C8879b30688D';
  const testUserAddress = '0x582be5da7d06b2bf6d89c5b4499491c5990fafe4';
  
  console.log(`📋 Contract Address: ${contractAddress}`);
  console.log(`👤 Test User: ${testUserAddress}`);
  
  try {
    // Step 1: Initialize MiniKit
    console.log('\n📱 Step 1: Initializing MiniKit...');
    const initialized = await worldcoinService.initializeMiniKit();
    if (!initialized) {
      console.log('❌ Failed to initialize MiniKit');
      return;
    }
    console.log('✅ MiniKit initialized');
    
    // Step 2: Test transaction preparation
    console.log('\n📝 Step 2: Preparing test transaction...');
    const testMessageRecord = {
      blobId: 'test_blob_id_' + Date.now(),
      conversationId: 'test_conversation_' + Date.now(),
      messageType: 'text',
      suiObjectId: '',
      txDigest: '',
    };
    
    console.log('📋 Test message record:', testMessageRecord);
    
    // Step 3: Send transaction
    console.log('\n📤 Step 3: Sending transaction via MiniKit...');
    const result = await worldcoinService.storeMessageMetadata(
      contractAddress,
      messagingContractAbi,
      testMessageRecord,
      testUserAddress
    );
    
    console.log('\n📊 Transaction Result:');
    console.log('=====================');
    console.log(`Success: ${result.success}`);
    console.log(`Transaction Hash: ${result.transactionHash || 'N/A'}`);
    console.log(`Error: ${result.error || 'N/A'}`);
    
    if (result.success) {
      console.log('\n✅ Transaction sent successfully!');
      console.log('💡 Check WorldScan to see if the transaction was mined');
      
      // Step 4: Verify transaction on-chain
      console.log('\n🔍 Step 4: Verifying transaction on-chain...');
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
      
      // You can add additional verification here
      console.log('⏳ Transaction verification would happen here');
      
    } else {
      console.log('\n❌ Transaction failed!');
      console.log('💡 Check the error message above for details');
      
      if (result.error?.includes('invalid_contract')) {
        console.log('\n🔧 Troubleshooting:');
        console.log('   - Make sure the contract is whitelisted in Worldcoin Developer Portal');
        console.log('   - Check that the contract address is correct');
        console.log('   - Verify the MiniKit App ID is correct');
      } else if (result.error?.includes('simulation_failed')) {
        console.log('\n🔧 Troubleshooting:');
        console.log('   - Check the debug URL for detailed error information');
        console.log('   - Verify the function arguments are correct');
        console.log('   - Check if the contract function exists and is accessible');
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
  
  console.log('\n✅ MiniKit transaction test complete');
  console.log('====================================');
}

// Make available globally
if (typeof window !== 'undefined') {
  (window as any).testMiniKitTransaction = testMiniKitTransaction;
}

export default {
  testMiniKitTransaction
}; 