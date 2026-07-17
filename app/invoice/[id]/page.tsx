"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { useParams, useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ReceiptQRCode } from "@/components/receipt-qrcode"
import { getInvoice, updateInvoice, checkInvoicePayment } from "@/lib/invoices"
import { stellarService } from "@/lib/stellar"
import { buildInvoiceSep7Uri } from "@/lib/sep7"
import { PayWithWalletButton } from "@/components/pay-with-wallet-button"
import { useToast } from "@/hooks/use-toast"
import type { Invoice } from "@/types/invoice"
import { ArrowLeft, Copy, ExternalLink, Loader2, CheckCircle } from "lucide-react"

function StatusBadge({ status }: { status: Invoice["status"] }) {
  return status === "paid" ? (
    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
      <CheckCircle className="mr-1 h-3 w-3" />
      Paid
    </Badge>
  ) : (
    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">
      Unpaid
    </Badge>
  )
}

export default function InvoicePage() {
  const { id } = useParams<{ id: string }>()
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()

  const isPayer = searchParams.get("view") === "pay"
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [checking, setChecking] = useState(false)
  const [manualHash, setManualHash] = useState("")

  useEffect(() => {
    const inv = getInvoice(id)
    if (!inv) {
      toast({ title: "Invoice not found", variant: "destructive" })
      router.push("/invoice")
    } else {
      setInvoice(inv)
    }
  }, [id, router, toast])

  const refreshInvoice = useCallback(() => {
    const inv = getInvoice(id)
    if (inv) setInvoice(inv)
  }, [id])

  const handleCheckPayment = useCallback(async () => {
    if (!invoice) return
    setChecking(true)
    try {
      const txHash = await checkInvoicePayment(invoice)
      if (txHash) {
        updateInvoice(invoice.id, { status: "paid", paidTxHash: txHash })
        refreshInvoice()
        toast({ title: "Payment detected", description: `Tx: ${txHash.slice(0, 16)}…` })
        return true // payment found
      } else {
        toast({ title: "No payment found yet", description: "Try again in a moment" })
      }
    } finally {
      setChecking(false)
    }
    return false
  }, [invoice, refreshInvoice, toast])

  // Auto-poll every 30 s on the sender view while the invoice is unpaid.
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    // Only poll on the sender view for unpaid invoices.
    if (isPayer || !invoice || invoice.status !== "unpaid") return

    const poll = async () => {
      const found = await checkInvoicePayment(invoice)
      if (found) {
        updateInvoice(invoice.id, { status: "paid", paidTxHash: found })
        refreshInvoice()
        toast({ title: "Payment detected", description: `Tx: ${found.slice(0, 16)}…` })
        if (pollingRef.current) {
          clearInterval(pollingRef.current)
          pollingRef.current = null
        }
      }
    }

    pollingRef.current = setInterval(poll, 30_000)

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
        pollingRef.current = null
      }
    }
  }, [invoice, isPayer, refreshInvoice, toast])

  const handleManualVerify = async () => {
    if (!invoice || !manualHash.trim()) return
    if (!stellarService.validateTransactionHash(manualHash.trim())) {
      toast({ title: "Invalid hash", description: "Must be 64 hex characters", variant: "destructive" })
      return
    }
    updateInvoice(invoice.id, { status: "paid", paidTxHash: manualHash.trim() })
    refreshInvoice()
    toast({ title: "Marked as paid" })
  }

  const copyUrl = (suffix = "") => {
    navigator.clipboard.writeText(`${window.location.origin}/invoice/${id}${suffix}`)
    toast({ title: "Link copied" })
  }

  if (!invoice) {
    return (
      <div className="w-full max-w-2xl mx-auto px-4 py-12 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Loading invoice…</p>
      </div>
    )
  }

  const payUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/invoice/${id}?view=pay`
  const receiptUrl = invoice.paidTxHash
    ? `/receipt/${invoice.paidTxHash}-0?network=${invoice.network}`
    : null

  // SEP-7 payment URI — null when the invoice data is invalid (should never
  // happen in practice since invoices are validated on creation).
  const sep7Uri = buildInvoiceSep7Uri(invoice)

  // ── PAYER VIEW ───────────────────────────────────────────────────────────
  if (isPayer) {
    return (
      <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">{invoice.title}</h1>
          {invoice.recipientName && (
            <p className="text-muted-foreground text-sm">From {invoice.recipientName}</p>
          )}
        </div>

        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="text-center">
              <p className="text-4xl font-bold text-primary">
                {invoice.amount} {invoice.asset}
              </p>
              {invoice.dueDate && (
                <p className="text-sm text-muted-foreground mt-1">
                  Due {new Date(invoice.dueDate).toLocaleDateString()}
                </p>
              )}
              <div className="mt-2">
                <StatusBadge status={invoice.status} />
              </div>
            </div>

            {invoice.description && (
              <div className="border-t pt-4">
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{invoice.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">How to pay</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {sep7Uri && invoice.status === "unpaid" && (
              <div className="pb-2 border-b">
                <PayWithWalletButton sep7Uri={sep7Uri} />
              </div>
            )}

            <div className="rounded-md bg-muted p-4 space-y-2 text-sm font-mono">
              <p><span className="text-muted-foreground">Send:</span> {invoice.amount} {invoice.asset}</p>
              <p className="break-all"><span className="text-muted-foreground">To:</span> {invoice.recipientAddress}</p>
              <p><span className="text-muted-foreground">Memo:</span> {invoice.id}</p>
            </div>
            <p className="text-xs text-muted-foreground">
              Include the memo exactly as shown so the payment can be matched automatically.
            </p>

            <div className="flex justify-center pt-2">
              <ReceiptQRCode url={invoice.recipientAddress} size={160} />
            </div>
            <p className="text-xs text-center text-muted-foreground">Scan to copy the recipient address</p>
          </CardContent>
        </Card>

        {invoice.status === "unpaid" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Already paid?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Paste your transaction hash below to confirm payment.
              </p>
              <div className="flex gap-2">
                <Input
                  placeholder="64-character transaction hash"
                  value={manualHash}
                  onChange={(e) => setManualHash(e.target.value)}
                  className="font-mono text-sm"
                />
                <Button onClick={handleManualVerify} variant="outline">Confirm</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {invoice.status === "paid" && receiptUrl && (
          <div className="text-center">
            <Button asChild>
              <Link href={receiptUrl}>
                <ExternalLink className="mr-2 h-4 w-4" />
                View Receipt
              </Link>
            </Button>
          </div>
        )}
      </div>
    )
  }

  // ── SENDER VIEW ──────────────────────────────────────────────────────────
  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.push("/invoice")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          All invoices
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <CardTitle>{invoice.title}</CardTitle>
              {invoice.recipientName && (
                <p className="text-sm text-muted-foreground">{invoice.recipientName}</p>
              )}
            </div>
            <StatusBadge status={invoice.status} />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-3xl font-bold text-primary">
            {invoice.amount} {invoice.asset}
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Network</p>
              <p className="font-medium capitalize">{invoice.network}</p>
            </div>
            {invoice.dueDate && (
              <div>
                <p className="text-muted-foreground">Due</p>
                <p className="font-medium">{new Date(invoice.dueDate).toLocaleDateString()}</p>
              </div>
            )}
            <div>
              <p className="text-muted-foreground">Invoice ID</p>
              <p className="font-mono font-medium">{invoice.id}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Created</p>
              <p className="font-medium">{new Date(invoice.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          {invoice.description && (
            <div className="border-t pt-4">
              <p className="text-xs text-muted-foreground mb-1">Description</p>
              <p className="text-sm whitespace-pre-wrap">{invoice.description}</p>
            </div>
          )}

          <div className="border-t pt-4 space-y-3">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Recipient address</p>
              <p className="font-mono text-xs break-all">{invoice.recipientAddress}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <Button variant="outline" onClick={() => copyUrl("?view=pay")}>
          <Copy className="mr-2 h-4 w-4" />
          Share payment link
        </Button>
        <Button variant="outline" onClick={() => copyUrl()}>
          <Copy className="mr-2 h-4 w-4" />
          Copy invoice link
        </Button>
      </div>

      {invoice.status === "unpaid" && (
        <Card>
          <CardContent className="pt-6 space-y-3">
            <p className="text-sm text-muted-foreground">
              Waiting for payment of <strong>{invoice.amount} {invoice.asset}</strong> with memo <strong className="font-mono">{invoice.id}</strong>.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Button onClick={handleCheckPayment} disabled={checking}>
                {checking && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {checking ? "Checking…" : "Check for payment"}
              </Button>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <span className="inline-block h-2 w-2 rounded-full bg-yellow-400 animate-pulse" />
                Auto-checking every 30 s
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {invoice.status === "paid" && (
        <Card>
          <CardContent className="pt-6 space-y-3">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span className="font-semibold">Payment confirmed</span>
            </div>
            {invoice.paidTxHash && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Transaction hash</p>
                <p className="font-mono text-xs break-all">{invoice.paidTxHash}</p>
                {receiptUrl && (
                  <Button asChild size="sm" variant="outline">
                    <Link href={receiptUrl}>
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View Receipt
                    </Link>
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
