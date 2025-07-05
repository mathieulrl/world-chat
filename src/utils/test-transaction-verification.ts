/**
 * Test transaction verification with specific hash
 */

import { verifyTransactionHash } from './verify-transaction-hash';

export async function testTransactionVerification() {
  console.log('🧪 Testing Transaction Verification');
  console.log('==================================');
  
  const transactionHash = '0x5d2af0f674bec3df87335b41637c2da6899c3dcf2baa3fab620d96a17e52dfed';
  
  console.log(`📋 Testing transaction: ${transactionHash}`);
  console.log('');
  
  try {
    await verifyTransactionHash(transactionHash);
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
  
  console.log('\n✅ Test complete');
}

// Run the test
testTransactionVerification().catch(console.error);

export default {
  testTransactionVerification
}; 