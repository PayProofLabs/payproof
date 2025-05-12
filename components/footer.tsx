import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <img src="/logo-navbar.svg" alt="PayProof" className="h-6 w-6" />
              <span className="text-xl font-bold">PayProof</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Verify Stellar transactions and generate receipts. MIT licensed, no data collection.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Platform</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/verify" className="text-muted-foreground hover:text-foreground">
                  Verify Transaction
                </Link>
              </li>
              <li>
                <Link href="/docs" className="text-muted-foreground hover:text-foreground">
                  Documentation
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Community</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="https://github.com/payproof/payproof"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground"
                >
                  GitHub
                </Link>
              </li>
              <li>
                <Link
                  href="https://github.com/payproof/payproof/discussions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Discussions
                </Link>
              </li>
              <li>
                <Link
                  href="https://github.com/payproof/payproof/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Issues
                </Link>
              </li>
              <li>
                <Link
                  href="https://github.com/payproof/payproof/blob/main/CONTRIBUTING.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Contributing
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="https://stellar.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Stellar.org
                </Link>
              </li>
              <li>
                <Link
                  href="https://github.com/payproof/payproof/blob/main/LICENSE"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground"
                >
                  MIT License
                </Link>
              </li>
              <li>
                <Link
                  href="https://github.com/payproof/payproof/security"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Security
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} PayProof. MIT Licensed.</p>
        </div>
      </div>
    </footer>
  )
}