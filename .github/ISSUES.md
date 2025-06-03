# GitHub Issues

Open these individually at https://github.com/PayProofLabs/payproof/issues.
Issues 1, 2, 9, and 12 from the previous list are already shipped and removed here.

Complexity levels: **Trivial** (< 1 hour), **Medium** (half day), **High** (full day+).

---

## Issue 1 — Encode network in receipt URLs

**Labels:** `bug`, `help wanted`
**Complexity:** Medium
**Key files:** `app/receipt/[id]/page.tsx`, `components/transaction-results.tsx`, `app/verify/page.tsx`

**Background**

Receipt URLs look like `/receipt/{hash}-{operationIndex}`. The receipt page has no idea which network the transaction is on, so it guesses — tries testnet first, then mainnet. That usually works, but it's semantically wrong and will silently serve the wrong receipt if somehow the same hash exists on both networks.

**What to do**

Add `?network=testnet` or `?network=mainnet` as a query param. The verify page already knows the network when it generates the receipt link — it just doesn't pass it through.

**Acceptance criteria**
- `TransactionResults` generates receipt links with `?network={network}` appended
- `app/receipt/[id]/page.tsx` reads the `network` query param via `useSearchParams` and skips the fallback guessing when it's present
- If the param is missing (old shared links), fall back to the current try-testnet-first behaviour — don't break existing URLs
- Verified against a mainnet transaction to confirm mainnet receipts load correctly without the testnet fallback firing

**Review expectations**

Reviewer will check: old-style URLs still resolve, new links include the param, no regression on the verify → receipt flow.

---

## Issue 2 — Verify page does not restore state from URL

**Labels:** `enhancement`
**Complexity:** Medium
**Key files:** `app/verify/page.tsx`

**Background**

If you want to share a pre-filled verify link with a specific hash, there's no way to do it. The form always loads empty.

**What to do**

Read `?hash=` and `?network=` from the URL on mount. Pre-fill the form and auto-trigger verification when both are present. Update the URL as the user types (replace, not push, to keep history clean).

**Acceptance criteria**
- `/verify?hash=980a03...&network=testnet` loads, pre-fills the input, and triggers verification automatically
- Changing the hash input updates the URL param (use `router.replace`)
- Changing the network selector updates the URL param
- Back button restores the previous state, not an empty form
- Invalid hash in the URL param shows validation error rather than silently loading an empty form

**Review expectations**

Reviewer will paste a URL with params into a fresh tab and confirm it auto-verifies. Will also check that manually editing the input doesn't produce duplicate history entries.

---

## Issue 3 — Transactions with no payment operations show blank section

**Labels:** `bug`, `good first issue`
**Complexity:** Trivial
**Key files:** `components/transaction-results.tsx`

**Background**

Not every Stellar transaction has payment operations. Account creations, trust line changes, and manage offer transactions all verify successfully but leave the operations section empty in PayProof. There's no message explaining why. First-time users assume something broke.

**What to do**

In `TransactionResults`, when `result.operations.length === 0`, render a short explanation inside the operations card instead of rendering nothing.

**Acceptance criteria**
- When a verified transaction has zero payment operations, the operations section shows: "No payment operations found. PayProof only shows `payment`, `path_payment_strict_receive`, and `path_payment_strict_send` operations. This transaction may have other operation types — view it on [Stellar.Expert]."
- The Stellar.Expert link uses the correct network (mainnet vs testnet)
- Transaction status, hash, ledger, fee, and memo still display normally above
- The Generate Receipt button is not shown (already the case — just needs a regression check)

**Review expectations**

