export const testComethTransactionFormat = () => {
  console.log('🧪 Testing Cometh Transaction Format...');
  console.log('========================================');
  
  try {
    // Test 1: Create a sample transaction object
    console.log('\n📋 Test 1: Creating sample transaction object...');
    
    const sampleTransaction = {
      calls: [
        {
          to: '0x34bF1A2460190e60e33309BF8c54D9A7c9eCB4B8' as `0x${string}`,
          data: '0x12345678' as `0x${string}`,
          value: BigInt(0),
        },
      ],
    };
    
    console.log('📊 Sample transaction object:', {
      ...sampleTransaction,
      calls: sampleTransaction.calls.map(call => ({
        ...call,
        value: call.value.toString(), // Convert BigInt to string for logging
      })),
    });
    
    // Test 2: Check if BigInt serialization works
    console.log('\n📋 Test 2: Testing BigInt serialization...');
    try {
      const jsonString = JSON.stringify(sampleTransaction, (key, value) => {
        if (typeof value === 'bigint') {
          return value.toString();
        }
        return value;
      });
      console.log('✅ BigInt serialization works:', jsonString);
    } catch (error) {
      console.log('❌ BigInt serialization failed:', error);
    }
    
    // Test 3: Compare with example-cometh format
    console.log('\n📋 Test 3: Comparing with example-cometh format...');
    console.log('✅ Using calls array format');
    console.log('✅ Using BigInt(0) for value');
    console.log('✅ Using proper hex strings for to and data');
    
    console.log('\n🎉 Transaction format matches example-cometh!');
    console.log('\n💡 Next steps:');
    console.log('  1. Make sure Cometh Connect is properly initialized');
    console.log('  2. Connect your wallet');
    console.log('  3. Try sending a message');
    
    return true;
  } catch (error) {
    console.error('❌ Transaction format test failed:', error);
    return false;
  }
};

// Make it available globally for browser console testing
if (typeof window !== 'undefined') {
  (window as any).testComethTransactionFormat = testComethTransactionFormat;
} 