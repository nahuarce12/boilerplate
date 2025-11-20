import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Laptop, Lock, Rocket, Zap } from "lucide-react"

const features = [
  {
    title: "Next.js 14",
    description:
      "App Router, Server Actions, and the latest Next.js features ready to go.",
    icon: Rocket,
  },
  {
    title: "React 18",
    description:
      "Server and Client Components, Hooks, and the latest React features.",
    icon: Laptop,
  },
  {
    title: "Database",
    description:
      "ORM using Prisma and deployed on PlanetScale. Authentication with NextAuth.js.",
    icon: Zap,
  },
  {
    title: "Components",
    description:
      "UI components built using Radix UI and styled with Tailwind CSS.",
    icon: Lock,
  },
]

export function Features() {
  return (
    <section
      id="features"
      className="container space-y-6 bg-slate-50 py-8 dark:bg-transparent md:py-12 lg:py-24"
    >
      <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
        <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-6xl">
          Features
        </h2>
        <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
          This project is an experiment to see how a modern app, with features like auth, subscriptions, API routes, and static pages would work in Next.js 14 app dir.
        </p>
      </div>
      <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-2">
        {features.map((feature) => (
          <Card key={feature.title}>
            <CardHeader>
              <feature.icon className="h-10 w-10" />
              <CardTitle>{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>{feature.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
