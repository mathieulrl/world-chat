/**
 * Test utility for MiniKit transaction format verification (JavaScript version)
 * Based on official documentation: https://docs.world.org/mini-apps/commands/send-transaction#creating-a-transaction
 */

async function testMiniKitTransactionFormat() {
  console.log('🧪 Testing MiniKit Transaction Format');
  console.log('=====================================');
  
  // Test transaction according to official documentation
  const testTransaction = {
    address: '0x063816286ae3312e759f80Afdb10C8879b30688D',
    abi: [
      {
        "inputs": [
          {
            "internalType": "string",
            "name": "blobId",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "conversationId",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "messageType",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "suiObjectId",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "txDigest",
            "type": "string"
          }
        ],
        "name": "storeMessage",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      }
    ],
    functionName: 'storeMessage',
    args: [
      'test-blob-id-123',
      'test-conversation-456',
      'text',
      '',
      ''
    ],
    value: '0x0'
  };

  console.log('\n📋 Test Transaction Details:');
  console.log('-----------------------------');
  console.log(`Address: ${testTransaction.address}`);
  console.log(`Function: ${testTransaction.functionName}`);
  console.log(`Args: ${JSON.stringify(testTransaction.args)}`);
  console.log(`Value: ${testTransaction.value}`);
  console.log(`ABI: ${JSON.stringify(testTransaction.abi)}`);

  console.log('\n📋 Official MiniKit Transaction Format:');
  console.log('----------------------------------------');
  console.log('According to documentation:');
  console.log('- address: string (Contract address)');
  console.log('- abi: Abi | readonly unknown[] (Only include functions you\'re using)');
  console.log('- functionName: string (Function to call)');
  console.log('- args: any[] (Function arguments)');
  console.log('- value?: string (Hex string, optional)');
  console.log('- NO chainId field (handled by World App)');

  console.log('\n📋 Developer Portal Configuration:');
  console.log('----------------------------------');
  console.log('Important: Contracts must be specified in Developer Portal');
  console.log('1. Go to Developer Portal');
  console.log('2. Configuration → Advanced');
  console.log('3. Add contract: 0x063816286ae3312e759f80Afdb10C8879b30688D');
  console.log('4. Select chain: Worldcoin Sepolia (4801)');

  console.log('\n📋 Transaction Object Structure:');
  console.log('--------------------------------');
  const transactionObject = {
    address: testTransaction.address,
    abi: testTransaction.abi,
    functionName: testTransaction.functionName,
    args: testTransaction.args,
    value: testTransaction.value,
  };
  
  console.log('Correct format:');
  console.log(JSON.stringify(transactionObject, null, 2));

  console.log('\n📋 MiniKit.sendTransaction Call:');
  console.log('--------------------------------');
  console.log('Correct API call:');
  console.log(`
await MiniKit.commandsAsync.sendTransaction({
  transaction: [transactionObject],
  formatPayload: true, // Optional, defaults to true
});
  `);

  console.log('\n✅ Transaction Format Test Complete');
  console.log('==================================');
  console.log('\n💡 Key Points:');
  console.log('1. Remove chainId from transaction object');
  console.log('2. Ensure contract is specified in Developer Portal');
  console.log('3. Use correct ABI format (only needed functions)');
  console.log('4. Value must be hex string (0x0 for no value)');
  console.log('5. Chain configuration is handled by World App');
  
  console.log('\n🔧 Next Steps:');
  console.log('1. Update transaction format in WorldcoinService');
  console.log('2. Add contract to Developer Portal');
  console.log('3. Test with correct format');
  console.log('4. Remove fallback error handling if working');
}

function getMiniKitTransactionGuide() {
  return [
    '📋 MiniKit Transaction Format Guide',
    '===================================',
    '',
    '✅ Correct Format:',
    '{',
    '  address: "0x...",',
    '  abi: [...],',
    '  functionName: "functionName",',
    '  args: [...],',
    '  value: "0x0"',
    '}',
    '',
    '❌ Common Mistakes:',
    '- Adding chainId field (not supported)',
    '- Not specifying contract in Developer Portal',
    '- Incorrect ABI format',
    '- Wrong value format (should be hex string)',
    '',
    '🔧 Developer Portal Setup:',
    '1. Go to Developer Portal',
    '2. Configuration → Advanced',
    '3. Add your contract address',
    '4. Select correct chain',
    '',
    '📚 Documentation:',
    'https://docs.world.org/mini-apps/commands/send-transaction#creating-a-transaction'
  ];
}

// Run the test
testMiniKitTransactionFormat().catch(console.error);

// Export for use in other files
module.exports = {
  testMiniKitTransactionFormat,
  getMiniKitTransactionGuide
}; 