/**
 * Stellar SEP-7 payment URI builder
 *
 * Generates `web+stellar:pay?...` URIs per the SEP-7 specification:
 * https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0007.md
 *
 * Supported features:
 *   - XLM (native) and non-native asset payments (USDC)
 *   - Memo + memo_type encoding
 *   - Network passphrase (testnet and mainnet)
 *
 * Not supported (out of scope for PayProof):
 *   - `tx` operation type
 *   - URI signing (origin_domain + signature)
 *   - callback URLs
 */

import {
  SEP7_SCHEME,
  STELLAR_NETWORK_PASSPHRASES,
  USDC_ISSUERS,
} from "@/types/sep7"
import type { Sep7BuildResult, Sep7PayInput, Sep7PayParams } from "@/types/sep7"

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------

/**
 * Returns true when the string looks like a valid Stellar G-address (ed25519
 * public key). This is a lightweight check — it does not call into stellar-sdk
 * so the lib can safely be used in non-browser environments (e.g. tests).
 *
 * A real G-address is a 56-character base32 string starting with "G".
 */
export function isValidStellarAddress(address: string): boolean {
  if (typeof address !== "string") return false
  // Base32 alphabet used by Stellar: A-Z 2-7 (RFC 4648)
  return /^G[A-Z2-7]{55}$/.test(address)
}

/**
 * Returns true when the string is a non-negative decimal number with at most 7
 * decimal places — the precision used by Stellar amounts.
 */
export function isValidAmount(amount: string): boolean {
  if (typeof amount !== "string" || amount.trim() === "") return false
  return /^\d+(\.\d{1,7})?$/.test(amount.trim()) && parseFloat(amount) > 0
}

// ---------------------------------------------------------------------------
// Core builder
// ---------------------------------------------------------------------------

/**
 * Builds a SEP-7 `pay` URI from the given parameters.
 *
 * Throws a descriptive error when required fields are missing or invalid so
 * callers get actionable feedback rather than a malformed URI.
 *
 * @example
 * ```ts
 * const { uri } = buildSep7PayUri({
 *   destination: "GABC...",
 *   amount: "10.5",
 *   asset: "USDC",
 *   network: "testnet",
 *   memo: "inv_abc123",
 * })
 * // => "web+stellar:pay?destination=GABC...&amount=10.5&asset_code=USDC&..."
 * ```
 */
export function buildSep7PayUri(input: Sep7PayInput): Sep7BuildResult {
  // ── Validate inputs ────────────────────────────────────────────────────
  if (!input.destination || !isValidStellarAddress(input.destination)) {
    throw new Error(
      `SEP-7: invalid destination address "${input.destination}". ` +
        "Expected a 56-character Stellar public key starting with G."
    )
  }

  if (!input.amount || !isValidAmount(input.amount)) {
    throw new Error(
      `SEP-7: invalid amount "${input.amount}". ` +
        "Expected a positive decimal number with at most 7 decimal places."
    )
  }

  if (input.asset !== "XLM" && input.asset !== "USDC") {
    throw new Error(
      `SEP-7: unsupported asset "${input.asset}". Supported values: XLM, USDC.`
    )
  }

  if (input.network !== "mainnet" && input.network !== "testnet") {
    throw new Error(
      `SEP-7: unsupported network "${input.network}". Supported values: mainnet, testnet.`
    )
  }

  // ── Build params object ────────────────────────────────────────────────
  const params: Sep7PayParams = {
    destination: input.destination,
    amount: input.amount,
  }

  // Asset: XLM is the native asset — per SEP-7 spec, asset_code/asset_issuer
  // are omitted for the native asset (no "XLM" code needed).
  if (input.asset !== "XLM") {
    params.asset_code = input.asset
    params.asset_issuer = USDC_ISSUERS[input.network]
  }

  // Memo: always MEMO_TEXT for invoice IDs (invoice IDs are short text strings)
  if (input.memo && input.memo.trim() !== "") {
    params.memo = input.memo.trim()
    params.memo_type = "MEMO_TEXT"
  }

  // Network passphrase: required for testnet; for mainnet it is technically
  // optional per the spec (wallets default to mainnet) but we include it
  // explicitly so the URI is unambiguous.
  params.network_passphrase = STELLAR_NETWORK_PASSPHRASES[input.network]

  // ── Encode URI ─────────────────────────────────────────────────────────
  const uri = encodeSep7Uri("pay", params)

  return { uri, params }
}

/**
 * Low-level encoder: produces `web+stellar:<operation>?<query>` from a params
 * object. Values are percent-encoded by URLSearchParams.
 *
 * Exported for testing.
 */
export function encodeSep7Uri(
  operation: "pay",
  params: Sep7PayParams
): string {
  const searchParams = new URLSearchParams()

  // Append only defined/non-empty values in a deterministic order.
  const orderedKeys: (keyof Sep7PayParams)[] = [
    "destination",
    "amount",
    "asset_code",
    "asset_issuer",
    "memo",
    "memo_type",
    "network_passphrase",
    "msg",
    "callback",
    "origin_domain",
    "signature",
  ]

  for (const key of orderedKeys) {
    const value = params[key]
    if (value !== undefined && value !== "") {
      searchParams.set(key, value)
    }
  }

  return `${SEP7_SCHEME}:${operation}?${searchParams.toString()}`
}

// ---------------------------------------------------------------------------
// Invoice helper
// ---------------------------------------------------------------------------

/**
 * Convenience wrapper that accepts a plain invoice-like object and returns the
 * SEP-7 URI string. Returns null when the invoice data is invalid rather than
 * throwing, so UI components can handle it gracefully.
 */
export function buildInvoiceSep7Uri(invoice: {
  recipientAddress: string
  amount: string
  asset: "XLM" | "USDC"
  network: "mainnet" | "testnet"
  id: string
}): string | null {
  try {
    const { uri } = buildSep7PayUri({
      destination: invoice.recipientAddress,
      amount: invoice.amount,
      asset: invoice.asset,
      network: invoice.network,
      memo: invoice.id,
    })
    return uri
  } catch {
    return null
  }
}
