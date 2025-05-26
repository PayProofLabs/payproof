import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Code, Book, Zap, GitBranch, ArrowRight, ExternalLink } from "lucide-react"

export default function DocsPage() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
      {/* Hero */}
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
          Documentation
        </h1>
        <p className="mx-auto max-w-[700px] text-xl text-muted-foreground">
          How PayProof works, what it supports, and how to contribute.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Button size="lg" asChild>
            <Link href="/verify">Try it</Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="https://github.com/PayProofLabs/payproof" target="_blank" rel="noopener noreferrer">
              <GitBranch className="mr-2 h-4 w-4" />
              View Source
            </Link>
          </Button>
        </div>
      </div>

      {/* Table of Contents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Book className="mr-2 h-5 w-5" />
            Contents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <nav className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <a href="#introduction" className="block text-sm hover:text-primary transition-colors">1. What PayProof is</a>
              <a href="#how-it-works" className="block text-sm hover:text-primary transition-colors">2. How it works</a>
              <a href="#verifying-transactions" className="block text-sm hover:text-primary transition-colors">3. Verifying transactions</a>
              <a href="#receipt-generation" className="block text-sm hover:text-primary transition-colors">4. Receipts</a>
            </div>
            <div className="space-y-2">
              <a href="#architecture" className="block text-sm hover:text-primary transition-colors">5. Architecture</a>
              <a href="#roadmap" className="block text-sm hover:text-primary transition-colors">6. Roadmap</a>
              <a href="#contributing" className="block text-sm hover:text-primary transition-colors">7. Contributing</a>
              <a href="#license" className="block text-sm hover:text-primary transition-colors">8. License</a>
            </div>
          </nav>
        </CardContent>
      </Card>

      {/* Introduction */}
      <section id="introduction" className="space-y-6">
        <h2 className="text-3xl font-bold tracking-tighter">What PayProof is</h2>
        <div className="space-y-4">
          <p className="text-lg text-muted-foreground">
            PayProof is a client-side web app for verifying Stellar transactions and generating receipts.
            It queries the Stellar Horizon API directly from the browser — there is no backend, no database,
            and no data collection.
          </p>
          <ul className="space-y-3 text-muted-foreground">
            <li className="flex items-start">
              <CheckCircle className="mr-2 h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Stellar explorers show raw transaction data. PayProof formats it into something you can hand to a client or drop in an accounting file.</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="mr-2 h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Receipt URLs are stable and shareable, so both parties to a payment can reference the same record.</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="mr-2 h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <span>MIT licensed with no lock-in — self-host it if you need to.</span>
            </li>
          </ul>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="space-y-6">
        <h2 className="text-3xl font-bold tracking-tighter">How it works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                <span className="text-blue-500 font-bold">1</span>
              </div>
              <CardTitle className="text-lg">Hash input</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                You provide a 64-character hex transaction hash and select mainnet or testnet.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                <span className="text-green-500 font-bold">2</span>
              </div>
              <CardTitle className="text-lg">Horizon query</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                The browser calls <code className="text-xs">horizon[-testnet].stellar.org/transactions/{"{hash}"}</code> and <code className="text-xs">/operations</code>. No data passes through PayProof servers.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
                <span className="text-purple-500 font-bold">3</span>
              </div>
              <CardTitle className="text-lg">Receipt</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Payment operations are extracted and rendered as a receipt at <code className="text-xs">/receipt/{"{hash}"}-{"{index}"}</code>.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Verifying Transactions */}
      <section id="verifying-transactions" className="space-y-6">
        <h2 className="text-3xl font-bold tracking-tighter">Verifying transactions</h2>
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transaction hash format</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Stellar transaction hashes are 64-character hex strings. Example testnet hash:
              </p>
              <div className="bg-muted p-4 rounded-lg">
                <code className="text-sm font-mono break-all">
                  980a03a11a6e212ac2d6a739188c89437f9cfb1b0302b8aeb58c573a06ef71d4
                </code>
              </div>
              <Button size="sm" asChild>
                <Link href="/verify">Try with this hash</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Supported operation types</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                PayProof extracts operations of these types from a transaction:
              </p>
              <ul className="space-y-1 text-sm font-mono text-muted-foreground">
                <li>payment</li>
                <li>path_payment_strict_receive</li>
                <li>path_payment_strict_send</li>
              </ul>
              <p className="text-sm text-muted-foreground mt-3">
                Other operation types (account creation, trust lines, etc.) are present in the transaction
                but not shown in the results.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Networks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Badge variant="secondary">Testnet</Badge>
                  <p className="text-sm text-muted-foreground">
                    Queries <code className="text-xs">horizon-testnet.stellar.org</code>. Use this for development — testnet funds have no real value.
                  </p>
                </div>
                <div className="space-y-2">
                  <Badge>Mainnet</Badge>
                  <p className="text-sm text-muted-foreground">
                    Queries <code className="text-xs">horizon.stellar.org</code>. Real transactions with real funds.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Receipt Generation */}
      <section id="receipt-generation" className="space-y-6">
        <h2 className="text-3xl font-bold tracking-tighter">Receipts</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>What a receipt contains</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center"><CheckCircle className="mr-2 h-4 w-4 text-green-500" />Transaction hash and status</li>
                <li className="flex items-center"><CheckCircle className="mr-2 h-4 w-4 text-green-500" />Sender and receiver addresses</li>
                <li className="flex items-center"><CheckCircle className="mr-2 h-4 w-4 text-green-500" />Amount and asset (code + issuer for non-XLM)</li>
                <li className="flex items-center"><CheckCircle className="mr-2 h-4 w-4 text-green-500" />Timestamp and ledger sequence</li>
                <li className="flex items-center"><CheckCircle className="mr-2 h-4 w-4 text-green-500" />Fee in XLM and stroops</li>
                <li className="flex items-center"><CheckCircle className="mr-2 h-4 w-4 text-green-500" />Memo (if present)</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Export options</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Print (browser)</span>
                  <Badge variant="secondary">Available</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Share link</span>
                  <Badge variant="secondary">Available</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Export JSON</span>
                  <Badge variant="secondary">Available</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">PDF export</span>
                  <Badge variant="secondary">Available</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <p className="text-sm text-muted-foreground">
          Receipt URLs use the format <code className="text-xs bg-muted px-1 py-0.5 rounded">/receipt/&#123;hash&#125;-&#123;operationIndex&#125;</code>.
          If a transaction has one payment operation the URL ends in <code className="text-xs bg-muted px-1 py-0.5 rounded">-0</code>.
          The receipt page tries testnet first, then mainnet — this works in practice but can fail if the
          wrong network responds first.
        </p>
      </section>

      {/* Architecture */}
      <section id="architecture" className="space-y-6">
        <h2 className="text-3xl font-bold tracking-tighter">Architecture</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Stack</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li><strong>Framework:</strong> Next.js 15, App Router, TypeScript</li>
                <li><strong>UI:</strong> Tailwind CSS, shadcn/ui (Radix primitives)</li>
                <li><strong>Stellar:</strong> <code className="text-xs">@stellar/stellar-sdk</code> — used for the Horizon server client and hash validation</li>
                <li><strong>Theme:</strong> next-themes</li>
                <li><strong>Deployment:</strong> Vercel (live site), Docker config included</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Key files</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><code className="text-xs">lib/stellar.ts</code> — Horizon queries, operation filtering, fee conversion</li>
                <li><code className="text-xs">types/stellar.ts</code> — shared TypeScript interfaces</li>
                <li><code className="text-xs">components/transaction-results.tsx</code> — result display</li>
                <li><code className="text-xs">components/receipt-card.tsx</code> — receipt layout and actions</li>
                <li><code className="text-xs">app/receipt/[id]/page.tsx</code> — receipt page, parses the hash-index URL</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Roadmap */}
      <section id="roadmap" className="space-y-6">
        <h2 className="text-3xl font-bold tracking-tighter">Roadmap</h2>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
                Done
                <Badge variant="secondary" className="ml-2">Shipped</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Transaction verification on mainnet and testnet</li>
                <li>• Payment operation display (amount, sender, receiver, asset)</li>
                <li>• Receipt pages with stable URLs</li>
                <li>• Print, share, and JSON export</li>
                <li>• Light and dark theme</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Code className="mr-2 h-5 w-5 text-blue-500" />
                Near-term
                <Badge className="ml-2">In Progress</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• PDF export (browser print works today; proper PDF generation TBD)</li>
                <li>• Tests for <code className="text-xs">lib/stellar.ts</code> and <code className="text-xs">lib/utils.ts</code></li>
                <li>• Better handling of transactions with multiple payment operations</li>
                <li>• Fix the fragile network auto-detection on receipt pages</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="mr-2 h-5 w-5 text-purple-500" />
                Possible future work
                <Badge variant="outline" className="ml-2">Exploratory</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Public REST API (so other apps can query PayProof instead of Horizon directly)</li>
                <li>• Batch verification for multiple hashes at once</li>
                <li>• Webhook support for merchant payment confirmation flows</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Contributing */}
      <section id="contributing" className="space-y-6">
        <h2 className="text-3xl font-bold tracking-tighter">Contributing</h2>
        <Card>
          <CardContent className="pt-6 space-y-4">
            <p className="text-muted-foreground">
              See <a href="https://github.com/PayProofLabs/payproof/blob/main/CONTRIBUTING.md" className="underline" target="_blank" rel="noopener noreferrer">CONTRIBUTING.md</a> for
              setup instructions and what&apos;s most useful right now. The short version: clone the repo, run{" "}
              <code className="text-xs bg-muted px-1 py-0.5 rounded">npm install && npm run dev</code>, and open a PR against <code className="text-xs bg-muted px-1 py-0.5 rounded">main</code>.
            </p>
            <p className="text-muted-foreground">
              The most impactful open items are a test suite and PDF export. Check the{" "}
              <a href="https://github.com/PayProofLabs/payproof/issues" className="underline" target="_blank" rel="noopener noreferrer">issues list</a> for anything tagged <code className="text-xs bg-muted px-1 py-0.5 rounded">good first issue</code>.
            </p>
            <div className="flex gap-4 pt-2">
              <Button asChild>
                <Link href="https://github.com/PayProofLabs/payproof" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  GitHub
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="https://github.com/PayProofLabs/payproof/blob/main/CONTRIBUTING.md" target="_blank" rel="noopener noreferrer">
                  CONTRIBUTING.md
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* License */}
      <section id="license" className="space-y-6">
        <h2 className="text-3xl font-bold tracking-tighter">License</h2>
        <Card>
          <CardContent className="pt-6 space-y-4">
            <p className="text-muted-foreground">
              MIT. Use it, fork it, self-host it. See the{" "}
              <a href="https://github.com/PayProofLabs/payproof/blob/main/LICENSE" className="underline" target="_blank" rel="noopener noreferrer">LICENSE</a> file.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Footer CTA */}
      <div className="text-center space-y-6 pt-12 border-t">
        <h3 className="text-2xl font-bold">Try it</h3>
        <p className="text-muted-foreground">
          Paste any Stellar transaction hash to get started.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" asChild>
            <Link href="/verify">
              <ArrowRight className="mr-2 h-4 w-4" />
              Verify a transaction
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="https://github.com/PayProofLabs/payproof" target="_blank" rel="noopener noreferrer">
              <GitBranch className="mr-2 h-4 w-4" />
              Fork on GitHub
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
