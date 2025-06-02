# Roadmap

This is a working plan, not a release schedule. It reflects what's done, what's actively being worked on, and what's been thought about enough to be worth tracking.

---

## Phase 1 — Core verification and receipts ✅ done

- [x] Transaction verification on Stellar testnet and mainnet via Horizon API
- [x] `payment`, `path_payment_strict_receive`, `path_payment_strict_send` operation extraction
- [x] Receipt pages at `/receipt/{hash}-{operationIndex}` — stable, shareable URLs
- [x] Fee shown in XLM and stroops
- [x] Print-friendly receipt layout with `@media print` forced light background
- [x] JSON export
- [x] Light/dark theme
- [x] External explorer links (Stellar.Expert, StellarChain)

---

## Phase 2 — Receipt quality ✅ done

- [x] QR code on receipts (encodes receipt URL, rendered via `qrcode` → `<canvas>`)
- [x] PDF export (html2canvas captures the receipt DOM node, jsPDF writes the PDF client-side)
- [x] memo_type display — text/id/hash/return prefixed so values aren't ambiguous
- [x] Responsive layout fixes — mobile padding, wrapping transaction status header, footer grid

---

## Phase 3 — Correctness and reliability 🔧 in progress

These are the open issues that matter most for Drips Wave readiness.

- [ ] **Network in receipt URL** (#1) — receipt page currently guesses the network; should read it from a query param
- [ ] **Verify page URL state** (#2) — hash and network should survive a page refresh and be shareable
- [ ] **path_payment amount resolution** (#4) — the `||` fallback picks the wrong amount for some operation types
- [ ] **Horizon error messages** (#8) — 429 and 503 both surface as generic errors; needs specific handling
- [ ] **JSON export downloads a file** (#14) — currently opens a new tab instead of downloading

---

## Phase 4 — Test coverage

There are no tests. This is the biggest gap for a project accepting outside contributions.

- [ ] **Vitest setup + utils tests** (#5) — `formatStellarAmount`, `stroopsToXLM`, `truncateHash`
- [ ] **stellar.ts tests** (#6) — `validateTransactionHash`, fee conversion, mocked `getTransaction`
- [ ] Add `npm run test` to the CI workflow once the suite exists

---

## Phase 5 — UX improvements

Smaller things that make the tool more useful day-to-day.

- [ ] **Empty operations message** (#3) — non-payment transactions leave the operations section blank
- [ ] **Error state on bad receipt index** (#7) — out-of-range index currently redirects silently
- [ ] **Expandable addresses** (#10) — clicking a truncated address should show the full string
- [ ] **Memo type in results** (#11) — `memo_type` is stored but not shown in `TransactionResults`
- [ ] **Copy receipt as text** (#12) — single button to copy the full receipt as plain text
- [ ] **Loading skeleton** (#13) — replace the blank wait during verification with a shaped placeholder
- [ ] **Ledger links to Stellar.Expert** (#15) — ledger number should link to the ledger detail page

---

## Phase 6 — API and integrations (exploratory)

Nothing is committed here. These are ideas that come up enough to be worth noting.

- [ ] Public verification endpoint — a REST API so other tools can verify without calling Horizon directly. Would need a backend.
- [ ] Webhook support — notify a URL when a specific payment confirms. Needs persistent storage and a Horizon stream connection.
- [ ] Batch verification — verify a list of hashes at once, useful for reconciliation workflows.

---

## What's not planned

- Merchant dashboard — no concrete use case defined yet
- Mobile app — the web app is responsive; native adds maintenance overhead for unclear benefit
- SDK — premature until the API shape is stable

---

Open an issue before starting anything in Phase 5 or later — coordination avoids duplicate work.
