import * as StellarSdk from "@stellar/stellar-sdk"
import type { 
  StellarTransaction, 
  PaymentOperation, 
  TransactionResult, 
  TransactionStatus,
  StellarNetwork 
} from "@/types/stellar"

const HORIZON_URLS = {
  mainnet: "https://horizon.stellar.org",
  testnet: "https://horizon-testnet.stellar.org"
}

export class StellarService {
  private servers: {
    mainnet: StellarSdk.Horizon.Server
    testnet: StellarSdk.Horizon.Server
  }

  constructor() {
    this.servers = {
      mainnet: new StellarSdk.Horizon.Server(HORIZON_URLS.mainnet),
      testnet: new StellarSdk.Horizon.Server(HORIZON_URLS.testnet)
    }
  }

  async getTransaction(hash: string, network: StellarNetwork = 'testnet'): Promise<TransactionResult> {
    const server = this.servers[network]
    
    try {
      const transaction = await server.transactions().transaction(hash).call()
      const operations = await server.operations().forTransaction(hash).call()
      
      const paymentOperations = operations.records
        .filter((op: any) => op.type === "payment" || op.type === "path_payment_strict_receive" || op.type === "path_payment_strict_send")
        .map((op: any) => ({
          id: op.id,
          type: op.type,
          type_i: op.type_i,
          created_at: op.created_at,
          transaction_hash: op.transaction_hash,
          source_account: op.source_account,
          from: op.from || op.source_account,
          to: op.to,
          asset_type: op.asset_type,
          asset_code: op.asset_code,
          asset_issuer: op.asset_issuer,
          amount: op.amount || op.source_amount || op.destination_amount,
        }))

      const status: TransactionStatus = transaction.successful ? "success" : "failed"

      // Properly resolve ledger sequence - use ledger_attr which contains the sequence number
      const ledgerSequence = transaction.ledger_attr;

      // Convert fee from stroops to XLM (1 XLM = 10,000,000 stroops)
      const feeInStroops = parseInt(transaction.fee_charged.toString(), 10)
      const feeInXLM = (feeInStroops / 10000000).toFixed(7)

      return {
        transaction: {
          id: transaction.id,
          hash: transaction.hash,
          ledger: String(ledgerSequence),
          created_at: transaction.created_at,
          source_account: transaction.source_account,
          fee_charged: String(transaction.fee_charged), // Keep stroops for internal use
          fee_charged_xlm: feeInXLM, // Add XLM conversion for display
          operation_count: transaction.operation_count,
          envelope_xdr: transaction.envelope_xdr,
          result_xdr: transaction.result_xdr,
          result_meta_xdr: transaction.result_meta_xdr,
          fee_meta_xdr: transaction.fee_meta_xdr,
          memo_type: transaction.memo_type,
          memo: transaction.memo,
          signatures: transaction.signatures,
          network: network, // Include network information
        },
        operations: paymentOperations,
        status,
        network: network, // Include network information
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error("Transaction not found")
      }
      throw new Error(`Failed to fetch transaction: ${error.message}`)
    }
  }

  validateTransactionHash(hash: string): boolean {
    if (!hash || typeof hash !== "string") {
      return false
    }
    
    // Stellar transaction hashes are 64 character hex strings
    const hexPattern = /^[a-fA-F0-9]{64}$/
    return hexPattern.test(hash)
  }

  getNetworkInfo(network: StellarNetwork) {
    return {
      network: network,
      horizonUrl: HORIZON_URLS[network],
      name: network === 'mainnet' ? 'Stellar Mainnet' : 'Stellar Testnet'
    }
  }

  getSupportedNetworks(): StellarNetwork[] {
    return ['testnet', 'mainnet']
  }
}

export const stellarService = new StellarService()