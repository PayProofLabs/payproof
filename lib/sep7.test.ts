/**
 * Unit tests for lib/sep7.ts
 *
 * Tests cover:
 *   - Validation helpers (isValidStellarAddress, isValidAmount)
 *   - URI encoding (encodeSep7Uri)
 *   - buildSep7PayUri — happy path and error cases
 *   - buildInvoiceSep7Uri — invoice wrapper
 */

import { describe, it, expect } from "vitest"
import {
  isValidStellarAddress,
  isValidAmount,
  encodeSep7Uri,
  buildSep7PayUri,
  buildInvoiceSep7Uri,
} from "@/lib/sep7"
import { STELLAR_NETWORK_PASSPHRASES, USDC_ISSUERS } from "@/types/sep7"

// ---------------------------------------------------------------------------
// Test fixtures
// ---------------------------------------------------------------------------

// Structurally valid Stellar G-address:
//   - 56 characters total
//   - Starts with G
//   - Remaining 55 chars from Stellar base32 alphabet: A-Z and 2-7
const VALID_ADDRESS = "GABCDEFGHIJKLMNOPQRSTUVWXYZ234567ABCDEFGHIJKLMNOPQRSTUVW"
// Verify length
if (VALID_ADDRESS.length !== 56) {
  throw new Error(`VALID_ADDRESS must be 56 chars, got ${VALID_ADDRESS.length}`)
}

const INVALID_ADDRESS_SHORT = "GABC123"
const INVALID_ADDRESS_WRONG_PREFIX = "XABCDEFGHIJKLMNOPQRSTUVWXYZ234567ABCDEFGHIJKLMNOPQRSTUVW"

// ---------------------------------------------------------------------------
// isValidStellarAddress
// ---------------------------------------------------------------------------

