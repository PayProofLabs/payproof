# Contributing to PayProof

## Before you start

Read the [Code of Conduct](CODE_OF_CONDUCT.md). Check [open issues](https://github.com/PayProofLabs/payproof/issues) before starting work — especially for anything non-trivial. If you're planning a bigger change, open an issue first.

---

## Setup

```bash
git clone https://github.com/PayProofLabs/payproof.git
cd payproof
npm install
cp .env.example .env.local
npm run dev
```

App runs at `http://localhost:3000`. All Stellar queries go directly from the browser to the Horizon API — there's no backend.

To test against mainnet, set `NEXT_PUBLIC_STELLAR_NETWORK=mainnet` in `.env.local`. Testnet is the default and is safe for development.

---

## Project layout

```
app/
  page.tsx                  landing page
  verify/page.tsx           hash input + network selector
  receipt/[id]/page.tsx     receipt loader — parses {hash}-{operationIndex}
  docs/page.tsx             in-app documentation

components/
  ui/                       shadcn/ui base components — don't edit these directly
  transaction-results.tsx   displays verification output
  receipt-card.tsx          receipt layout, PDF export, QR code, share/print
  receipt-qrcode.tsx        QR code canvas component
  network-selector.tsx      mainnet/testnet radio + badge

lib/
  stellar.ts                StellarService class — all Horizon interaction
  utils.ts                  formatting helpers (amounts, timestamps, hashes)

types/
  stellar.ts                shared TypeScript interfaces
```

---

## Development commands

```bash
npm run dev          # start dev server
npm run build        # production build (catches SSR/client boundary issues)
npm run lint         # ESLint
npm run type-check   # tsc --noEmit
```

There's no test suite yet — adding one is an open issue. See issue #5 and #6 in `.github/ISSUES.md`.

---

## Working with the Stellar SDK

A few things that aren't obvious from the SDK docs:

**`ledger_attr` vs `ledger()`**
The transaction object returned by Horizon has two ledger-related properties. `transaction.ledger` is a function (a link resolver), not a value. The actual ledger sequence number is at `transaction.ledger_attr`. Using `String(transaction.ledger)` produces `[Function (anonymous)]` — use `transaction.ledger_attr` instead.

**Operation amounts for path payments**
- `payment` → use `op.amount`
- `path_payment_strict_receive` → `op.destination_amount` is what the recipient received; `op.source_amount` is what the sender spent (may differ due to path conversion)
- `path_payment_strict_send` → `op.source_amount` is exact; `op.destination_amount` is the minimum the recipient received

**Horizon pagination**
`server.operations().forTransaction(hash).call()` returns a page object. The actual records are in `.records`. The SDK's `fetchMore()` follows `_links.next` — for most transactions this isn't needed since they have few operations, but be aware if you're working with high-operation-count transactions.

**Getting a test transaction**
Use [Stellar Laboratory](https://laboratory.stellar.org) to create testnet accounts and submit transactions. The testnet resets periodically — if your hash stops working, create a new one.

This testnet hash works on the live site and is reliable for development:
```
980a03a11a6e212ac2d6a739188c89437f9cfb1b0302b8aeb58c573a06ef71d4
```

**Horizon API reference**
https://developers.stellar.org/network/horizon

---

## Making changes

1. Fork the repo, create a branch: `git checkout -b fix/brief-description`
2. Make your change, keep commits focused
3. Run `npm run lint && npm run type-check` before pushing
4. If your change touches verification or receipts, test it against a real testnet transaction
5. Open a pull request — the template will prompt you for what to include

**Commit message style:**
```
fix: correct fee display when fee_charged is zero
feat: encode network in receipt URL query param
docs: add memo_type explanation to CONTRIBUTING
refactor: extract operation amount resolution to helper
```

---

## What's most useful right now

- **Tests** — `lib/stellar.ts` and `lib/utils.ts` have no tests. Vitest is the recommended choice. See issues #5 and #6 in `.github/ISSUES.md`.
- **Network encoding in receipt URLs** — currently fragile. See issue #1.
- **path_payment amount resolution** — the `||` fallback picks the wrong amount for some operation types. See issue #4.
- **Horizon error messages** — 429 and 503 surface as generic errors. See issue #8.
- **JSON export** — opens a new tab instead of downloading a file. See issue #14.

For smaller starting points, issues marked **Trivial** in `.github/ISSUES.md`: #3, #7, #10, #11, #12, #14, #15.

---

## Questions

Open a [discussion](https://github.com/PayProofLabs/payproof/discussions) or comment on the relevant issue.
