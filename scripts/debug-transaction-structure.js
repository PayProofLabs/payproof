const StellarSdk = require('@stellar/stellar-sdk');

const TEST_HASH = '980a03a11a6e212ac2d6a739188c89437f9cfb1b0302b8aeb58c573a06ef71d4';

async function debugTransactionStructure() {
  console.log('🔍 Debugging transaction structure...\n');
  
  try {
    const server = new StellarSdk.Horizon.Server('https://horizon-testnet.stellar.org');
    const transaction = await server.transactions().transaction(TEST_HASH).call();
    
    console.log('Transaction object keys:', Object.keys(transaction));
    console.log('Transaction ledger type:', typeof transaction.ledger);
    console.log('Transaction ledger value:', transaction.ledger);
    
    // Check if it has ledger_attr
    if (transaction.ledger_attr) {
      console.log('Transaction ledger_attr:', transaction.ledger_attr);
    }
    
    // Check the raw data
    if (transaction._data) {
      console.log('Transaction _data keys:', Object.keys(transaction._data));
      console.log('Transaction _data.ledger:', transaction._data.ledger);
    }
    
    // Try different approaches to get ledger
    console.log('\n🔍 Testing different ledger access methods:');
    
    // Method 1: Direct property
    console.log('Direct property:', transaction.ledger);
    
    // Method 2: Call as function (if it is one)
    if (typeof transaction.ledger === 'function') {
      try {
        const result = transaction.ledger();
        console.log('Function call result:', result);
        
        // If it returns a promise
        if (result && typeof result.then === 'function') {
          const awaited = await result;
          console.log('Awaited result:', awaited);
        }
      } catch (e) {
        console.log('Function call error:', e.message);
      }
    }
    
    // Method 3: Check for numeric properties
    const numericProps = Object.keys(transaction).filter(key => 
      typeof transaction[key] === 'number' || 
      (typeof transaction[key] === 'string' && !isNaN(parseInt(transaction[key])))
    );
    console.log('Numeric properties:', numericProps.map(key => `${key}: ${transaction[key]}`));
    
  } catch (error) {
    console.error('Debug error:', error.message);
  }
}

debugTransactionStructure();