Test with a non-payment testnet transaction. One way to get one: use Stellar Laboratory to create a new account (that's a `create_account` operation, not a `payment`).

---

## Issue 4 — path_payment amounts are resolved inconsistently

**Labels:** `bug`, `help wanted`
**Complexity:** Medium
**Key files:** `lib/stellar.ts`, `components/transaction-results.tsx`, `types/stellar.ts`

**Background**

In `lib/stellar.ts` line ~38:
```ts
amount: op.amount || op.source_amount || op.destination_amount,
```

For `path_payment_strict_receive`, `op.destination_amount` is what the recipient actually received. For `path_payment_strict_send`, `op.source_amount` is what the sender actually sent. The `||` fallback picks whichever field is truthy first, which is unpredictable. On a `path_payment_strict_receive`, `op.amount` is undefined, so it falls through to `source_amount` — which is the sender's spend, not the receiver's receipt. A receipt showing the sender's spend when the recipient is reading it is wrong.

**What to do**

Resolve amounts per operation type in `getTransaction()`. Store both source and destination amounts in `PaymentOperation` for path payments so the UI can show the exchange.

**Acceptance criteria**
- `PaymentOperation` type gains optional `source_amount` and `destination_amount` fields
- `getTransaction()` resolves `amount` as: `payment` → `op.amount`; `path_payment_strict_receive` → `op.destination_amount`; `path_payment_strict_send` → `op.source_amount`
- For path payments, both amounts are stored and displayed in `TransactionResults` — e.g. "Sent: 10 XLM → Received: 8.5 USDC"
- A receipt generated for a path payment shows the recipient-facing amount

**Review expectations**

Reviewer will want a testnet path payment hash to verify against. If you don't have one, note it in the PR and the reviewer will create one.

---

## Issue 5 — Set up Vitest and write tests for lib/utils.ts

**Labels:** `enhancement`, `good first issue`
**Complexity:** Medium
**Key files:** `lib/utils.ts`, `package.json`, `vitest.config.ts` (new)

**Background**

There are no tests in this repo. `lib/utils.ts` is the easiest starting point — pure functions, no network calls, no React. Getting Vitest running and covering these four functions gives every future contributor a working test harness to extend.

**What to do**

Install Vitest, add `npm run test` to `package.json`, write tests for `formatStellarAmount`, `stroopsToXLM`, `formatTimestamp`, and `truncateHash`.

**Acceptance criteria**
- `npm run test` runs the suite and exits 0
- `formatStellarAmount("10.5000000", "XLM")` → contains "10.50" and "XLM"
- `formatStellarAmount("0", undefined)` → does not crash, returns a string containing "0"
- `stroopsToXLM("100")` → `"0.0000100"`
- `stroopsToXLM("10000000")` → `"1.0000000"`
- `stroopsToXLM("0")` → `"0.0000000"`
- `truncateHash("GA4RZPDFMRVJ5ZWOTAKWMGWNN435ERWHAIGKH6C3SMP7EW7AOEK4HCYH", 8)` → `"GA4RZPDF...EK4HCYH"`
- `truncateHash("")` → `""` (no crash)
- `truncateHash(null as any)` → `""` (no crash)
- `CONTRIBUTING.md` updated to document `npm run test` and the Vitest choice

**Review expectations**

Reviewer will run `npm run test` locally. Will also check that the config doesn't pull in jsdom unless strictly needed (utils.ts has no DOM dependency).

---

## Issue 6 — Write tests for lib/stellar.ts (hash validation and fee conversion)

**Labels:** `enhancement`, `help wanted`
**Complexity:** Medium
**Key files:** `lib/stellar.ts`, `lib/stellar.test.ts` (new)

**Depends on:** Issue 5 (Vitest must be set up first)

**Background**

`validateTransactionHash` and the fee conversion in `getTransaction` have both had bugs. The ledger_attr/ledger() confusion was caught by accident, not by a test. These are the highest-value things to test in isolation.

Testing `getTransaction` fully requires mocking the Stellar SDK, which is moderately complex — scope this issue to the parts that don't need network access.

**What to do**

Write unit tests for `validateTransactionHash` and the fee conversion math. For `getTransaction`, write at least one test that mocks `StellarSdk.Horizon.Server` and asserts the returned shape — enough to catch the ledger_attr regression if it ever comes back.

**Acceptance criteria**
- `validateTransactionHash("")` → `false`
- `validateTransactionHash("abc")` → `false`
- `validateTransactionHash("980a03a11a6e212ac2d6a739188c89437f9cfb1b0302b8aeb58c573a06ef71d4")` → `true`
- `validateTransactionHash("980a03a11a6e212ac2d6a739188c89437f9cfb1b0302b8aeb58c573a06ef71d4Z")` → `false` (65 chars)
- Fee: 100 stroops → `"0.0000100"`, 10000000 stroops → `"1.0000000"`, 0 stroops → `"0.0000000"`
- At least one mocked `getTransaction` test that asserts `result.transaction.ledger` is a string (not a function)

**Review expectations**

Reviewer will confirm the mock doesn't do network I/O. Will check that the ledger regression test would actually fail if someone reverted to `String(transaction.ledger)`.

---

## Issue 7 — Receipt page shows error in place instead of redirecting on bad index

**Labels:** `bug`
**Complexity:** Trivial
**Key files:** `app/receipt/[id]/page.tsx`

**Background**

If you open `/receipt/{validHash}-999` where index 999 doesn't exist, the page throws "Operation index out of range" and immediately redirects to `/verify`. The URL is gone, the context is gone, and the user has no idea what happened.

**What to do**

Instead of redirecting, render an error state on the receipt page itself. Keep the URL intact so the user can inspect it or report it.

**Acceptance criteria**
- When `opIndex >= result.operations.length`, render an error message on the page (not a toast + redirect)
- Error message says something like: "Operation index {n} not found. This transaction has {x} payment operation(s). The valid receipt index for this transaction is 0–{x-1}."
- A "Back to verify" link is present pointing to `/verify?hash={hash}&network={network}`
- The URL does not change
- The existing redirect for a completely invalid hash (non-hex, wrong length) stays as-is — only the out-of-range index case changes

**Review expectations**

Reviewer will navigate to `/receipt/980a03a11a6e212ac2d6a739188c89437f9cfb1b0302b8aeb58c573a06ef71d4-999` and confirm an error renders in place.

---

## Issue 8 — Horizon error messages are too generic

**Labels:** `enhancement`, `help wanted`
**Complexity:** Medium
**Key files:** `lib/stellar.ts`, `app/verify/page.tsx`

**Background**

The catch block in `StellarService.getTransaction()` handles 404 and wraps everything else as `Failed to fetch transaction: {message}`. Horizon returns structured errors. Rate limiting (429) and service unavailability (503) are the two most common non-404 failures users will actually hit, and they need different responses.

**What to do**

Parse `error.response?.status` in the catch block and return specific messages for the cases that matter.

**Acceptance criteria**
- 404 → "Transaction not found" (existing, keep as-is)
- 429 → "Horizon rate limit reached — wait a few seconds and try again"
- 503 → "Stellar Horizon is unreachable — check https://status.stellar.org for network status"
- Network failure (no `error.response`) → "Could not reach Stellar Horizon — check your connection"
- All other errors fall back to the existing `Failed to fetch transaction: {message}` format
- These messages surface in the toast on the verify page (they already do via the existing error handler)

**Review expectations**

Reviewer will check the catch block logic with a code review — actually triggering a 429 is hard to test locally but the logic can be verified by inspection.

---

## Issue 9 — Verify page URL state should survive page refresh

**Labels:** `enhancement`
**Complexity:** Medium
**Key files:** `app/verify/page.tsx`

**Depends on:** Issue 2 (URL state encoding)

**Background**

Once Issue 2 lands, the hash and network will be in the URL. But a page refresh will clear the result state — the form will be pre-filled but the verification result won't be showing. The user has to click Verify again.

**What to do**

On mount, if `?hash=` and `?network=` are present in the URL and the hash is valid, auto-trigger verification.

**Acceptance criteria**
- Refreshing `/verify?hash=980a03...&network=testnet` re-runs verification automatically
- The loading state shows while verification is in progress (same as a manual verify)
- If the hash in the URL is invalid, show validation error rather than auto-triggering and showing a network error
- Does not double-fire on first load when the user navigated here normally (i.e. only triggers when params are already in the URL on mount, not in response to a user typing)

**Review expectations**

Reviewer will hard-refresh a URL with params and confirm verification runs. Will also confirm there's no extra API call when navigating to `/verify` without params.

---

## Issue 10 — Truncated addresses can be expanded inline

**Labels:** `enhancement`, `good first issue`
**Complexity:** Trivial
**Key files:** `components/transaction-results.tsx`, `components/receipt-card.tsx`

**Background**

All Stellar addresses are displayed truncated (`GA4RZPDF...EK4HCYH`). The copy button gives you the full address, but you can't visually verify it without copying first. Some users want to read the address, not just copy it.

**What to do**

Make each truncated address a toggle. Click to expand to full; click again to collapse. State is per-address — expanding one doesn't affect others.

**Acceptance criteria**
- Clicking a truncated address toggles it to full text
- Clicking again collapses it back to truncated
- Full address wraps inside its container without overflowing or breaking the grid
- Works on both `transaction-results.tsx` and `receipt-card.tsx`
- The copy button still works in both states
- `print:` styles show the full address (since you can't click while printing)

**Review expectations**

Reviewer will test on a narrow viewport to confirm full addresses wrap correctly. Will also check the print view shows full addresses.

---

## Issue 11 — Display memo type alongside memo value

**Labels:** `enhancement`, `good first issue`
**Complexity:** Trivial
**Key files:** `components/transaction-results.tsx`

**Background**

Stellar memos have four types: `text`, `id`, `hash`, and `return`. PayProof shows the memo value but not the type. An `id` memo is a uint64 that looks like a random number. A `hash` memo is 32 bytes encoded as hex that looks exactly like a transaction hash. Without the type label, users can't tell what they're looking at.

`memo_type` is already in `StellarTransaction` and passed through — it just isn't rendered.

**What to do**

In the memo field inside `TransactionResults`, render `{memo_type}: {memo}` when memo is present. For `none` type or when memo is absent, keep the existing "None" display.

**Acceptance criteria**
- Text memo: shows "text: PayProof Test Payment"
- ID memo: shows "id: 123456789"
- Hash memo: shows "hash: {hex}" — value is the hex-encoded bytes
- Return memo: shows "return: {hex}"
- `none` / absent memo: shows "None" (unchanged)
- `receipt-card.tsx` already handles this via `formatMemo()` — confirm `transaction-results.tsx` uses the same pattern or extracts it to a shared helper in `lib/utils.ts`

**Review expectations**

Reviewer will check with a transaction that has an `id`-type memo to confirm it doesn't look like a hash.

---

## Issue 12 — Add a "copy all" button for the full receipt as plain text

**Labels:** `enhancement`
**Complexity:** Trivial
**Key files:** `components/receipt-card.tsx`

**Background**

Currently you can copy individual fields (hash, sender, receiver) one at a time. Sometimes you want to paste the whole receipt into a message or ticket — sender, receiver, amount, hash, timestamp, network — in one shot. There's no way to do that without copying field by field.

**What to do**

Add a "Copy as text" button in the action bar (alongside Print, PDF, Share, Export JSON). It copies a plain-text formatted version of the receipt to the clipboard.

**Acceptance criteria**
- Button copies a multi-line plain text block to clipboard
- Includes: amount, asset, sender, receiver, network, fee, timestamp, transaction hash, memo (if present), receipt URL
- Format is readable without Markdown — labels and values, one per line
- Toast confirms "Receipt copied to clipboard"
- Button is `print:hidden` and excluded from PDF capture (add `pdf-ignore` class)

**Review expectations**

Reviewer will paste the output into a plain text editor and confirm it's readable and complete.

---

## Issue 13 — Transaction results need a loading skeleton, not just a spinner

**Labels:** `enhancement`
**Complexity:** Medium
**Key files:** `app/verify/page.tsx`, `components/transaction-results.tsx`

**Background**

While verification is in progress, the verify page shows a spinner inside the submit button and the results area is blank. On a slow connection this means the page looks broken for 2–5 seconds. A skeleton that mirrors the shape of the results card would make it obvious that content is loading.

**What to do**

Add a skeleton placeholder below the verify card that shows while `loading === true`. It should match the rough shape of the `TransactionResults` output: a status card and one operation card.

Use Tailwind's `animate-pulse` on placeholder div blocks — no external skeleton library needed.

**Acceptance criteria**
- While `loading === true` and before a result is returned, a skeleton with `animate-pulse` renders below the verify card
- Skeleton has two sections: one matching the transaction status card, one matching an operation card
- Skeleton disappears when results arrive (success or error)
- No visible layout shift when the skeleton is replaced by real content — the heights should be roughly similar

**Review expectations**

Reviewer will throttle the network in DevTools to "Slow 3G" and verify the skeleton appears during the wait. Will also check there's no flash of skeleton on fast connections.

---

## Issue 14 — Export JSON opens a new tab instead of downloading a file

**Labels:** `bug`, `good first issue`
**Complexity:** Trivial
**Key files:** `components/receipt-card.tsx`

**Background**

The current JSON export does:
```ts
window.open(`data:text/plain;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`, "_blank")
```

This opens a new browser tab showing the raw JSON. It doesn't trigger a file download. The user has to Ctrl+S or File → Save from that tab to actually save the data.

**What to do**

Replace the `window.open` approach with a proper `<a download>` click. Create a Blob, use `URL.createObjectURL`, set `download="payproof-receipt-{id}.json"`, click it, revoke the URL.

**Acceptance criteria**
- Clicking "Export JSON" downloads a file named `payproof-receipt-{data.id}.json`
- File is valid JSON containing the full `ReceiptData` object
- No new tab opens
- The object URL is revoked after the download triggers (no memory leak)
- Works in Chrome, Firefox, and Safari

**Review expectations**

Reviewer will click Export JSON in all three browsers and confirm a file downloads with the correct name and valid JSON content.

---

## Issue 15 — Ledger number links to Stellar.Expert ledger page

**Labels:** `enhancement`, `good first issue`
**Complexity:** Trivial
**Key files:** `components/transaction-results.tsx`

**Background**

The transaction status card shows "Ledger 3041335" as plain text. Stellar.Expert has a ledger detail page at `https://stellar.expert/explorer/{network}/ledger/{sequence}`. Making the ledger number a link gives users an easy way to see what else happened in that ledger — useful for timing context and for verifying that a transaction landed where expected.

**What to do**

Wrap the ledger sequence number in the `CardDescription` with an `<a>` pointing to the correct Stellar.Expert URL based on the network.

**Acceptance criteria**
- Ledger number in the status card is a link
- Link opens in a new tab (`target="_blank"` + `rel="noopener noreferrer"`)
- URL uses `public` for mainnet and `testnet` for testnet (Stellar.Expert's convention — same as the existing transaction link in `TransactionResults`)
- Link is visually distinct (underline or `text-primary`) — not invisible text
- Verified against a real testnet ledger link that it resolves correctly

**Review expectations**

Quick review — check the URL pattern against the existing explorer links in the same component for consistency.
