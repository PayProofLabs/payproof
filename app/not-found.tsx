import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="container flex flex-col items-center justify-center min-h-[400px] py-24 text-center space-y-6">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-muted-foreground max-w-sm">
        That page doesn&apos;t exist. You might have followed a broken link or mistyped the URL.
      </p>
      <div className="flex gap-3">
        <Button asChild>
          <Link href="/">Go home</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/verify">Verify a transaction</Link>
        </Button>
      </div>
    </div>
  )
}
