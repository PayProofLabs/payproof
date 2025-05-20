"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ReceiptCard } from "@/components/receipt-card"
import { stellarService } from "@/lib/stellar"
import { useToast } from "@/hooks/use-toast"
import type { TransactionResult, ReceiptData, StellarNetwork } from "@/types/stellar"
import { ArrowLeft, Loader2 } from "lucide-react"

export default function ReceiptPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null)

  useEffect(() => {
    const loadReceipt = async () => {
      if (!params.id || typeof params.id !== "string") {
        router.push("/verify")
        return
      }

      const [hash, operationIndex] = params.id.split("-")

      if (!hash || !stellarService.validateTransactionHash(hash)) {
        toast({ title: "Invalid receipt", description: "The receipt ID contains an invalid transaction hash", variant: "destructive" })
        router.push("/verify")
        return
      }

      // Read network from query param. Fall back to testnet-first guessing for
      // old links that don't have the param (e.g. links shared before this fix).
      const networkParam = searchParams.get("network")
      const knownNetwork: StellarNetwork | null =
        networkParam === "mainnet" || networkParam === "testnet" ? networkParam : null

      try {
        let result: TransactionResult
        let resolvedNetwork: StellarNetwork

        if (knownNetwork) {
          result = await stellarService.getTransaction(hash, knownNetwork)
          resolvedNetwork = knownNetwork
        } else {
          // Legacy fallback: try testnet then mainnet
          try {
            result = await stellarService.getTransaction(hash, "testnet")
            resolvedNetwork = "testnet"
          } catch {
            result = await stellarService.getTransaction(hash, "mainnet")
            resolvedNetwork = "mainnet"
          }
        }

        const opIndex = parseInt(operationIndex || "0", 10)

        if (opIndex >= result.operations.length) {
          toast({
            title: "Operation not found",
            description: `Index ${opIndex} is out of range — this transaction has ${result.operations.length} payment operation(s).`,
            variant: "destructive",
          })
          router.push("/verify")
          return
        }

        const operation = result.operations[opIndex]

        setReceiptData({
          id: params.id,
          transaction_hash: result.transaction.hash,
          sender: operation.from,
          receiver: operation.to,
          amount: operation.amount,
          asset_code: operation.asset_code || "XLM",
          asset_issuer: operation.asset_issuer,
          timestamp: result.transaction.created_at,
          status: result.status,
          memo: result.transaction.memo,
          memo_type: result.transaction.memo_type,
          fee: result.transaction.fee_charged_xlm,
          network: resolvedNetwork,
        })
      } catch (error: any) {
        toast({ title: "Error", description: error.message || "Failed to load receipt", variant: "destructive" })
        router.push("/verify")
      } finally {
        setLoading(false)
      }
    }

    loadReceipt()
  }, [params.id, searchParams, router, toast])

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <Card className="mx-auto max-w-2xl">
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin mx-auto" />
              <p className="text-muted-foreground">Loading receipt...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!receiptData) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <Card className="mx-auto max-w-2xl">
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground mb-4">Receipt not found</p>
            <Button onClick={() => router.push("/verify")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Verify
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Payment Receipt</h1>
          <p className="text-muted-foreground text-sm">Receipt ID: {receiptData.id}</p>
        </div>
      </div>

      <ReceiptCard data={receiptData} />
    </div>
  )
}
