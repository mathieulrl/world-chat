import { WorldcoinService } from '../services/worldcoinService';
import { messagingContractAbi } from '../abis/messagingContractAbi';

/**
 * Test transaction value formatting for Worldcoin MiniKit
 */
export async function testTransactionValue() {
  console.log('🧪 Testing Transaction Value Formatting...');

  try {
    const worldcoinService = WorldcoinService.getInstance();
    
    // Test 1: Zero value transaction
    console.log('\n📝 Test 1: Zero value transaction');
    const zeroValueResult = await worldcoinService.executeContractTransaction({
      contractAddress: '0x063816286ae3312e759f80Afdb10C8879b30688D',
      abi: messagingContractAbi,
      functionName: 'storeMessage',
      args: [
        'test-blob-id',
        'test-conversation-id',
        'text',
        'test-sui-object-id',
        'test-tx-digest'
      ],
      value: 0n, // Zero value as bigint
    }, '0x582be5da7d06b2bf6d89c5b4499491c5990fafe4');

    console.log(`✅ Zero value transaction result: ${zeroValueResult.success ? 'SUCCESS' : 'FAILED'}`);
    if (!zeroValueResult.success) {
      console.log(`   Error: ${zeroValueResult.error}`);
    }

    // Test 2: Non-zero value transaction
    console.log('\n💰 Test 2: Non-zero value transaction');
    const nonZeroValueResult = await worldcoinService.executeContractTransaction({
      contractAddress: '0x063816286ae3312e759f80Afdb10C8879b30688D',
      abi: messagingContractAbi,
      functionName: 'storeMessage',
      args: [
        'test-blob-id-2',
        'test-conversation-id-2',
        'text',
        'test-sui-object-id-2',
        'test-tx-digest-2'
      ],
      value: 1000000000000000n, // 0.001 ETH as bigint
    }, '0x582be5da7d06b2bf6d89c5b4499491c5990fafe4');

    console.log(`✅ Non-zero value transaction result: ${nonZeroValueResult.success ? 'SUCCESS' : 'FAILED'}`);
    if (!nonZeroValueResult.success) {
      console.log(`   Error: ${nonZeroValueResult.error}`);
    }

    // Test 3: Undefined value transaction
    console.log('\n❓ Test 3: Undefined value transaction');
    const undefinedValueResult = await worldcoinService.executeContractTransaction({
      contractAddress: '0x063816286ae3312e759f80Afdb10C8879b30688D',
      abi: messagingContractAbi,
      functionName: 'storeMessage',
      args: [
        'test-blob-id-3',
        'test-conversation-id-3',
        'text',
        'test-sui-object-id-3',
        'test-tx-digest-3'
      ],
      // No value specified
    }, '0x582be5da7d06b2bf6d89c5b4499491c5990fafe4');

    console.log(`✅ Undefined value transaction result: ${undefinedValueResult.success ? 'SUCCESS' : 'FAILED'}`);
    if (!undefinedValueResult.success) {
      console.log(`   Error: ${undefinedValueResult.error}`);
    }

    console.log('\n🎉 Transaction value formatting test completed!');
    console.log('\n📋 Summary:');
    console.log(`   - Zero value: ${zeroValueResult.success ? '✅ Success' : '❌ Failed'}`);
    console.log(`   - Non-zero value: ${nonZeroValueResult.success ? '✅ Success' : '❌ Failed'}`);
    console.log(`   - Undefined value: ${undefinedValueResult.success ? '✅ Success' : '❌ Failed'}`);

    return {
      success: true,
      zeroValue: zeroValueResult.success,
      nonZeroValue: nonZeroValueResult.success,
      undefinedValue: undefinedValueResult.success,
    };

  } catch (error) {
    console.error('❌ Transaction value test failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Export for use in development
export default testTransactionValue; 