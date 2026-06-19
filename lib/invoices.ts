import type { Invoice } from "@/types/invoice"

const STORAGE_KEY = "payproof_invoices"

const HORIZON_URLS = {
  mainnet: "https://horizon.stellar.org",
  testnet: "https://horizon-testnet.stellar.org",
}

// USDC issuer addresses
const USDC_ISSUERS = {
  mainnet: "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN",
  testnet: "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5",
}

export function saveInvoice(invoice: Invoice): void {
  const all = getAllInvoices()
  all.push(invoice)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
}

export function getInvoice(id: string): Invoice | null {
  return getAllInvoices().find((inv) => inv.id === id) ?? null
}

export function getAllInvoices(): Invoice[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Invoice[]) : []
  } catch {
    return []
  }
}

export function updateInvoice(id: string, updates: Partial<Invoice>): void {
  const all = getAllInvoices()
  const idx = all.findIndex((inv) => inv.id === id)
  if (idx === -1) return
  all[idx] = { ...all[idx], ...updates }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
}

export async function checkInvoicePayment(invoice: Invoice): Promise<string | null> {
  const base = HORIZON_URLS[invoice.network]

  try {
    // Fetch recent payments to the recipient address
    const res = await fetch(
      `${base}/accounts/${invoice.recipientAddress}/payments?limit=50&order=desc`
    )
    if (!res.ok) return null
    const data = await res.json()
    const records: any[] = data._embedded?.records ?? []

    for (const record of records) {
      // Only look at payment operations
      if (record.type !== "payment") continue

      // Check amount matches
      if (record.amount !== invoice.amount) continue

      // Check asset matches
      if (invoice.asset === "XLM") {
        if (record.asset_type !== "native") continue
      } else if (invoice.asset === "USDC") {
        if (record.asset_code !== "USDC") continue
        if (record.asset_issuer !== USDC_ISSUERS[invoice.network]) continue
      }

      // Fetch the transaction to check memo
      const txRes = await fetch(`${base}/transactions/${record.transaction_hash}`)
      if (!txRes.ok) continue
      const tx = await txRes.json()

      if (tx.memo === invoice.id) {
        return record.transaction_hash as string
      }
    }

    return null
  } catch {
    return null
  }
}
