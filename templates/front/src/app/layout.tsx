import { ClientProvider } from '@/providers/client-provider'
import type { Metadata } from 'next'
import React from 'react'
import './globals.css'
import { NextIntlClientProvider } from 'next-intl'

export const metadata: Metadata = {
  title: 'Goosee - App',
  description: 'develop',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body>
        <NextIntlClientProvider>
          <ClientProvider>{children}</ClientProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
