import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="container flex flex-col items-center justify-center gap-8 px-4 py-16">
        <h2 className="text-6xl font-bold">404</h2>
        <h3 className="text-3xl font-semibold">Page Not Found</h3>
        <p className="text-center text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link
          href="/"
          className="rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground hover:opacity-90"
        >
          Go Home
        </Link>
      </div>
    </div>
  )
}
