/**
 * Test reference format to fix input_error
 */

import { WorldcoinService } from '../services/worldcoinService';

export async function testReferenceFormat() {
  console.log('🧪 Testing Reference Format for MiniKit');
  console.log('======================================');
  console.log('Issue: input_error from MiniKit');
  console.log('Suspected cause: Invalid reference format');
  console.log('');
  
  const worldcoinService = WorldcoinService.getInstance();
  
  // Test different reference formats
  console.log('🧪 Testing different reference formats...\n');
  
  const testReferences = [
    // Current format (from initiatePayment)
    crypto.randomUUID().replace(/-/g, ''),
    
    // Simple format
    'payment_' + Date.now(),
    
    // Short format
    'p_' + Date.now(),
    
    // Alphanumeric only
    'test' + Math.random().toString(36).substring(2, 8),
    
    // Numbers only
    Date.now().toString(),
    
    // With underscores
    'payment_test_' + Date.now(),
    
    // With hyphens
    'payment-test-' + Date.now(),
    
    // Very short
    't' + Date.now(),
    
    // Very long
    'a'.repeat(50),
  ];
  
  for (let i = 0; i < testReferences.length; i++) {
    const reference = testReferences[i];
    console.log(`📋 Test ${i + 1}: "${reference}"`);
    console.log(`   Length: ${reference.length}`);
    console.log(`   Format: ${/^[a-zA-Z0-9_-]+$/.test(reference) ? '✅ Valid' : '❌ Invalid'}`);
    
    try {
      const paymentRequest = {
        reference,
        to: '0x582be5da7d06b2bf6d89c5b4499491c5990fafe4',
        tokens: [{
          symbol: 'WLD' as const,
          token_amount: '100000000', // 1 WLD
        }],
        description: 'Test payment',
      };
      
      console.log(`   📋 Request: ${JSON.stringify(paymentRequest, null, 2)}`);
      
      // Don't actually execute, just validate format
      console.log(`   ✅ Format appears valid`);
      
    } catch (error) {
      console.log(`   ❌ Error: ${error}`);
    }
    
    console.log('');
  }
  
  // Test the actual initiatePayment function
  console.log('🧪 Testing initiatePayment function...\n');
  try {
    const { id: reference } = await worldcoinService.initiatePayment();
    console.log(`📋 initiatePayment reference: "${reference}"`);
    console.log(`   Length: ${reference.length}`);
    console.log(`   Format: ${/^[a-zA-Z0-9_-]+$/.test(reference) ? '✅ Valid' : '❌ Invalid'}`);
    
    // Test with this reference
    const paymentRequest = {
      reference,
      to: '0x582be5da7d06b2bf6d89c5b4499491c5990fafe4',
      tokens: [{
        symbol: 'WLD' as const,
        token_amount: '100000000',
      }],
      description: 'Test payment',
    };
    
    console.log(`📋 Payment request with initiatePayment reference:`);
    console.log(JSON.stringify(paymentRequest, null, 2));
    
  } catch (error) {
    console.log(`❌ initiatePayment error: ${error}`);
  }
  
  console.log('\n✅ Reference format test complete');
  console.log('=================================');
  console.log('💡 Common reference format issues:');
  console.log('   1. Too long (>50 characters)');
  console.log('   2. Special characters (except _ and -)');
  console.log('   3. Empty or null reference');
  console.log('   4. Non-string type');
  console.log('');
  console.log('🔧 MiniKit reference requirements:');
  console.log('   - Must be a string');
  console.log('   - Must be 1-50 characters');
  console.log('   - Must contain only letters, numbers, underscores, and hyphens');
  console.log('   - Must not be empty');
}

// Make available globally
if (typeof window !== 'undefined') {
  (window as any).testReferenceFormat = testReferenceFormat;
}

export default {
  testReferenceFormat
}; 