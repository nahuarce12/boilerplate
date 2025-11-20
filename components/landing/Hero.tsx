import Link from "next/link"
import { Button } from "@/components/ui/button"
import { siteConfig } from "@/config/site"

export function Hero() {
  return (
    <section className="space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32">
      <div className="container flex max-w-[64rem] flex-col items-center gap-4 text-center">
        <Link
          href={siteConfig.links.twitter}
          className="rounded-2xl bg-muted px-4 py-1.5 text-sm font-medium"
          target="_blank"
        >
          Follow along on Twitter
        </Link>
        <h1 className="font-heading text-3xl sm:text-5xl md:text-6xl lg:text-7xl">
          A complete SaaS boilerplate built with Next.js 14
        </h1>
        <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
          I&apos;m building a web app with Next.js 14 and open sourcing everything.
          Follow along as we figure this out together.
        </p>
        <div className="space-x-4">
          <Link href="/auth/login">
            <Button size="lg">Get Started</Button>
          </Link>
          <Link href={siteConfig.links.github} target="_blank" rel="noreferrer">
            <Button variant="outline" size="lg">
              GitHub
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
