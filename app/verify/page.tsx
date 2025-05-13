"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { NetworkSelector } from "@/components/network-selector"
import { TransactionResults } from "@/components/transaction-results"
import { stellarService } from "@/lib/stellar"
import { useToast } from "@/hooks/use-toast"
import type { TransactionResult, StellarNetwork } from "@/types/stellar"
import { Search, Loader2 } from "lucide-react"

export default function VerifyPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [hash, setHash] = useState(() => searchParams.get("hash") ?? "")
  const [selectedNetwork, setSelectedNetwork] = useState<StellarNetwork>(
    () => (searchParams.get("network") === "mainnet" ? "mainnet" : "testnet")
  )
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<TransactionResult | null>(null)
  const { toast } = useToast()

  const updateUrl = useCallback(
    (nextHash: string, nextNetwork: StellarNetwork) => {
      const params = new URLSearchParams()
      if (nextHash.trim()) params.set("hash", nextHash.trim())
      params.set("network", nextNetwork)
      router.replace(`/verify?${params.toString()}`, { scroll: false })
    },
    [router]
  )

  const runVerify = useCallback(
    async (hashValue: string, network: StellarNetwork) => {
      if (!hashValue.trim()) {
        toast({ title: "Error", description: "Please enter a transaction hash", variant: "destructive" })
        return
      }
      if (!stellarService.validateTransactionHash(hashValue.trim())) {
        toast({ title: "Invalid hash", description: "Must be a 64-character hex string", variant: "destructive" })
        return
      }

      setLoading(true)
      setResult(null)

      try {
        const tx = await stellarService.getTransaction(hashValue.trim(), network)
        setResult(tx)
        toast({ title: "Verified", description: `Found on ${network === "mainnet" ? "Mainnet" : "Testnet"}` })
      } catch (error: any) {
        toast({ title: "Not found", description: error.message || "Failed to fetch transaction", variant: "destructive" })
      } finally {
        setLoading(false)
      }
    },
    [toast]
  )

  // Auto-verify on mount when URL already has a valid hash
  useEffect(() => {
    const urlHash = searchParams.get("hash")
    const urlNetwork: StellarNetwork = searchParams.get("network") === "mainnet" ? "mainnet" : "testnet"
    if (urlHash && stellarService.validateTransactionHash(urlHash)) {
      runVerify(urlHash, urlNetwork)
    }
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleVerify = () => {
    updateUrl(hash, selectedNetwork)
    runVerify(hash, selectedNetwork)
  }

  const handleHashChange = (value: string) => {
    setHash(value)
    if (result) setResult(null)
  }

  const handleNetworkChange = (network: StellarNetwork) => {
    setSelectedNetwork(network)
    updateUrl(hash, network)
    if (result) setResult(null)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !loading) handleVerify()
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
          Verify Stellar Transaction
        </h1>
        <p className="mx-auto max-w-[600px] text-muted-foreground md:text-lg">
          Enter a transaction hash to verify payment details and generate a receipt.
        </p>
      </div>

      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Transaction Lookup
          </CardTitle>
          <CardDescription>
            Select network and enter the 64-character transaction hash
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <NetworkSelector
            selectedNetwork={selectedNetwork}
            onNetworkChange={handleNetworkChange}
            disabled={loading}
          />

          <div className="space-y-2">
            <Label htmlFor="hash">Transaction Hash</Label>
            <Input
              id="hash"
              placeholder="e.g. 980a03a11a6e212ac2d6a739188c89437f9cfb1b0302b8aeb58c573a06ef71d4"
              value={hash}
              onChange={(e) => handleHashChange(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              className="font-mono text-sm"
            />
          </div>

          <Button
            onClick={handleVerify}
            disabled={loading || !hash.trim()}
            className="w-full"
            size="lg"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Verifying..." : "Verify Transaction"}
          </Button>

          <p className="text-xs text-muted-foreground">
            Network: <span className="font-mono">{stellarService.getNetworkInfo(selectedNetwork).name}</span>
          </p>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          <TransactionResults result={result} />
        </div>
      )}
    </div>
  )
}
