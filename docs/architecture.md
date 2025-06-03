# How PayProof works

This is a quick walkthrough of the moving parts. Written so a new contributor can get oriented without having to read all the code first.

---

## The short version

PayProof is a Next.js app with no backend. When you paste a transaction hash and hit verify, the browser calls the Stellar Horizon API directly and renders the response. That's basically it.

There's no database, no auth, no server-side logic. Everything happens in the browser. The only external dependency at runtime is Horizon.

---

## Request flow

```
User pastes hash + picks network
        ↓
app/verify/page.tsx
        ↓
lib/stellar.ts → StellarService.getTransaction()
        ↓
Horizon API (horizon.stellar.org or horizon-testnet.stellar.org)
        ↓
Two fetch calls:
  /transactions/{hash}         → transaction metadata
  /transactions/{hash}/operations  → operation list
        ↓
Filter ops to payment | path_payment_strict_receive | path_payment_strict_send
        ↓
components/transaction-results.tsx renders the result
```

If the user clicks "Generate Receipt", they're sent to `/receipt/{hash}-{opIndex}?network={network}`. That page runs the same Horizon fetch again on mount (there's no state passed between pages — the receipt page is self-contained).

---

## lib/stellar.ts

This is where all the Horizon interaction lives. One class, `StellarService`, with a few methods:

- `getTransaction(hash, network)` — fetches the transaction and its operations, converts the fee from stroops to XLM, returns a typed `TransactionResult`
- `validateTransactionHash(hash)` — just a regex check for 64 hex chars
- `getNetworkInfo(network)` — returns the Horizon URL and display name for a given network

One thing worth knowing: the SDK's `transaction.ledger` property is a function (it's a link resolver that can lazy-fetch the full ledger object). The actual sequence number is at `transaction.ledger_attr`. This caught us out early — `String(transaction.ledger)` produces `[Function (anonymous)]` in the UI.

---

## The receipt URL scheme

Receipt URLs look like `/receipt/{hash}-{operationIndex}?network={network}`.

The index is needed because a single transaction can have multiple payment operations, and each one gets its own receipt. Most transactions only have one, so the URL usually ends in `-0`.

The `?network=` param was added to fix a bug where the receipt page had to guess the network by trying testnet first, then mainnet. That worked most of the time but was fragile. Now the verify page passes the network through explicitly.

Old links without the param still work — the receipt page falls back to the testnet-first guessing behaviour for backwards compatibility.

---

## The verify page URL state

The verify page persists the hash and network as query params (`?hash=...&network=...`). This means:

- Verification links are shareable — send someone `/verify?hash=abc...&network=testnet` and they land on a pre-filled form that auto-verifies
- Refreshing the page doesn't lose the result (it re-verifies automatically)
- The URL updates as you type via `router.replace` (not `push`, so the history doesn't fill up)

---

## Receipt card

`components/receipt-card.tsx` handles the receipt layout and all the export options:

- **Print** — `window.print()`. The `@media print` CSS in `globals.css` forces white background regardless of theme.
- **PDF** — `html2canvas` captures the receipt DOM node as a canvas, then `jsPDF` embeds it as an image in an A4 PDF. Both are dynamically imported so they don't bloat the initial JS bundle. html2canvas has some quirks with CSS gradients — if the output looks wrong, that's probably why.
- **QR code** — `qrcode` package renders the receipt URL to a `<canvas>` element. The canvas is included in both screen and print views.
- **Share** — Web Share API if the browser supports it, clipboard fallback otherwise.
- **JSON export** — creates a Blob from the `ReceiptData` object, triggers a download via a temporary `<a>` element.

---

## Styling

Tailwind CSS with a custom colour theme defined in `globals.css`. The CSS variables follow the shadcn/ui convention (`--background`, `--foreground`, `--primary`, etc.) so the shadcn components pick up the theme automatically.

Dark mode is handled by `next-themes` — it adds a `dark` class to `<html>` and the CSS variables switch via the `.dark {}` block in `globals.css`.

---

## What doesn't exist yet

- No tests. `lib/stellar.ts` and `lib/utils.ts` are the obvious starting points.
- No server. Everything is client-side. If you need a backend (for webhooks, an API, etc.) you'd add Next.js route handlers.
- No persistence. Nothing is stored anywhere. Closing the tab and coming back means starting over (though the URL state means you can bookmark a verification link).
