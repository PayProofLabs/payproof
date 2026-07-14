/**
 * Stellar SEP-7 URI Types
 *
 * Based on the SEP-7 specification:
 * https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0007.md
 */

/** The URI scheme prefix for all SEP-7 URIs. */
export const SEP7_SCHEME = "web+stellar" as const

/** SEP-7 operation types. Only "pay" is currently supported by PayProof. */
export type Sep7Operation = "pay" | "tx"

/** Network passphrases used by the Stellar network. */
export const STELLAR_NETWORK_PASSPHRASES = {
  mainnet: "Public Global Stellar Network ; September 2015",
  testnet: "Test SDF Network ; September 2015",
} as const

/** USDC issuer addresses per network. */
export const USDC_ISSUERS = {
  mainnet: "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN",
  testnet: "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5",
} as const

/**
 * Parameters for a SEP-7 `pay` URI.
 *
 * All URL query parameter names match the SEP-7 spec exactly so they can be
 * spread into a URLSearchParams without transformation.
 */
export interface Sep7PayParams {
  /** Stellar public key of the payment destination (required). */
  destination: string
  /** Asset amount as a string (e.g. "10.5000000"). Optional per spec, but PayProof always sets it. */
  amount?: string
  /** Asset code for non-native assets, e.g. "USDC". Omit for XLM. */
  asset_code?: string
  /** Issuer address for non-native assets. Required when asset_code is set. */
  asset_issuer?: string
  /** Memo value. PayProof uses the invoice ID. */
  memo?: string
  /** Memo type. PayProof always uses MEMO_TEXT when a memo is present. */
  memo_type?: "MEMO_TEXT" | "MEMO_ID" | "MEMO_HASH" | "MEMO_RETURN"
  /** Network passphrase. Required for testnet; optional (defaults to mainnet) per the spec. */
  network_passphrase?: string
  /** Human-readable message shown in the wallet's confirmation UI. */
  msg?: string
  /**
   * Callback URL to notify when the payment is submitted.
   * Use "none" to explicitly disable callbacks.
   */
  callback?: string
  /**
   * Origin domain used for SEP-7 domain verification.
   * Should be the domain that hosts the stellar.toml declaring the URI_REQUEST_SIGNING_KEY.
   */
  origin_domain?: string
  /**
   * Base64-encoded signature of the URI (excluding the signature parameter itself).
   * Present only when origin_domain is set and the URI is signed.
   */
  signature?: string
}

/**
 * Inputs required to build a SEP-7 pay URI from an invoice.
 * Corresponds to the Invoice type fields relevant to SEP-7.
 */
export interface Sep7PayInput {
  destination: string
  amount: string
  asset: "XLM" | "USDC"
  network: "mainnet" | "testnet"
  memo: string
}

/** Result returned by the SEP-7 URI builder. */
export interface Sep7BuildResult {
  /** The fully-encoded SEP-7 URI string. */
  uri: string
  /** Parsed parameters used to construct the URI (useful for debugging/testing). */
  params: Sep7PayParams
}
