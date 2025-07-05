import { MiniKit } from '@worldcoin/minikit-js';
import { WorldcoinService } from '../services/worldcoinService';
import { SmartContractService } from '../services/smartContractService';

/**
 * Simple diagnostic function to identify transaction and payment issues
 */
export async function diagnoseIssues() {
  console.log('🔍 Diagnosing Transaction and Payment Issues...');
  console.log('==============================================');
  
  try {
    // Test 1: Check MiniKit initialization
    console.log('\n📋 Test 1: Checking MiniKit initialization...');
    const worldcoinService = WorldcoinService.getInstance();
    const isInitialized = await worldcoinService.initializeMiniKit();
    console.log(`✅ MiniKit initialized: ${isInitialized}`);
    
    // Test 2: Check contract accessibility
    console.log('\n📋 Test 2: Checking contract accessibility...');
    try {
      const smartContractService = new SmartContractService({
        contractAddress: '0x063816286ae3312e759f80Afdb10C8879b30688D',
        network: 'testnet',
        rpcUrl: 'https://worldchain-sepolia.drpc.org',
      });
      
      const messageCount = await smartContractService.getUserMessageCount('0x582be5da7d06b2bf6d89c5b4499491c5990fafe4');
      console.log(`✅ Contract is accessible. Message count: ${messageCount}`);
    } catch (error) {
      console.log(`❌ Contract accessibility issue: ${error.message}`);
    }
    
    // Test 3: Test a simple transaction
    console.log('\n📋 Test 3: Testing simple transaction...');
    try {
      const result = await MiniKit.commandsAsync.sendTransaction({
        transaction: [{
          address: '0x063816286ae3312e759f80Afdb10C8879b30688D',
          abi: [{
            type: 'function',
            name: 'storeMessage',
            inputs: [
              { type: 'string', name: 'blobId' },
              { type: 'string', name: 'conversationId' },
              { type: 'string', name: 'messageType' },
              { type: 'string', name: 'suiObjectId' },
              { type: 'string', name: 'txDigest' }
            ],
            outputs: [],
            stateMutability: 'nonpayable'
          }],
          functionName: 'storeMessage',
          args: [
            `test-blob-${Date.now()}`,
            `test-conversation-${Date.now()}`,
            'text',
            '',
            ''
          ]
        }],
        formatPayload: true
      });
      
      console.log('📊 Transaction result:', result);
      
      if (result.finalPayload.status === 'success') {
        console.log('✅ Transaction successful!');
      } else {
        console.log(`❌ Transaction failed: ${result.finalPayload.error_code}`);
        console.log('💡 This might indicate:');
        console.log('   - Contract not registered with MiniKit');
        console.log('   - World App not properly connected');
        console.log('   - User rejected the transaction');
      }
    } catch (error) {
      console.log(`❌ Transaction error: ${error.message}`);
    }
    
    // Test 4: Test payment
    console.log('\n📋 Test 4: Testing payment...');
    try {
      const result = await MiniKit.commandsAsync.pay({
        reference: `test-payment-${Date.now()}`,
        to: '0x582be5da7d06b2bf6d89c5b4499491c5990fafe4',
        tokens: [{
          symbol: 'WLD' as any,
          token_amount: '100000000', // 1 WLD
        }],
        description: 'Test payment',
      });
      
      console.log('📊 Payment result:', result);
      
      if (result.finalPayload.status === 'success') {
        console.log('✅ Payment successful!');
      } else {
        console.log(`❌ Payment failed: ${result.finalPayload.error_code}`);
        console.log('💡 This might indicate:');
        console.log('   - Insufficient balance');
        console.log('   - World App not properly connected');
        console.log('   - User rejected the payment');
      }
    } catch (error) {
      console.log(`❌ Payment error: ${error.message}`);
    }
    
    console.log('\n🎯 Diagnosis Complete!');
    console.log('📝 Next steps:');
    console.log('   1. Check if contract is registered in Worldcoin Developer Portal');
    console.log('   2. Ensure World App is properly connected');
    console.log('   3. Check user has sufficient balance for payments');
    
  } catch (error) {
    console.error('❌ Diagnosis failed:', error);
  }
}

// Make function available globally
if (typeof window !== 'undefined') {
  (window as any).diagnoseIssues = diagnoseIssues;
} 