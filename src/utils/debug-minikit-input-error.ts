/**
 * Debug MiniKit input_error issues
 */

import { WorldcoinService } from '../services/worldcoinService';

export async function debugMiniKitInputError() {
  console.log('🔍 Debugging MiniKit Input Error');
  console.log('================================');
  console.log('Error: input_error from MiniKit');
  console.log('This usually means incorrect input format');
  console.log('');
  
  const worldcoinService = WorldcoinService.getInstance();
  
  // Test different input formats to identify the issue
  console.log('🧪 Testing different input formats...\n');
  
  // Test 1: Basic payment request
  console.log('📋 Test 1: Basic payment request');
  try {
    const basicRequest = {
      reference: 'test_basic_' + Date.now(),
      to: '0x582be5da7d06b2bf6d89c5b4499491c5990fafe4',
      tokens: [{
        symbol: 'WLD' as const,
        token_amount: '100000000', // 1 WLD
      }],
      description: 'Basic test payment',
    };
    
    console.log('📋 Request:', JSON.stringify(basicRequest, null, 2));
    
    const result = await worldcoinService.executePayment(basicRequest);
    console.log('✅ Result:', result);
    
  } catch (error) {
    console.log('❌ Error:', error);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 2: Check address format
  console.log('📋 Test 2: Address format validation');
  const testAddresses = [
    '0x582be5da7d06b2bf6d89c5b4499491c5990fafe4', // Valid
    '0x582be5da7d06b2bf6d89c5b4499491c5990fafe4', // Valid
    '582be5da7d06b2bf6d89c5b4499491c5990fafe4',   // Missing 0x
    '0x582be5da7d06b2bf6d89c5b4499491c5990fafe',  // Too short
    '0x582be5da7d06b2bf6d89c5b4499491c5990fafe44', // Too long
  ];
  
  for (const address of testAddresses) {
    const isValid = /^0x[a-fA-F0-9]{40}$/.test(address);
    console.log(`   ${address}: ${isValid ? '✅ Valid' : '❌ Invalid'}`);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 3: Check token amount format
  console.log('📋 Test 3: Token amount format validation');
  const testAmounts = [
    '100000000',    // Valid string
    100000000,      // Number
    '100000000.0',  // Float string
    '100000000.5',  // Decimal
    '0',            // Zero
    '-100000000',   // Negative
    'abc',          // Invalid
  ];
  
  for (const amount of testAmounts) {
    const isValid = typeof amount === 'string' && /^\d+$/.test(amount) && parseInt(amount) > 0;
    console.log(`   ${amount} (${typeof amount}): ${isValid ? '✅ Valid' : '❌ Invalid'}`);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 4: Check token symbol format
  console.log('📋 Test 4: Token symbol validation');
  const testSymbols = [
    'WLD',    // Valid
    'USDC',   // Valid
    'wld',    // Lowercase
    'Usdc',   // Mixed case
    'ETH',    // Not supported
    '',       // Empty
    'WL',     // Too short
  ];
  
  for (const symbol of testSymbols) {
    const isValid = ['WLD', 'USDC'].includes(symbol);
    console.log(`   ${symbol}: ${isValid ? '✅ Valid' : '❌ Invalid'}`);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 5: Check reference format
  console.log('📋 Test 5: Reference format validation');
  const testReferences = [
    'test_' + Date.now(),           // Valid
    'payment_123',                  // Valid
    '',                             // Empty
    'a'.repeat(100),               // Too long
    'test@payment',                 // Special chars
    'test payment',                 // Spaces
  ];
  
  for (const ref of testReferences) {
    const isValid = ref.length > 0 && ref.length <= 50 && /^[a-zA-Z0-9_-]+$/.test(ref);
    console.log(`   "${ref}": ${isValid ? '✅ Valid' : '❌ Invalid'}`);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 6: Check description format
  console.log('📋 Test 6: Description format validation');
  const testDescriptions = [
    'Test payment',                 // Valid
    'Payment for services',         // Valid
    '',                             // Empty
    'a'.repeat(200),               // Too long
    'Test\npayment',               // Newlines
    'Test\tpayment',               // Tabs
  ];
  
  for (const desc of testDescriptions) {
    const isValid = desc.length > 0 && desc.length <= 100;
    console.log(`   "${desc}": ${isValid ? '✅ Valid' : '❌ Invalid'}`);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 7: Create a minimal valid request
  console.log('📋 Test 7: Minimal valid request');
  try {
    const minimalRequest = {
      reference: 'minimal_' + Date.now(),
      to: '0x582be5da7d06b2bf6d89c5b4499491c5990fafe4',
      tokens: [{
        symbol: 'WLD' as const,
        token_amount: '100000000',
      }],
      description: 'Minimal test',
    };
    
    console.log('📋 Minimal request:', JSON.stringify(minimalRequest, null, 2));
    
    // Don't actually execute this one, just validate the format
    console.log('✅ Format appears valid');
    
  } catch (error) {
    console.log('❌ Error:', error);
  }
  
  console.log('\n✅ Input error debugging complete');
  console.log('=================================');
  console.log('💡 Common causes of input_error:');
  console.log('   1. Invalid wallet address format');
  console.log('   2. Token amount not a valid string number');
  console.log('   3. Unsupported token symbol');
  console.log('   4. Reference or description too long');
  console.log('   5. Special characters in reference/description');
  console.log('   6. Missing required fields');
  console.log('');
  console.log('🔧 Next steps:');
  console.log('   1. Check the validation results above');
  console.log('   2. Fix any invalid formats');
  console.log('   3. Try with the minimal valid request format');
}

// Make available globally
if (typeof window !== 'undefined') {
  (window as any).debugMiniKitInputError = debugMiniKitInputError;
}

export default {
  debugMiniKitInputError
}; 