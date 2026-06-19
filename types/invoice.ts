export interface Invoice {
  id: string
  title: string
  description?: string
  amount: string
  asset: "XLM" | "USDC"
  recipientAddress: string
  recipientName?: string
  createdAt: string
  dueDate?: string
  status: "unpaid" | "paid"
  paidTxHash?: string
  network: "mainnet" | "testnet"
}
