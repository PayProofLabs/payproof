# PayProof

Verify Stellar transactions and generate shareable receipts.

**Live:** [payproof-five.vercel.app](https://payproof-five.vercel.app) &nbsp;·&nbsp;
**CI:** ![CI](https://github.com/PayProofLabs/payproof/actions/workflows/ci.yml/badge.svg) &nbsp;·&nbsp;
**License:** MIT

---

## Screenshots

![PayProof verify page](public/screenshot.png)

---

## Why I built this

I kept running into the same problem: someone would send a Stellar payment and the other party wanted proof it went through, but pointing them at a block explorer felt like handing someone a raw API response. I wanted something that looked like an actual receipt — something you could print or forward in an email without explanation. PayProof started as a weekend script and turned into this.

---

## What it does

Paste a Stellar transaction hash, choose mainnet or testnet, and PayProof fetches the transaction from the Horizon API and shows you the details — status, ledger, fee, payment operations (sender, receiver, amount, asset).

From there you can generate a receipt page at a stable URL you can print, save as PDF, or share. The receipt includes a QR code that links back to the digital version.

Everything runs in the browser. No backend, no data stored, no accounts.

**Quick test** — paste this testnet hash on the live site:
```
980a03a11a6e212ac2d6a739188c89437f9cfb1b0302b8aeb58c573a06ef71d4
```

---

## Development status

| Feature | Status |
|---|---|
| Transaction verification (mainnet + testnet) | ✅ done |
| payment, path_payment_strict_receive, path_payment_strict_send | ✅ done |
| Receipt pages at `/receipt/{hash}-{index}` | ✅ done |
| Fee in XLM and stroops | ✅ done |
| QR code on receipts | ✅ done |
| PDF export | ✅ done |
| Print-friendly layout (dark mode safe) | ✅ done |
| JSON export | ✅ done |
| Light/dark theme | ✅ done |
| Responsive mobile layout | ✅ done |
| Network encoded in receipt URL | ✅ done (v0.1.1) |
| Verify page URL state | ✅ done (v0.1.1) |
| path_payment amount resolution | ⚠️ open (issue #4) |
| Test suite | ❌ not yet (issues #5, #6) |

---

## Architecture

```
Browser
  │
  ├── /verify         Hash input + NetworkSelector
  │     │
  │     └── lib/stellar.ts (StellarService)
  │           │
  │           ├── horizon.stellar.org          (mainnet)
  │           └── horizon-testnet.stellar.org  (testnet)
  │
  └── /receipt/[id]   Parses {hash}-{operationIndex} from URL
        │
        └── components/receipt-card.tsx
              ├── ReceiptQRCode  (qrcode → canvas)
              └── PDF export     (html2canvas + jsPDF, loaded lazily)
```

**Key files:**

| File | What it does |
|---|---|
| `lib/stellar.ts` | Horizon queries, operation filtering, fee conversion |
| `types/stellar.ts` | Shared TypeScript interfaces |
| `components/transaction-results.tsx` | Displays verification results |
| `components/receipt-card.tsx` | Receipt layout, PDF export, QR code, share/print |
| `components/receipt-qrcode.tsx` | Renders a QR code canvas from a URL |
| `app/receipt/[id]/page.tsx` | Loads receipt data from URL, handles network detection |

---

## Running locally

```bash
git clone https://github.com/PayProofLabs/payproof.git
cd payproof
npm install
npm run dev
```

App runs at `http://localhost:3000`. No environment variables required — defaults to testnet.

To default to mainnet, create `.env.local`:
```
NEXT_PUBLIC_STELLAR_NETWORK=mainnet
```

**Available commands:**
```bash
npm run dev          # development server with HMR
npm run build        # production build
npm run start        # serve production build
npm run lint         # ESLint
npm run type-check   # tsc --noEmit
```

---

## Stack

- **Next.js 15** (App Router, client components for Horizon queries)
- **TypeScript**
- **Tailwind CSS** + **shadcn/ui** (Radix primitives)
- **`@stellar/stellar-sdk`** — Horizon.Server client and hash validation
- **`qrcode`** — QR code generation to canvas
- **`jspdf`** + **`html2canvas`** — client-side PDF export (lazy-loaded)
- **`next-themes`** — light/dark mode

---

## Contributing

### Quick start

```bash
git clone https://github.com/PayProofLabs/payproof.git
cd payproof
npm install
cp .env.example .env.local
npm run dev
```

The app talks directly to the Stellar Horizon API from the browser. No backend to run, no API keys needed. Defaults to testnet.

### Picking something to work on

The issues in [`.github/ISSUES.md`](.github/ISSUES.md) are written to be directly actionable — each one has acceptance criteria, the files you'll need to touch, and what the reviewer will check. They're labelled by complexity:

- **Trivial** — under an hour, good for a first PR: issues #3, #7, #10, #11, #12, #14, #15
- **Medium** — half a day, some design decisions involved: issues #1, #2, #4, #5, #6, #8, #9, #13
- **High** — full day+, coordinate in an issue first before starting

If you want to work on something, leave a comment on the issue so others know it's taken.

### Workflow

1. Fork, then `git checkout -b fix/brief-description`
2. Make the change. Keep commits focused — one logical change per commit.
3. Run `npm run lint && npm run type-check` before pushing.
4. If the change touches verification or receipts, test it against a real testnet transaction.
5. Open a PR. The template will prompt you for what to include.

Commit style: `fix: correct fee display`, `feat: encode network in receipt URL`, `docs: add memo_type to contributing guide`.

### Good to know before diving in

Some non-obvious things about this codebase:

- `transaction.ledger` in the Stellar SDK is a function, not a value. The sequence number is at `transaction.ledger_attr`. Using `String(transaction.ledger)` produces `[Function (anonymous)]`.
- All Stellar queries happen in the browser — there's nothing server-side to worry about.
- The `receipt/[id]` page is a client component that fetches on mount. It guesses the network (testnet-first) because the network isn't in the URL yet — fixing that is issue #1.
- PDF export (`html2canvas` + `jsPDF`) is lazy-loaded so it doesn't bloat the initial bundle. The dynamic imports are in `receipt-card.tsx`.

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full setup guide including how to get a testnet transaction to work with.

---

## Roadmap

See [ROADMAP.md](ROADMAP.md) for what's planned and why.

---

## License

MIT — see [LICENSE](LICENSE).

*PayProof is an independent project and is not affiliated with the Stellar Development Foundation.*
