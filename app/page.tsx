import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Shield, Code, Zap, Star, ArrowRight } from "lucide-react"

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-muted/10 dark:to-muted/5">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative py-16 sm:py-24 md:py-32 space-y-8">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center rounded-full border border-border/50 bg-card/50 backdrop-blur-sm px-4 py-1.5 text-sm text-muted-foreground">
              <span className="mr-2 h-2 w-2 rounded-full bg-green-500"></span>
              Mainnet & Testnet Support
            </div>
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
              Stellar Payment
              <br />
              <span className="bg-gradient-to-r from-primary to-green-400 bg-clip-text text-transparent">
                Verification
              </span>
            </h1>
            <p className="mx-auto max-w-[600px] text-lg text-muted-foreground md:text-xl leading-relaxed">
              Open-source infrastructure for verifying Stellar transactions and generating professional receipts.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" className="h-12 px-8 text-base shadow-lg" asChild>
                <Link href="/verify">
                  Verify Transaction
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="h-12 px-8 text-base backdrop-blur-sm" asChild>
                <Link
                  href="https://github.com/payproof/payproof"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Star className="mr-2 h-5 w-5" />
                  GitHub
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 md:py-32 space-y-16">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            What it does
          </h2>
          <p className="mx-auto max-w-[600px] text-lg text-muted-foreground">
            Three things, done well.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <Card className="fintech-card group hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/10">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
              <CardTitle className="text-xl">Transaction Verification</CardTitle>
              <CardDescription className="text-base leading-relaxed">
                Queries the Stellar Horizon API with a transaction hash and parses payment, path_payment_strict_receive, and path_payment_strict_send operations.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center">
                  <span className="mr-2 h-1.5 w-1.5 rounded-full bg-green-500"></span>
                  Hash, status, ledger, fee
                </li>
                <li className="flex items-center">
                  <span className="mr-2 h-1.5 w-1.5 rounded-full bg-green-500"></span>
                  XLM and custom assets
                </li>
                <li className="flex items-center">
                  <span className="mr-2 h-1.5 w-1.5 rounded-full bg-green-500"></span>
                  Mainnet and testnet
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="fintech-card group hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10">
                <Shield className="h-6 w-6 text-blue-500" />
              </div>
              <CardTitle className="text-xl">Professional Receipts</CardTitle>
              <CardDescription className="text-base leading-relaxed">
                Each verified payment operation gets a receipt page at <code className="text-xs">/receipt/&#123;hash&#125;-&#123;index&#125;</code> — printable and shareable.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center">
                  <span className="mr-2 h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                  Stable, bookmarkable URL
                </li>
                <li className="flex items-center">
                  <span className="mr-2 h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                  Print-friendly layout
                </li>
                <li className="flex items-center">
                  <span className="mr-2 h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                  JSON export
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="fintech-card group hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10">
                <Code className="h-6 w-6 text-purple-500" />
              </div>
              <CardTitle className="text-xl">Open Source</CardTitle>
              <CardDescription className="text-base leading-relaxed">
                MIT licensed. All Horizon queries run in the browser — no data is sent to or stored by PayProof.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center">
                  <span className="mr-2 h-1.5 w-1.5 rounded-full bg-purple-500"></span>
                  MIT licensed
                </li>
                <li className="flex items-center">
                  <span className="mr-2 h-1.5 w-1.5 rounded-full bg-purple-500"></span>
                  No tracking
                </li>
                <li className="flex items-center">
                  <span className="mr-2 h-1.5 w-1.5 rounded-full bg-purple-500"></span>
                  Privacy first
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 md:py-32 space-y-16 border-t">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
            How it works
          </h2>
          <p className="mx-auto max-w-[600px] text-lg text-muted-foreground">
            Verify any Stellar transaction in three simple steps.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:gap-12 md:grid-cols-3">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <span className="text-2xl font-bold text-primary">1</span>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">Enter Transaction Hash</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Paste any 64-character Stellar transaction hash from mainnet or testnet.
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center text-center space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <span className="text-2xl font-bold text-primary">2</span>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">Get Verification</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                View detailed transaction information including status, amounts, and participants.
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center text-center space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <span className="text-2xl font-bold text-primary">3</span>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">Generate Receipt</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Create professional receipts for your records and compliance needs.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center pt-8">
          <Button size="lg" asChild>
            <Link href="/verify">
              Try it now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}