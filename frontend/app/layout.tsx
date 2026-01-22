import type { Metadata } from 'next'
import './globals.css'

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
      <body>{children}</body>
    </html>
  )
}
