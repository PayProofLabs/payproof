"use client"

/**
 * PayWithWalletButton
 *
 * Renders a button that opens a SEP-7 `web+stellar:pay?...` URI so a
 * compatible Stellar wallet (e.g. Lobstr, Solar, Freighter) can pre-fill the
 * payment details.
 *
 * The button is intentionally a plain `<a>` element with the SEP-7 URI as its
 * href. This means:
 *   • On mobile the OS can dispatch the URI to a registered wallet app.
 *   • On desktop browsers that have a wallet extension, the extension can
 *     intercept the `web+stellar:` scheme.
 *   • When no wallet is available the browser will show its default
 *     "no app found" dialog — the button copy and tooltip below the button
 *     set that expectation clearly for the user.
 *
 * The existing manual copy/QR flow is the fallback and is always shown
 * alongside this button.
 */

import * as React from "react"
import { Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"

export interface PayWithWalletButtonProps {
  /** The fully-encoded SEP-7 URI, e.g. `web+stellar:pay?destination=G...`. */
  sep7Uri: string
  /** Optional CSS class names forwarded to the button wrapper. */
  className?: string
}

export function PayWithWalletButton({ sep7Uri, className }: PayWithWalletButtonProps) {
  return (
    <div className={className}>
      <Button
        asChild
        className="w-full sm:w-auto"
        size="lg"
      >
        {/*
         * We use an anchor so the browser handles the custom URI scheme
         * natively. rel="noopener noreferrer" is a safety best-practice for
         * any external link, though the target here is a local wallet app.
         */}
        <a
          href={sep7Uri}
          rel="noopener noreferrer"
          aria-label="Open payment in a compatible Stellar wallet"
        >
          <Wallet className="mr-2 h-4 w-4" aria-hidden="true" />
          Pay with Wallet
        </a>
      </Button>

      <p className="mt-2 text-xs text-muted-foreground">
        Opens in a{" "}
        <a
          href="https://stellar.org/learn/wallets"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-foreground transition-colors"
        >
          SEP-7 compatible wallet
        </a>
        . If no wallet is installed, use the manual instructions below.
      </p>
    </div>
  )
}
