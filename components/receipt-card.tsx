"use client"

import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { NetworkBadge } from "@/components/network-selector"
import { ReceiptQRCode } from "@/components/receipt-qrcode"
import { formatStellarAmount, formatTimestamp, truncateHash } from "@/lib/utils"
import type { ReceiptData } from "@/types/stellar"
import { Download, Printer, Share, Copy, CheckCircle, Wallet, FileDown } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ReceiptCardProps {
  data: ReceiptData
}

function formatMemo(memoType: string | undefined, memo: string | undefined): string | null {
  if (!memo || memoType === "none" || memoType === undefined) return null
  if (memoType === "text") return memo
  // For id, hash, return — prefix with the type so it's not ambiguous
  return `[${memoType}] ${memo}`
}

export function ReceiptCard({ data }: ReceiptCardProps) {
  const { toast } = useToast()
  const receiptRef = useRef<HTMLDivElement>(null)
  const receiptUrl = typeof window !== "undefined" ? window.location.href : ""

  const handlePrint = () => {
    window.print()
  }

  const handlePdfExport = async () => {
    if (!receiptRef.current) return

    try {
      // Dynamic imports keep these heavy libraries out of the initial bundle
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import("jspdf"),
        import("html2canvas"),
      ])

      const canvas = await html2canvas(receiptRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        ignoreElements: (el: Element) => el.classList.contains("pdf-ignore"),
      })

      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })

      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = pageWidth - 20 // 10mm margin each side
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      // If taller than a page, scale down to fit
      const finalHeight = imgHeight > pageHeight - 20 ? pageHeight - 20 : imgHeight
      const finalWidth = (canvas.width * finalHeight) / canvas.height

      pdf.addImage(imgData, "PNG", (pageWidth - finalWidth) / 2, 10, finalWidth, finalHeight)
      pdf.save(`payproof-receipt-${data.id}.pdf`)
    } catch {
      toast({
        title: "PDF export failed",
        description: "Could not generate PDF. Try the Print option instead.",
        variant: "destructive",
      })
    }
  }

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({
          title: `PayProof Receipt`,
          text: `Payment receipt: ${formatStellarAmount(data.amount, data.asset_code)}`,
          url,
        })
      } catch {
        // user cancelled — not an error
      }
    } else {
      navigator.clipboard.writeText(url)
      toast({ title: "Link copied", description: "Receipt URL copied to clipboard" })
    }
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast({ title: "Copied", description: `${label} copied to clipboard` })
  }

  const statusBadge = () => {
    switch (data.status) {
      case "success":
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
            <CheckCircle className="mr-1 h-3 w-3" />
            Confirmed
          </Badge>
        )
      case "failed":
        return <Badge variant="destructive">Failed</Badge>
      default:
        return <Badge variant="secondary">Pending</Badge>
    }
  }

  const memoDisplay = formatMemo(data.memo_type, data.memo)

  return (
    <div className="space-y-6">
      {/* The ref wraps only the printable content */}
      <div ref={receiptRef}>
        <Card className="mx-auto max-w-2xl print:shadow-none print:border-0">
          <CardHeader className="text-center border-b">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Wallet className="h-6 w-6" />
              <span className="text-xl font-bold">PayProof</span>
            </div>
            <h1 className="text-2xl font-bold">Payment Receipt</h1>
            <p className="text-muted-foreground text-sm">Stellar Network Transaction</p>
          </CardHeader>

          <CardContent className="space-y-6 p-4 sm:p-8">
            {/* Status and amount */}
            <div className="text-center space-y-2">
              <div className="flex justify-center gap-2">
                {statusBadge()}
                {data.network && <NetworkBadge network={data.network} />}
              </div>
              <div className="text-3xl font-bold text-primary">
                {formatStellarAmount(data.amount, data.asset_code)}
              </div>
              <p className="text-muted-foreground">{formatTimestamp(data.timestamp)}</p>
            </div>

            {/* Addresses */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2 text-sm">From</h3>
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-mono bg-muted px-2 py-1 rounded flex-1 break-all">
                      {truncateHash(data.sender, 12)}
                    </code>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="print:hidden shrink-0"
                      aria-label="Copy sender address"
                      onClick={() => copyToClipboard(data.sender, "Sender address")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2 text-sm">To</h3>
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-mono bg-muted px-2 py-1 rounded flex-1 break-all">
                      {truncateHash(data.receiver, 12)}
                    </code>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="print:hidden shrink-0"
                      aria-label="Copy recipient address"
                      onClick={() => copyToClipboard(data.receiver, "Recipient address")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-1 text-sm">Asset</h3>
                  <p className="font-mono text-sm">
                    {data.asset_code}
                    {data.asset_issuer && (
                      <span className="text-muted-foreground block text-xs">
                        Issuer: {truncateHash(data.asset_issuer, 8)}
                      </span>
                    )}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-1 text-sm">Network</h3>
                  <p className="font-mono text-sm">
                    {data.network === "mainnet" ? "Stellar Mainnet" : "Stellar Testnet"}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-1 text-sm">Fee</h3>
                  <p className="font-mono text-sm">{data.fee} XLM</p>
                </div>
              </div>
            </div>

            {/* Memo */}
            {memoDisplay && (
              <div>
                <h3 className="font-semibold mb-2 text-sm">Memo</h3>
                <p className="bg-muted p-3 rounded text-sm font-mono break-all">{memoDisplay}</p>
              </div>
            )}

            {/* Transaction hash */}
            <div>
              <h3 className="font-semibold mb-2 text-sm">Transaction Hash</h3>
              <div className="flex items-center gap-2">
                <code className="text-sm font-mono bg-muted px-2 py-1 rounded flex-1 break-all">
                  {data.transaction_hash}
                </code>
                <Button
                  variant="ghost"
                  size="icon"
                  className="print:hidden shrink-0"
                  aria-label="Copy transaction hash"
                  onClick={() => copyToClipboard(data.transaction_hash, "Transaction hash")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Receipt ID */}
            <div>
              <h3 className="font-semibold mb-2 text-sm">Receipt ID</h3>
              <code className="text-sm font-mono bg-muted px-2 py-1 rounded block break-all">
                {data.id}
              </code>
            </div>

            {/* QR code — shown on screen and in print */}
            {receiptUrl && (
              <div className="flex flex-col items-center gap-2 pt-2">
                <ReceiptQRCode url={receiptUrl} size={160} />
                <p className="text-xs text-muted-foreground pdf-ignore">
                  Scan to open this receipt
                </p>
              </div>
            )}

            {/* Footer */}
            <div className="border-t pt-4 text-center text-xs text-muted-foreground">
              <p>
                Verified on {data.network === "mainnet" ? "Stellar Mainnet" : "Stellar Testnet"} via
                PayProof
              </p>
              <p className="mt-1">
                <a href="https://payproof-five.vercel.app" className="hover:underline">
                  payproof-five.vercel.app
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action buttons — excluded from PDF capture */}
      <div className="print:hidden flex flex-wrap gap-3 justify-center">
        <Button onClick={handlePrint} variant="outline">
          <Printer className="mr-2 h-4 w-4" />
          Print
        </Button>

        <Button onClick={handlePdfExport} variant="outline">
          <FileDown className="mr-2 h-4 w-4" />
          Download PDF
        </Button>

        <Button onClick={handleShare} variant="outline">
          <Share className="mr-2 h-4 w-4" />
          Share
        </Button>

        <Button
          onClick={() =>
            window.open(
              `data:text/plain;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`,
              "_blank"
            )
          }
          variant="outline"
        >
          <Download className="mr-2 h-4 w-4" />
          Export JSON
        </Button>
      </div>
    </div>
  )
}
