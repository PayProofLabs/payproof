"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { Menu, X, Star } from "lucide-react"
import { useState } from "react"

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <img src="/logo-navbar.svg" alt="PayProof" className="h-8 w-8" />
          <span className="text-xl font-bold">PayProof</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link
            href="/verify"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Verify Transaction
          </Link>
          <Link
            href="/docs"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Docs
          </Link>
          <Link
            href="https://github.com/payproof/payproof"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-sm font-medium transition-colors hover:text-primary"
          >
            <Star className="mr-1 h-4 w-4" />
            GitHub
          </Link>
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center space-x-4">
          <ThemeToggle />
          <Button asChild>
            <Link href="/verify">
              Verify Payment
            </Link>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center space-x-2">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <nav className="container py-4 space-y-4">
            <Link
              href="/verify"
              className="block text-sm font-medium transition-colors hover:text-primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              Verify Transaction
            </Link>
            <Link
              href="/docs"
              className="block text-sm font-medium transition-colors hover:text-primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              Docs
            </Link>
            <Link
              href="https://github.com/PayProofLabs/payproof"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-sm font-medium transition-colors hover:text-primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Star className="mr-2 h-4 w-4" />
              GitHub
            </Link>
            <div className="pt-4 border-t">
              <Button className="w-full" asChild>
                <Link href="/verify" onClick={() => setMobileMenuOpen(false)}>
                  Verify Payment
                </Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}