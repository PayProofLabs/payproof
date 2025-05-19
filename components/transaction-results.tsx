"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { NetworkBadge } from "@/components/network-selector"
import { formatStellarAmount, formatTimestamp, truncateHash } from "@/lib/utils"
import { stellarService } from "@/lib/stellar"
import type { TransactionResult } from "@/types/stellar"
import { CheckCircle, XCircle, Receipt, Copy, ExternalLink } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface TransactionResultsProps {
  result: TransactionResult
}

export function TransactionResults({ result }: TransactionResultsProps) {
  const { toast } = useToast()

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied",
      description: `${label} copied to clipboard`,
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-600" />
      default:
        return <div className="h-5 w-5 rounded-full bg-yellow-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">Success</Badge>
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Transaction Status */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-center gap-3">
              {getStatusIcon(result.status)}
              <div>
                <CardTitle>Transaction Status</CardTitle>
                <CardDescription>
                  Ledger {result.transaction.ledger} • {formatTimestamp(result.transaction.created_at)}
                </CardDescription>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <NetworkBadge network={result.network} />
              {getStatusBadge(result.status)}
              {result.status === 'success' && result.operations.length > 0 && (
                <Button asChild size="sm">
                  <Link href={`/receipt/${result.transaction.hash}-0?network=${result.network}`}>
                    <Receipt className="mr-2 h-4 w-4" />
                    Generate Receipt
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <Label className="text-xs font-medium text-muted-foreground">Transaction Hash</Label>
              <div className="flex items-center gap-2">
                <code className="text-xs sm:text-sm font-mono bg-muted px-2 py-1 rounded truncate min-w-0">
                  {truncateHash(result.transaction.hash, 12)}
                </code>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Copy transaction hash"
                  onClick={() => copyToClipboard(result.transaction.hash, "Transaction hash")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-medium text-muted-foreground">Source Account</Label>
              <div className="flex items-center gap-2">
                <code className="text-xs sm:text-sm font-mono bg-muted px-2 py-1 rounded truncate min-w-0">
                  {truncateHash(result.transaction.source_account, 8)}
                </code>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Copy source account"
                  onClick={() => copyToClipboard(result.transaction.source_account, "Source account")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-1">
              <Label className="text-xs font-medium text-muted-foreground">Operations</Label>
              <p className="text-sm font-medium">{result.transaction.operation_count}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-medium text-muted-foreground">Fee Charged</Label>
              <p className="text-sm font-medium">{result.transaction.fee_charged_xlm} XLM</p>
              <p className="text-xs text-muted-foreground">({result.transaction.fee_charged} stroops)</p>
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-medium text-muted-foreground">Memo</Label>
              <p className="text-sm font-medium">
                {result.transaction.memo || <span className="text-muted-foreground">None</span>}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Operations */}
      {result.operations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Payment Operations ({result.operations.length})</CardTitle>
            <CardDescription>
              All payment operations within this transaction
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {result.operations.map((operation, index) => (
              <div
                key={operation.id}
                className="rounded-lg border p-4 space-y-3"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <Badge variant="outline" className="w-fit">{operation.type.replace(/_/g, ' ')}</Badge>
                  <span className="text-sm font-medium">
                    {formatStellarAmount(operation.amount, operation.asset_code)}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-muted-foreground">From</Label>
                    <div className="flex items-center gap-2">
                      <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                        {truncateHash(operation.from, 8)}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyToClipboard(operation.from, "Sender address")}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-muted-foreground">To</Label>
                    <div className="flex items-center gap-2">
                      <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                        {truncateHash(operation.to, 8)}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyToClipboard(operation.to, "Recipient address")}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-muted-foreground">Asset</Label>
                    <p className="text-sm font-medium">
                      {operation.asset_code || 'XLM'}
                      {operation.asset_issuer && (
                        <span className="text-muted-foreground ml-2">
                          ({truncateHash(operation.asset_issuer, 6)})
                        </span>
                      )}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/receipt/${result.transaction.hash}-${index}?network=${result.network}`}>
                      <Receipt className="mr-2 h-4 w-4" />
                      Generate Receipt
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Explorer Links */}
      <Card>
        <CardHeader>
          <CardTitle>External Resources</CardTitle>
          <CardDescription>
            View this transaction on external explorers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link
                href={`https://stellar.expert/explorer/${result.network === 'mainnet' ? 'public' : 'testnet'}/tx/${result.transaction.hash}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Stellar.Expert
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link
                href={`https://stellarchain.io/${result.network === 'mainnet' ? 'mainnet' : 'testnet'}/tx/${result.transaction.hash}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                StellarChain
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Simple Label component for this usage
function Label({ className, children, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label className={`text-sm font-medium leading-none ${className || ''}`} {...props}>
      {children}
    </label>
  )
}