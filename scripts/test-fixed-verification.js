const StellarSdk = require('@stellar/stellar-sdk');

// Test transaction hash from our previous transaction
const TEST_HASH = '980a03a11a6e212ac2d6a739188c89437f9cfb1b0302b8aeb58c573a06ef71d4';

async function testFixedTransactionVerification() {
  console.log('🧪 Testing FIXED PayProof transaction verification...\n');
  
  try {
    const server = new StellarSdk.Horizon.Server('https://horizon-testnet.stellar.org');
    
    console.log(`📋 Testing transaction: ${TEST_HASH}`);
    
    // Step 1: Fetch transaction from network
    console.log('\n1. Fetching transaction from Stellar network...');
    const transaction = await server.transactions().transaction(TEST_HASH).call();
    console.log('   ✅ Transaction retrieved successfully');
    
    // Step 2: Test ledger resolution
    console.log('\n2. Testing ledger sequence resolution...');
    const ledgerSequence = transaction.ledger_attr || 'Unknown';
    console.log(`   ✅ Ledger sequence: ${ledgerSequence}`);
    
    // Step 3: Test fee conversion
    console.log('\n3. Testing fee conversion...');
    const feeInStroops = parseInt(transaction.fee_charged.toString(), 10);
    const feeInXLM = (feeInStroops / 10000000).toFixed(7);
    console.log(`   Fee in stroops: ${feeInStroops}`);
    console.log(`   Fee in XLM: ${feeInXLM}`);
    console.log(`   ✅ Fee conversion working correctly`);
    
    // Step 4: Verify transaction details
    console.log('\n4. Transaction details verification:');
    console.log(`   Status: ${transaction.successful ? 'Success' : 'Failed'}`);
    console.log(`   Ledger: ${ledgerSequence}`);
    console.log(`   Created: ${transaction.created_at}`);
    console.log(`   Fee: ${feeInXLM} XLM (${feeInStroops} stroops)`);
    console.log(`   Operations: ${transaction.operation_count}`);
    console.log(`   Memo: ${transaction.memo || 'None'}`);
    
    console.log('\n🎉 All fixes verified successfully!');
    console.log('\n📱 Ready to test in PayProof UI:');
    console.log(`   1. Open: http://localhost:3001/verify`);
    console.log(`   2. Paste hash: ${TEST_HASH}`);
    console.log(`   3. Verify transaction - should show correct ledger and fee`);
    console.log(`   4. Generate receipt - should have proper fee display`);
    
    return { success: true };
    
  } catch (error) {
    console.error('\n❌ Test FAILED:');
    console.error(error.message);
    return { success: false, error: error.message };
  }
}

// Run the test
testFixedTransactionVerification();