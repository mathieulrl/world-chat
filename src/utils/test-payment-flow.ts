/**
 * Test complete payment flow to identify amount issues
 */

import { WorldcoinService } from '../services/worldcoinService';

export async function testPaymentFlow() {
  console.log('🧪 Testing Complete Payment Flow');
  console.log('================================');
  
  const worldcoinService = WorldcoinService.getInstance();
  const testAmount = 1.5; // Test with 1.5 WLD
  const testToken = 'WLD' as const;
  const recipientAddress = '0xa882a2af989de54330f994cf626ea7f5d5edc2fc'; // ewan's address
  
  console.log(`💰 Testing payment: ${testAmount} ${testToken}`);
  console.log(`📤 Recipient: ${recipientAddress}`);
  console.log('');
  
  try {
    // Step 1: Initialize MiniKit
    console.log('📱 Step 1: Initializing MiniKit...');
    const initialized = await worldcoinService.initializeMiniKit();
    if (!initialized) {
      console.log('❌ MiniKit initialization failed');
      return;
    }
    console.log('✅ MiniKit initialized');
    
    // Step 2: Convert amount to decimals
    console.log('\n🔧 Step 2: Converting amount to decimals...');
    const tokenAmount = worldcoinService.tokenToDecimals(testAmount, testToken);
    console.log(`   Input amount: ${testAmount} ${testToken}`);
    console.log(`   Converted to: ${tokenAmount} (${parseInt(tokenAmount) / Math.pow(10, testToken === 'WLD' ? 8 : 6)} ${testToken})`);
    
    // Step 3: Create payment request
    console.log('\n📋 Step 3: Creating payment request...');
    const paymentRequest = {
      reference: `test_payment_${Date.now()}`,
      to: recipientAddress,
      tokens: [{
        symbol: testToken,
        token_amount: tokenAmount,
      }],
      description: `Test payment of ${testAmount} ${testToken}`,
    };
    
    console.log('📋 Payment Request Details:');
    console.log(`   Reference: ${paymentRequest.reference}`);
    console.log(`   To: ${paymentRequest.to}`);
    console.log(`   Token: ${paymentRequest.tokens[0].symbol}`);
    console.log(`   Amount: ${paymentRequest.tokens[0].token_amount}`);
    console.log(`   Description: ${paymentRequest.description}`);
    
    // Step 4: Execute payment (this will show the MiniKit UI)
    console.log('\n📤 Step 4: Executing payment via MiniKit...');
    console.log('⚠️  MiniKit UI will appear - check the amount shown');
    console.log('⚠️  Compare the amount in MiniKit with what you expect');
    
    const result = await worldcoinService.executePayment(paymentRequest);
    
    console.log('\n📊 Step 5: Payment result...');
    console.log(`   Status: ${result.status}`);
    console.log(`   Transaction Hash: ${result.transactionHash || 'N/A'}`);
    console.log(`   Error: ${result.error || 'N/A'}`);
    
    if (result.status === 'success') {
      console.log('✅ Payment executed successfully!');
      console.log('💡 Check if the amount in MiniKit matched your expectation');
    } else {
      console.log('❌ Payment failed');
      console.log(`   Error: ${result.error}`);
    }
    
  } catch (error) {
    console.error('❌ Payment flow test failed:', error);
  }
  
  console.log('\n✅ Payment flow test complete');
  console.log('=============================');
  console.log('💡 Key things to check:');
  console.log('   1. Does the amount in MiniKit match what you entered?');
  console.log('   2. Is the token type correct?');
  console.log('   3. Is the recipient address correct?');
  console.log('   4. Does the description match your expectation?');
}

// Make available globally
if (typeof window !== 'undefined') {
  (window as any).testPaymentFlow = testPaymentFlow;
}

export default {
  testPaymentFlow
}; 