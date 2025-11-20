/**
 * Site configuration
 * Global metadata and configuration for the application
 */

export const siteConfig = {
  name: 'SaaS Boilerplate',
  description:
    'A modern SaaS boilerplate built with Next.js, Supabase, and Polar',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  ogImage: '/og-image.png',
  links: {
    twitter: 'https://twitter.com/yourusername',
    github: 'https://github.com/yourusername/saas-boilerplate',
  },
  creator: {
    name: 'Your Name',
    twitter: '@yourusername',
  },
}

export type SiteConfig = typeof siteConfig
