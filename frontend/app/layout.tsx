import type { Metadata } from 'next'
import './globals.css'
import { GlobalErrorBoundary } from '@/components/GlobalErrorBoundary'

export const metadata: Metadata = {
  title: 'Northstar - Get 1,000 customers without writing a word',
  description: 'Passive SEO & Lead Magnet Engine. Automate user acquisition with programmatic SEO articles and smart lead magnets.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <GlobalErrorBoundary>
          {children}
        </GlobalErrorBoundary>
      </body>
    </html>
  )
}
