export interface StellarTransaction {
  id: string
  hash: string
  ledger: string
  created_at: string
  source_account: string
  fee_charged: string
  fee_charged_xlm: string
  operation_count: number
  envelope_xdr: string
  result_xdr: string
  result_meta_xdr: string
  fee_meta_xdr: string
  memo_type: string
  memo?: string
  signatures: string[]
  network: 'testnet' | 'mainnet' // Added network information
}

export interface PaymentOperation {
  id: string
  type: string
  type_i: number
  created_at: string
  transaction_hash: string
  source_account: string
  from: string
  to: string
  asset_type: string
  asset_code?: string
  asset_issuer?: string
  amount: string
}

export interface TransactionResult {
  transaction: StellarTransaction
  operations: PaymentOperation[]
  status: 'success' | 'failed' | 'pending'
  network: 'testnet' | 'mainnet' // Added network information
}

export interface ReceiptData {
  id: string
  transaction_hash: string
  sender: string
  receiver: string
  amount: string
  asset_code: string
  asset_issuer?: string
  timestamp: string
  status: string
  memo?: string
  memo_type?: string
  fee: string
  network: 'testnet' | 'mainnet'
}

export type TransactionStatus = 'success' | 'failed' | 'pending' | 'not_found'

export type StellarNetwork = 'testnet' | 'mainnet'