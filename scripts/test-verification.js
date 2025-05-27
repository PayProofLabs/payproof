const StellarSdk = require('@stellar/stellar-sdk');

// Test transaction hash from our previous transaction
const TEST_HASH = '980a03a11a6e212ac2d6a739188c89437f9cfb1b0302b8aeb58c573a06ef71d4';

async function testTransactionVerification() {
  console.log('🧪 Testing PayProof transaction verification...\n');
  
  try {
    // Create Stellar service instance (similar to our lib/stellar.ts)
    const server = new StellarSdk.Horizon.Server('https://horizon-testnet.stellar.org');
    
    console.log(`📋 Testing transaction: ${TEST_HASH}`);
    
    // Step 1: Validate hash format
    console.log('\n1. Validating transaction hash format...');
    const isValidFormat = /^[a-fA-F0-9]{64}$/.test(TEST_HASH);
    console.log(`   Format validation: ${isValidFormat ? '✅ PASS' : '❌ FAIL'}`);
    
    // Step 2: Fetch transaction from network
    console.log('\n2. Fetching transaction from Stellar network...');
    const transaction = await server.transactions().transaction(TEST_HASH).call();
    console.log('   ✅ Transaction retrieved successfully');
    console.log(`   Status: ${transaction.successful ? 'Success' : 'Failed'}`);
    console.log(`   Ledger: ${transaction.ledger_attr}`);
    console.log(`   Created: ${transaction.created_at}`);
    
    // Step 3: Fetch operations
    console.log('\n3. Fetching transaction operations...');
    const operations = await server.operations().forTransaction(TEST_HASH).call();
    console.log(`   ✅ Found ${operations.records.length} operations`);
    
    // Step 4: Filter payment operations
    const paymentOperations = operations.records.filter(op => 
      op.type === 'payment' || 
      op.type === 'path_payment_strict_receive' || 
      op.type === 'path_payment_strict_send'
    );
    console.log(`   💰 Payment operations: ${paymentOperations.length}`);
    
    // Step 5: Display payment details
    if (paymentOperations.length > 0) {
      console.log('\n4. Payment operation details:');
      paymentOperations.forEach((op, index) => {
        console.log(`   Payment ${index + 1}:`);
        console.log(`     From: ${op.from}`);
        console.log(`     To: ${op.to}`);
        console.log(`     Amount: ${op.amount} ${op.asset_code || 'XLM'}`);
        console.log(`     Type: ${op.type}`);
      });
    }
    
    console.log('\n🎉 Transaction verification test PASSED!');
    console.log('\n📱 Ready to test in PayProof UI:');
    console.log(`   1. Open: http://localhost:3001/verify`);
    console.log(`   2. Paste hash: ${TEST_HASH}`);
    console.log(`   3. Click "Verify Transaction"`);
    console.log(`   4. Generate receipt for the payment operation`);
    
    return {
      success: true,
      transaction: transaction,
      paymentCount: paymentOperations.length
    };
    
  } catch (error) {
    console.error('\n❌ Transaction verification test FAILED:');
    console.error(error.message);
    return { success: false, error: error.message };
  }
}

// Run the test
testTransactionVerification();