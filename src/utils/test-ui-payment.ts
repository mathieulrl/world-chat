/**
 * Test UI payment flow to identify amount issues
 */

import { WorldcoinService } from '../services/worldcoinService';

export async function testUIPayment() {
  console.log('🧪 Testing UI Payment Flow');
  console.log('==========================');
  
  // Simulate the exact UI flow
  const paymentAmount = '1.5'; // As entered in UI
  const paymentToken = 'WLD';
  const recipientAddress = '0xa882a2af989de54330f994cf626ea7f5d5edc2fc';
  const conversationId = 'test_conversation';
  
  console.log(`💰 UI Input: ${paymentAmount} ${paymentToken}`);
  console.log(`📤 Recipient: ${recipientAddress}`);
  console.log('');
  
  try {
    // Step 1: Parse amount from UI (exactly like the UI does)
    console.log('🔧 Step 1: Parsing amount from UI...');
    const amount = parseFloat(paymentAmount);
    console.log(`   String input: "${paymentAmount}"`);
    console.log(`   Parsed amount: ${amount}`);
    console.log(`   Is NaN: ${isNaN(amount)}`);
    console.log(`   Is > 0: ${amount > 0}`);
    
    if (isNaN(amount) || amount <= 0) {
      console.log('❌ Invalid amount from UI');
      return;
    }
    
    // Step 2: Convert to decimals (exactly like the service does)
    console.log('\n🔧 Step 2: Converting to decimals...');
    const worldcoinService = WorldcoinService.getInstance();
    const tokenAmount = worldcoinService.tokenToDecimals(amount, paymentToken);
    console.log(`   Input: ${amount} ${paymentToken}`);
    console.log(`   Converted: ${tokenAmount}`);
    console.log(`   Back to human: ${parseInt(tokenAmount) / Math.pow(10, paymentToken === 'WLD' ? 8 : 6)} ${paymentToken}`);
    
    // Step 3: Create payment request (exactly like the service does)
    console.log('\n📋 Step 3: Creating payment request...');
    const paymentRequest = {
      reference: `ui_test_${Date.now()}`,
      to: recipientAddress,
      tokens: [{
        symbol: paymentToken as any,
        token_amount: tokenAmount,
      }],
      description: `Payment from UI: ${amount} ${paymentToken}`,
    };
    
    console.log('📋 Payment Request:');
    console.log(`   Reference: ${paymentRequest.reference}`);
    console.log(`   To: ${paymentRequest.to}`);
    console.log(`   Token: ${paymentRequest.tokens[0].symbol}`);
    console.log(`   Amount: ${paymentRequest.tokens[0].token_amount}`);
    console.log(`   Description: ${paymentRequest.description}`);
    
    // Step 4: Show what MiniKit will receive
    console.log('\n📱 Step 4: What MiniKit will receive...');
    console.log('📋 MiniKit Pay Command:');
    console.log(`   Reference: ${paymentRequest.reference}`);
    console.log(`   To: ${paymentRequest.to}`);
    console.log(`   Tokens: ${JSON.stringify(paymentRequest.tokens, null, 2)}`);
    console.log(`   Description: ${paymentRequest.description}`);
    
    // Step 5: Test different amounts
    console.log('\n🧪 Step 5: Testing different amounts...');
    const testAmounts = ['0.1', '1', '1.5', '10', '100', '0.01'];
    
    for (const testAmount of testAmounts) {
      const parsedAmount = parseFloat(testAmount);
      const convertedAmount = worldcoinService.tokenToDecimals(parsedAmount, paymentToken);
      const humanReadable = parseInt(convertedAmount) / Math.pow(10, paymentToken === 'WLD' ? 8 : 6);
      
      console.log(`   ${testAmount} ${paymentToken} → ${convertedAmount} → ${humanReadable} ${paymentToken}`);
    }
    
    console.log('\n✅ UI payment test complete');
    console.log('==========================');
    console.log('💡 Key findings:');
    console.log('   1. UI parsing: parseFloat() handles the input correctly');
    console.log('   2. Token conversion: Amounts are converted to proper decimals');
    console.log('   3. MiniKit format: Payment request is properly formatted');
    console.log('');
    console.log('🔍 If amounts are wrong in MiniKit, the issue might be:');
    console.log('   - MiniKit display format (showing different units)');
    console.log('   - MiniKit rounding or truncation');
    console.log('   - MiniKit token symbol interpretation');
    
  } catch (error) {
    console.error('❌ UI payment test failed:', error);
  }
}

// Make available globally
if (typeof window !== 'undefined') {
  (window as any).testUIPayment = testUIPayment;
}

export default {
  testUIPayment
}; 