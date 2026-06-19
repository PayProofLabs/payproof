"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { getAllInvoices, checkInvoicePayment, updateInvoice } from "@/lib/invoices"
import { useToast } from "@/hooks/use-toast"
import type { Invoice } from "@/types/invoice"
import { Plus, Loader2, CheckCircle, ExternalLink } from "lucide-react"

export default function InvoiceListPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [checking, setChecking] = useState<string | null>(null)

  useEffect(() => {
    setInvoices(getAllInvoices().sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ))
  }, [])

  const refresh = () => {
    setInvoices(getAllInvoices().sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ))
  }

  const handleCheck = async (invoice: Invoice) => {
    setChecking(invoice.id)
    try {
      const txHash = await checkInvoicePayment(invoice)
      if (txHash) {
        updateInvoice(invoice.id, { status: "paid", paidTxHash: txHash })
        refresh()
        toast({ title: "Payment detected", description: `Invoice "${invoice.title}" is now paid` })
      } else {
        toast({ title: "No payment found yet" })
      }
    } finally {
      setChecking(null)
    }
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Invoices are stored locally in your browser.
          </p>
        </div>
        <Button asChild>
          <Link href="/invoice/create">
            <Plus className="mr-2 h-4 w-4" />
            New Invoice
          </Link>
        </Button>
      </div>

      {invoices.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center space-y-4">
            <p className="text-muted-foreground">No invoices yet.</p>
            <Button asChild>
              <Link href="/invoice/create">
                <Plus className="mr-2 h-4 w-4" />
                Create your first invoice
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Title</th>
                <th className="text-left px-4 py-3 font-medium">Amount</th>
                <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Due</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-right px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium">{inv.title}</div>
                    <div className="text-xs text-muted-foreground font-mono">{inv.id}</div>
                  </td>
                  <td className="px-4 py-3 font-mono">
                    {inv.amount} {inv.asset}
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground">
                    {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {inv.status === "paid" ? (
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Paid
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">
                        Unpaid
                      </Badge>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/invoice/${inv.id}`}>View</Link>
                      </Button>
                      {inv.status === "unpaid" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCheck(inv)}
                          disabled={checking === inv.id}
                        >
                          {checking === inv.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            "Check"
                          )}
                        </Button>
                      )}
                      {inv.status === "paid" && inv.paidTxHash && (
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/receipt/${inv.paidTxHash}-0?network=${inv.network}`}>
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Receipt
                          </Link>
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
