import Link from 'next/link'

export default function AuthCodeErrorPage() {
  return (
    <div className="flex flex-col items-center justify-center min-vh-100 bg-background text-foreground p-6">
      <div className="max-w-md w-full space-y-4 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Authentication Error</h1>
        <p className="text-muted-foreground">
          There was a problem verifying your account. The link might be expired, invalid, or already used.
        </p>
        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 border border-input shadow-sm"
          >
            Go back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
