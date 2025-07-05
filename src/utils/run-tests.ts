/**
 * Test runner for diagnosing smart contract reading issues
 */

import { testContractAccessibility } from './test-contract-accessibility';
import { testSmartContractReading } from './test-smart-contract-reading';
import { testMessageLoading } from './test-message-loading';

export async function runAllTests() {
  console.log('🚀 Running All Diagnostic Tests');
  console.log('================================');
  console.log('This will test:');
  console.log('1. Contract accessibility and RPC connection');
  console.log('2. Smart contract reading functions');
  console.log('3. Message loading and Walrus retrieval');
  console.log('');
  
  const results = {
    contractAccessibility: false,
    smartContractReading: false,
    messageLoading: false,
    errors: [] as string[],
  };
  
  try {
    // Test 1: Contract Accessibility
    console.log('\n🧪 Test 1: Contract Accessibility');
    console.log('==================================');
    try {
      await testContractAccessibility();
      results.contractAccessibility = true;
      console.log('✅ Contract accessibility test completed');
    } catch (error) {
      console.log(`❌ Contract accessibility test failed: ${error.message}`);
      results.errors.push(`Contract accessibility: ${error.message}`);
    }
    
    // Test 2: Smart Contract Reading
    console.log('\n🧪 Test 2: Smart Contract Reading');
    console.log('===================================');
    try {
      await testSmartContractReading();
      results.smartContractReading = true;
      console.log('✅ Smart contract reading test completed');
    } catch (error) {
      console.log(`❌ Smart contract reading test failed: ${error.message}`);
      results.errors.push(`Smart contract reading: ${error.message}`);
    }
    
    // Test 3: Message Loading
    console.log('\n🧪 Test 3: Message Loading');
    console.log('============================');
    try {
      await testMessageLoading();
      results.messageLoading = true;
      console.log('✅ Message loading test completed');
    } catch (error) {
      console.log(`❌ Message loading test failed: ${error.message}`);
      results.errors.push(`Message loading: ${error.message}`);
    }
    
  } catch (error) {
    console.error('❌ Test runner failed:', error);
    results.errors.push(`Test runner: ${error.message}`);
  }
  
  // Final Summary
  console.log('\n🎯 Final Test Summary');
  console.log('=====================');
  console.log(`📊 Contract Accessibility: ${results.contractAccessibility ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`📨 Smart Contract Reading: ${results.smartContractReading ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`📨 Message Loading: ${results.messageLoading ? '✅ PASS' : '❌ FAIL'}`);
  
  if (results.errors.length > 0) {
    console.log('\n❌ Errors Found:');
    results.errors.forEach((error, index) => {
      console.log(`  ${index + 1}. ${error}`);
    });
  }
  
  // Recommendations
  console.log('\n💡 Recommendations:');
  if (!results.contractAccessibility) {
    console.log('   - Check contract deployment and address');
    console.log('   - Verify RPC URL is accessible');
    console.log('   - Ensure contract is deployed on Worldcoin Sepolia');
  } else if (!results.smartContractReading) {
    console.log('   - Check contract ABI matches deployed contract');
    console.log('   - Verify contract functions exist');
    console.log('   - Test with different user addresses');
  } else if (!results.messageLoading) {
    console.log('   - Check Walrus storage connectivity');
    console.log('   - Verify message content retrieval');
    console.log('   - Test with fallback message creation');
  } else {
    console.log('   - All tests passed! Message loading should work');
  }
  
  console.log('\n✅ All tests completed');
  console.log('======================');
  
  return results;
}

// Make available globally
if (typeof window !== 'undefined') {
  (window as any).runAllTests = runAllTests;
}

export default {
  runAllTests
}; 