describe("isValidStellarAddress", () => {
  it("returns true for a valid G-address", () => {
    expect(isValidStellarAddress(VALID_ADDRESS)).toBe(true)
  })

  it("returns false for an address that is too short", () => {
    expect(isValidStellarAddress(INVALID_ADDRESS_SHORT)).toBe(false)
  })

  it("returns false for an address that does not start with G", () => {
    expect(isValidStellarAddress(INVALID_ADDRESS_WRONG_PREFIX)).toBe(false)
  })

  it("returns false for an empty string", () => {
    expect(isValidStellarAddress("")).toBe(false)
  })

  it("returns false for a non-string value", () => {
    // @ts-expect-error intentional bad input
    expect(isValidStellarAddress(null)).toBe(false)
  })

  it("returns false when address contains lowercase letters", () => {
    const lower = VALID_ADDRESS.toLowerCase()
    expect(isValidStellarAddress(lower)).toBe(false)
  })

  it("returns false when address contains characters outside base32 alphabet", () => {
    // Replace last char with '8' which is outside A-Z / 2-7
    const bad = VALID_ADDRESS.slice(0, 55) + "8"
    expect(isValidStellarAddress(bad)).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// isValidAmount
// ---------------------------------------------------------------------------

describe("isValidAmount", () => {
  it("returns true for a whole number string", () => {
    expect(isValidAmount("100")).toBe(true)
  })

  it("returns true for 7 decimal places (max precision)", () => {
    // 7 decimal places: "1.234567" has 6 — "1.2345678" would be 7
    expect(isValidAmount("1.2345678")).toBe(true)  // 7 decimal digits — ok
  })

  it("returns false for 8 decimal places (exceeds Stellar precision)", () => {
    expect(isValidAmount("1.23456789")).toBe(false) // 8 decimal digits — too many
  })

  it("returns false for zero", () => {
    expect(isValidAmount("0")).toBe(false)
  })

  it("returns false for a negative number", () => {
    expect(isValidAmount("-1")).toBe(false)
  })

  it("returns false for non-numeric string", () => {
    expect(isValidAmount("abc")).toBe(false)
  })

  it("returns false for empty string", () => {
    expect(isValidAmount("")).toBe(false)
  })

  it("returns false for null / undefined", () => {
    // @ts-expect-error intentional bad input
    expect(isValidAmount(null)).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// encodeSep7Uri
// ---------------------------------------------------------------------------

describe("encodeSep7Uri", () => {
  it("produces the correct scheme prefix", () => {
    const uri = encodeSep7Uri("pay", { destination: VALID_ADDRESS })
    // Use literal regex — "+" is a regex special character
    expect(uri).toMatch(/^web\+stellar:pay\?/)
  })

  it("includes all provided params", () => {
    const uri = encodeSep7Uri("pay", {
      destination: VALID_ADDRESS,
      amount: "50",
      memo: "inv_abc",
      memo_type: "MEMO_TEXT",
    })
    expect(uri).toContain(`destination=${encodeURIComponent(VALID_ADDRESS)}`)
    expect(uri).toContain("amount=50")
    expect(uri).toContain("memo=inv_abc")
    expect(uri).toContain("memo_type=MEMO_TEXT")
  })

  it("omits undefined params", () => {
    const uri = encodeSep7Uri("pay", {
      destination: VALID_ADDRESS,
      asset_code: undefined,
    })
    expect(uri).not.toContain("asset_code")
  })

  it("percent-encodes the network passphrase and round-trips correctly", () => {
    const passphrase = STELLAR_NETWORK_PASSPHRASES.mainnet
    const uri = encodeSep7Uri("pay", {
      destination: VALID_ADDRESS,
      network_passphrase: passphrase,
    })
    expect(uri).toContain("network_passphrase=")
    // Decode it back and verify it round-trips correctly
    const url = new URL(uri.replace("web+stellar:pay", "https://example.com/pay"))
    expect(url.searchParams.get("network_passphrase")).toBe(passphrase)
  })
})

// ---------------------------------------------------------------------------
// buildSep7PayUri — XLM on mainnet
// ---------------------------------------------------------------------------

describe("buildSep7PayUri — XLM on mainnet", () => {
  const input = {
    destination: VALID_ADDRESS,
    amount: "25",
    asset: "XLM" as const,
    network: "mainnet" as const,
    memo: "inv_test01",
  }

  it("returns a result with uri and params", () => {
    const result = buildSep7PayUri(input)
    expect(result).toHaveProperty("uri")
    expect(result).toHaveProperty("params")
  })

  it("uri starts with the correct scheme", () => {
    const { uri } = buildSep7PayUri(input)
    expect(uri).toMatch(/^web\+stellar:pay\?/)
  })

  it("includes destination", () => {
    const { uri } = buildSep7PayUri(input)
    expect(uri).toContain(`destination=${encodeURIComponent(VALID_ADDRESS)}`)
  })

  it("includes amount", () => {
    const { uri } = buildSep7PayUri(input)
    expect(uri).toContain("amount=25")
  })

  it("does NOT include asset_code or asset_issuer for XLM (native asset)", () => {
    const { uri } = buildSep7PayUri(input)
    expect(uri).not.toContain("asset_code")
    expect(uri).not.toContain("asset_issuer")
  })

  it("includes memo and memo_type=MEMO_TEXT", () => {
    const { uri } = buildSep7PayUri(input)
    expect(uri).toContain("memo=inv_test01")
    expect(uri).toContain("memo_type=MEMO_TEXT")
  })

  it("includes the mainnet network passphrase", () => {
    const { uri } = buildSep7PayUri(input)
    const url = new URL(uri.replace("web+stellar:pay", "https://x.com/pay"))
    expect(url.searchParams.get("network_passphrase")).toBe(
      STELLAR_NETWORK_PASSPHRASES.mainnet
    )
  })
})

// ---------------------------------------------------------------------------
// buildSep7PayUri — USDC on testnet
// ---------------------------------------------------------------------------

describe("buildSep7PayUri — USDC on testnet", () => {
  const input = {
    destination: VALID_ADDRESS,
    amount: "100.5",
    asset: "USDC" as const,
    network: "testnet" as const,
    memo: "inv_usdc01",
  }

  it("includes USDC asset_code", () => {
    const { uri } = buildSep7PayUri(input)
    expect(uri).toContain("asset_code=USDC")
  })

  it("includes the correct USDC testnet issuer", () => {
    const { uri } = buildSep7PayUri(input)
    const url = new URL(uri.replace("web+stellar:pay", "https://x.com/pay"))
    expect(url.searchParams.get("asset_issuer")).toBe(USDC_ISSUERS.testnet)
  })

  it("includes the testnet network passphrase", () => {
    const { uri } = buildSep7PayUri(input)
    const url = new URL(uri.replace("web+stellar:pay", "https://x.com/pay"))
    expect(url.searchParams.get("network_passphrase")).toBe(
      STELLAR_NETWORK_PASSPHRASES.testnet
    )
  })
})

// ---------------------------------------------------------------------------
// buildSep7PayUri — USDC on mainnet
// ---------------------------------------------------------------------------

describe("buildSep7PayUri — USDC on mainnet", () => {
  it("uses the mainnet USDC issuer", () => {
    const { uri } = buildSep7PayUri({
      destination: VALID_ADDRESS,
      amount: "50",
      asset: "USDC",
      network: "mainnet",
      memo: "inv_mainnet",
    })
    const url = new URL(uri.replace("web+stellar:pay", "https://x.com/pay"))
    expect(url.searchParams.get("asset_issuer")).toBe(USDC_ISSUERS.mainnet)
  })
})

// ---------------------------------------------------------------------------
// buildSep7PayUri — validation errors
// ---------------------------------------------------------------------------

describe("buildSep7PayUri — validation errors", () => {
  it("throws on invalid destination address", () => {
    expect(() =>
      buildSep7PayUri({
        destination: INVALID_ADDRESS_SHORT,
        amount: "10",
        asset: "XLM",
        network: "mainnet",
        memo: "inv",
      })
    ).toThrow(/invalid destination address/)
  })

  it("throws on invalid amount (zero)", () => {
    expect(() =>
      buildSep7PayUri({
        destination: VALID_ADDRESS,
        amount: "0",
        asset: "XLM",
        network: "mainnet",
        memo: "inv",
      })
    ).toThrow(/invalid amount/)
  })

  it("throws on invalid amount (negative)", () => {
    expect(() =>
      buildSep7PayUri({
        destination: VALID_ADDRESS,
        amount: "-5",
        asset: "XLM",
        network: "mainnet",
        memo: "inv",
      })
    ).toThrow(/invalid amount/)
  })

  it("throws on unsupported asset", () => {
    expect(() =>
      buildSep7PayUri({
        destination: VALID_ADDRESS,
        amount: "10",
        // @ts-expect-error intentional bad input
        asset: "BTC",
        network: "mainnet",
        memo: "inv",
      })
    ).toThrow(/unsupported asset/)
  })

  it("throws on unsupported network", () => {
    expect(() =>
      buildSep7PayUri({
        destination: VALID_ADDRESS,
        amount: "10",
        asset: "XLM",
        // @ts-expect-error intentional bad input
        network: "futurenet",
        memo: "inv",
      })
    ).toThrow(/unsupported network/)
  })
})

// ---------------------------------------------------------------------------
// buildInvoiceSep7Uri
// ---------------------------------------------------------------------------

describe("buildInvoiceSep7Uri", () => {
  const validInvoice = {
    recipientAddress: VALID_ADDRESS,
    amount: "42",
    asset: "XLM" as const,
    network: "testnet" as const,
    id: "inv_abc12",
  }

  it("returns a SEP-7 URI string for a valid invoice", () => {
    const uri = buildInvoiceSep7Uri(validInvoice)
    expect(typeof uri).toBe("string")
    expect(uri).toMatch(/^web\+stellar:pay\?/)
  })

  it("uses the invoice id as the memo", () => {
    const uri = buildInvoiceSep7Uri(validInvoice)!
    const url = new URL(uri.replace("web+stellar:pay", "https://x.com/pay"))
    expect(url.searchParams.get("memo")).toBe("inv_abc12")
  })

  it("returns null when the address is invalid", () => {
    const uri = buildInvoiceSep7Uri({
      ...validInvoice,
      recipientAddress: "INVALID",
    })
    expect(uri).toBeNull()
  })

  it("returns null when the amount is zero", () => {
    const uri = buildInvoiceSep7Uri({ ...validInvoice, amount: "0" })
    expect(uri).toBeNull()
  })
})
