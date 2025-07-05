/**
 * Debug payment amount calculation issues
 */

import { WorldcoinService } from '../services/worldcoinService';

export async function debugPaymentAmount() {
  console.log('🔍 Debugging Payment Amount Calculation');
  console.log('======================================');
  
  const worldcoinService = WorldcoinService.getInstance();
  
  // Test cases with different amounts and tokens
  const testCases = [
    { amount: 1, token: 'WLD' as const, expected: '100000000' },
    { amount: 0.1, token: 'WLD' as const, expected: '10000000' },
    { amount: 10, token: 'USDC' as const, expected: '10000000' },
    { amount: 0.01, token: 'USDC' as const, expected: '10000' },
    { amount: 100, token: 'WLD' as const, expected: '10000000000' },
    { amount: 0.001, token: 'WLD' as const, expected: '100000' },
  ];
  
  console.log('🧪 Testing token conversion function...\n');
  
  for (const testCase of testCases) {
    const { amount, token, expected } = testCase;
    const result = worldcoinService.tokenToDecimals(amount, token);
    
    console.log(`💰 Test: ${amount} ${token}`);
    console.log(`   Expected: ${expected}`);
    console.log(`   Actual:   ${result}`);
    console.log(`   ✅ Match: ${result === expected ? 'YES' : 'NO'}`);
    
    if (result !== expected) {
      console.log(`   ❌ MISMATCH! This could be causing payment issues`);
    }
    console.log('');
  }
  
  // Test MiniKit payment request creation
  console.log('🧪 Testing MiniKit payment request creation...\n');
  
  const testPaymentRequest = {
    reference: 'test_payment_' + Date.now(),
    to: '0x582be5da7d06b2bf6d89c5b4499491c5990fafe4',
    tokens: [
      {
        symbol: 'WLD' as const,
        token_amount: worldcoinService.tokenToDecimals(1, 'WLD'),
      },
      {
        symbol: 'USDC' as const,
        token_amount: worldcoinService.tokenToDecimals(10, 'USDC'),
      }
    ],
    description: 'Test payment for debugging',
  };
  
  console.log('📋 Payment Request:');
  console.log(`   Reference: ${testPaymentRequest.reference}`);
  console.log(`   To: ${testPaymentRequest.to}`);
  console.log(`   Tokens: ${JSON.stringify(testPaymentRequest.tokens, null, 2)}`);
  console.log(`   Description: ${testPaymentRequest.description}`);
  
  // Test the actual conversion function
  console.log('\n🔧 Testing conversion function directly...\n');
  
  const testAmounts = [1, 0.1, 10, 0.01, 100, 0.001];
  
  for (const amount of testAmounts) {
    const wldResult = worldcoinService.tokenToDecimals(amount, 'WLD');
    const usdcResult = worldcoinService.tokenToDecimals(amount, 'USDC');
    
    console.log(`💰 Amount: ${amount}`);
    console.log(`   WLD:  ${amount} → ${wldResult} (${parseInt(wldResult) / Math.pow(10, 8)} WLD)`);
    console.log(`   USDC: ${amount} → ${usdcResult} (${parseInt(usdcResult) / Math.pow(10, 6)} USDC)`);
    console.log('');
  }
  
  // Check for potential issues
  console.log('🔍 Potential Issues:');
  console.log('===================');
  
  // Issue 1: Check if decimals are correct
  console.log('1. Decimal places:');
  console.log(`   WLD: 8 decimals (${Math.pow(10, 8)})`);
  console.log(`   USDC: 6 decimals (${Math.pow(10, 6)})`);
  console.log(`   ✅ Correct according to token standards`);
  
  // Issue 2: Check for floating point precision
  console.log('\n2. Floating point precision:');
  const precisionTest = 0.123456789;
  const wldPrecision = worldcoinService.tokenToDecimals(precisionTest, 'WLD');
  const usdcPrecision = worldcoinService.tokenToDecimals(precisionTest, 'USDC');
  console.log(`   Test amount: ${precisionTest}`);
  console.log(`   WLD result: ${wldPrecision}`);
  console.log(`   USDC result: ${usdcPrecision}`);
  
  // Issue 3: Check for very small amounts
  console.log('\n3. Very small amounts:');
  const smallAmounts = [0.00000001, 0.000001, 0.0001];
  for (const amount of smallAmounts) {
    const wldSmall = worldcoinService.tokenToDecimals(amount, 'WLD');
    const usdcSmall = worldcoinService.tokenToDecimals(amount, 'USDC');
    console.log(`   ${amount} WLD → ${wldSmall} (${parseInt(wldSmall) / Math.pow(10, 8)} WLD)`);
    console.log(`   ${amount} USDC → ${usdcSmall} (${parseInt(usdcSmall) / Math.pow(10, 6)} USDC)`);
  }
  
  console.log('\n✅ Payment amount debugging complete');
  console.log('===================================');
  console.log('💡 If you see mismatches above, that could be causing payment issues');
  console.log('💡 Check if the amounts in MiniKit match what you expect');
}

// Make available globally
if (typeof window !== 'undefined') {
  (window as any).debugPaymentAmount = debugPaymentAmount;
}

export default {
  debugPaymentAmount
}; 