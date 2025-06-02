# Changelog

Dates are approximate. Format loosely follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased]

### Known issues
- `path_payment` operations resolve amounts via `||` fallback which can pick the wrong field (see issue #4)
- No test suite

---

## [0.1.1] – 2025

### Fixed
- **Network encoded in receipt URLs** (issue #1) — receipt pages used to guess the network by trying testnet first, then mainnet. The verify page now passes `?network=testnet` or `?network=mainnet` as a query param when generating receipt links. The receipt page reads it directly. Old links without the param still work via the legacy fallback.
- **Verify page URL state** (issue #2) — the hash and network are now reflected in the URL as `?hash=...&network=...`. Navigating to a verify link pre-fills the form and auto-triggers verification. The URL updates as you change the hash or switch networks, using `router.replace` so the browser history stays clean.

---

## [0.2.0] – 2025

### Added
- **QR code on receipts** — `components/receipt-qrcode.tsx` renders a QR code via `qrcode` → `<canvas>`. The code encodes the full receipt URL so printed receipts can be scanned to open the digital version. Visible on screen and in print output.
- **PDF export** — "Download PDF" button on receipt pages. Uses `html2canvas` to capture the receipt DOM node and `jsPDF` to embed it as an image in an A4 PDF. Both libraries are lazy-loaded so they don't affect the initial bundle. Falls back to a toast error if capture fails (some CSS features aren't supported by html2canvas).
- **memo_type display** — `formatMemo()` in `receipt-card.tsx` prefixes ambiguous memo types: `[id] 12345`, `[hash] abc...`. Plain text memos show as-is. The `memo_type` field added to `ReceiptData` and passed through from the receipt page.
- **Print fix** — `@media print` block in `globals.css` forces white background and black text regardless of active theme, fixing illegible output when printing from dark mode.
- **Contributor infrastructure** — `.github/ISSUE_TEMPLATE/` (bug report, feature request), `pull_request_template.md`, `workflows/ci.yml` (type-check + lint + build on every PR), `ROADMAP.md`, this changelog.

### Fixed
- **Responsive layout** — all pages switched from `container` (no horizontal padding) to explicit `w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`. Sections no longer run edge-to-edge on narrow viewports.
- **Transaction status card header** — was a single flex row; on mobile the badges and Generate Receipt button overlapped the title. Now stacks on mobile (`flex-col sm:flex-row`).
- **Receipt card padding** — `p-8` on all viewports reduced to `p-4 sm:p-8`.
- **Footer grid** — added `sm:grid-cols-2` breakpoint so footer columns pair up on tablet instead of jumping from 1 to 4 columns.
- **Mobile nav indentation** — `Docs` link had inconsistent indentation compared to other mobile nav items.
- **Operation type badge** — `operation.type.replace('_', ' ')` only replaced the first underscore. Changed to `replace(/_/g, ' ')` so `path_payment_strict_send` renders as `path payment strict send`.
- **Copy button aria-labels** — all copy-to-clipboard icon buttons now have `aria-label` describing what they copy.

---

## [0.1.0] – 2024

Initial public release.

### Added
- Transaction verification against Stellar Horizon API (mainnet and testnet)
- Extracts `payment`, `path_payment_strict_receive`, and `path_payment_strict_send` operations
- Fee display in both XLM and stroops (stroops ÷ 10,000,000)
- Uses `transaction.ledger_attr` for ledger sequence — the SDK's `transaction.ledger` property is a function, not a value
- Receipt pages at `/receipt/{hash}-{operationIndex}` with stable, shareable URLs
- JSON export of receipt data
- Print-friendly receipt layout via `window.print()` and `print:` Tailwind classes
- Share via Web Share API with clipboard fallback
- Light/dark theme via next-themes
- NetworkSelector and NetworkBadge components
- External explorer links to stellar.expert and stellarchain.io

### Known issues at release
- Receipt page network detection was fragile (tries testnet first)
- No test suite
- No PDF export — browser print was the workaround
