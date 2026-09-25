import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: 'NyayaSETU',
  description: 'Evidence-grounded, multi-agent legal/regulatory compliance audit workspace',
}

import SmoothScroll from '@/components/ui/SmoothScroll'
import CursorGlow from '@/components/ui/CursorGlow'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={cn("dark", "font-sans", inter.variable)}>
      <body className={inter.className}>
        <SmoothScroll>
          <CursorGlow />
          {children}
        </SmoothScroll>
      </body>
    </html>
  )
}
