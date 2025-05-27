const StellarSdk = require('@stellar/stellar-sdk');

// Configure for testnet
const server = new StellarSdk.Horizon.Server('https://horizon-testnet.stellar.org');
StellarSdk.Networks.TESTNET;

async function createTestTransaction() {
  try {
    console.log('🚀 Creating Stellar testnet accounts and test transaction...\n');

    // Step 1: Create source keypair
    console.log('1. Creating source account keypair...');
    const sourceKeypair = StellarSdk.Keypair.random();
    console.log(`   Public Key: ${sourceKeypair.publicKey()}`);
    console.log(`   Secret Key: ${sourceKeypair.secret()}`);

    // Step 2: Fund source account with Friendbot
    console.log('\n2. Funding source account with Friendbot...');
    const friendbotUrl = `https://friendbot.stellar.org?addr=${encodeURIComponent(sourceKeypair.publicKey())}`;
    const response = await fetch(friendbotUrl);
    
    if (response.ok) {
      console.log('   ✅ Source account funded successfully!');
    } else {
      throw new Error(`Friendbot funding failed: ${response.statusText}`);
    }

    // Step 3: Create destination keypair
    console.log('\n3. Creating destination account keypair...');
    const destinationKeypair = StellarSdk.Keypair.random();
    console.log(`   Public Key: ${destinationKeypair.publicKey()}`);
    console.log(`   Secret Key: ${destinationKeypair.secret()}`);

    // Step 4: Fund destination account with Friendbot
    console.log('\n4. Funding destination account with Friendbot...');
    const friendbotUrl2 = `https://friendbot.stellar.org?addr=${encodeURIComponent(destinationKeypair.publicKey())}`;
    const response2 = await fetch(friendbotUrl2);
    
    if (response2.ok) {
      console.log('   ✅ Destination account funded successfully!');
    } else {
      throw new Error(`Friendbot funding failed: ${response2.statusText}`);
    }

    // Step 5: Wait a moment for account creation to propagate
    console.log('\n5. Waiting for accounts to be available...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Step 6: Load source account
    console.log('\n6. Loading source account from network...');
    const sourceAccount = await server.loadAccount(sourceKeypair.publicKey());
    console.log(`   ✅ Source account loaded. Sequence: ${sourceAccount.sequenceNumber()}`);

    // Step 7: Build payment transaction
    console.log('\n7. Building payment transaction...');
    const amount = '10.5'; // 10.5 XLM
    const memo = 'PayProof Test Payment';
    
    const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: StellarSdk.Networks.TESTNET
    })
      .addOperation(
        StellarSdk.Operation.payment({
          destination: destinationKeypair.publicKey(),
          asset: StellarSdk.Asset.native(),
          amount: amount
        })
      )
      .addMemo(StellarSdk.Memo.text(memo))
      .setTimeout(300)
      .build();

    console.log(`   ✅ Transaction built with ${amount} XLM payment`);

    // Step 8: Sign transaction
    console.log('\n8. Signing transaction...');
    transaction.sign(sourceKeypair);
    console.log('   ✅ Transaction signed');

    // Step 9: Submit transaction
    console.log('\n9. Submitting transaction to network...');
    const result = await server.submitTransaction(transaction);
    
    console.log('\n🎉 SUCCESS! Transaction submitted successfully!');
    console.log('\n📋 Transaction Details:');
    console.log(`   Hash: ${result.hash}`);
    console.log(`   Ledger: ${result.ledger}`);
    console.log(`   From: ${sourceKeypair.publicKey()}`);
    console.log(`   To: ${destinationKeypair.publicKey()}`);
    console.log(`   Amount: ${amount} XLM`);
    console.log(`   Memo: ${memo}`);
    console.log(`   Fee: ${result.fee_charged} stroops`);

    // Step 10: Generate useful links
    console.log('\n🔗 Useful Links:');
    console.log(`   Stellar.Expert: https://stellar.expert/explorer/testnet/tx/${result.hash}`);
    console.log(`   StellarChain: https://stellarchain.io/testnet/tx/${result.hash}`);
    console.log(`   PayProof Verify: http://localhost:3001/verify (paste hash: ${result.hash})`);

    // Step 11: Return transaction hash for easy copying
    console.log('\n📝 Copy this transaction hash to test PayProof:');
    console.log(`${result.hash}`);

    return {
      hash: result.hash,
      source: sourceKeypair.publicKey(),
      destination: destinationKeypair.publicKey(),
      amount: amount,
      memo: memo,
      ledger: result.ledger
    };

  } catch (error) {
    console.error('\n❌ Error creating test transaction:');
    console.error(error.message);
    
    if (error.response && error.response.data) {
      console.error('Response data:', error.response.data);
    }
    
    process.exit(1);
  }
}

// Run the script
createTestTransaction();