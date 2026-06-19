"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import * as StellarSdk from "@stellar/stellar-sdk"
import { nanoid } from "nanoid"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { NetworkSelector } from "@/components/network-selector"
import { saveInvoice } from "@/lib/invoices"
import type { Invoice } from "@/types/invoice"
import type { StellarNetwork } from "@/types/stellar"

export default function CreateInvoicePage() {
  const router = useRouter()

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")
  const [asset, setAsset] = useState<"XLM" | "USDC">("XLM")
  const [recipientAddress, setRecipientAddress] = useState("")
  const [recipientName, setRecipientName] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [network, setNetwork] = useState<StellarNetwork>("testnet")
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const e: Record<string, string> = {}
    if (!title.trim()) e.title = "Title is required"
    if (!amount.trim() || isNaN(Number(amount)) || Number(amount) <= 0)
      e.amount = "Enter a valid amount"
    if (!recipientAddress.trim()) {
      e.recipientAddress = "Recipient address is required"
    } else if (!StellarSdk.StrKey.isValidEd25519PublicKey(recipientAddress.trim())) {
      e.recipientAddress = "Not a valid Stellar address"
    }
    return e
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }

    const invoice: Invoice = {
      id: nanoid(8),
      title: title.trim(),
      description: description.trim() || undefined,
      amount: amount.trim(),
      asset,
      recipientAddress: recipientAddress.trim(),
      recipientName: recipientName.trim() || undefined,
      createdAt: new Date().toISOString(),
      dueDate: dueDate || undefined,
      status: "unpaid",
      network,
    }

    saveInvoice(invoice)
    router.push(`/invoice/${invoice.id}`)
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="mb-8 space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">New Invoice</h1>
        <p className="text-muted-foreground text-sm">
          Fill in the details below. Your client will receive a link they can pay directly.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invoice details</CardTitle>
          <CardDescription>All fields marked * are required</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="e.g. Website design — May 2025"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description / line items</Label>
              <textarea
                id="description"
                rows={3}
                placeholder="Optional — list what this invoice covers"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
              />
            </div>

            {/* Amount + Asset */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount *</Label>
                <Input
                  id="amount"
                  type="number"
                  min="0"
                  step="any"
                  placeholder="e.g. 250"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                {errors.amount && <p className="text-xs text-destructive">{errors.amount}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="asset">Asset</Label>
                <select
                  id="asset"
                  value={asset}
                  onChange={(e) => setAsset(e.target.value as "XLM" | "USDC")}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="XLM">XLM</option>
                  <option value="USDC">USDC</option>
                </select>
              </div>
            </div>

            {/* Recipient address */}
            <div className="space-y-2">
              <Label htmlFor="recipientAddress">Your Stellar address (receives payment) *</Label>
              <Input
                id="recipientAddress"
                placeholder="G..."
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
                className="font-mono text-sm"
              />
              {errors.recipientAddress && (
                <p className="text-xs text-destructive">{errors.recipientAddress}</p>
              )}
            </div>

            {/* Recipient name */}
            <div className="space-y-2">
              <Label htmlFor="recipientName">Your name / business name</Label>
              <Input
                id="recipientName"
                placeholder="Optional"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
              />
            </div>

            {/* Due date */}
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due date</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>

            {/* Network */}
            <NetworkSelector
              selectedNetwork={network}
              onNetworkChange={setNetwork}
            />

            <Button type="submit" className="w-full" size="lg">
              Create Invoice
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
