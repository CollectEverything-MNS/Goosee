import { ClientProvider } from '@/providers/client-provider'
import type { Metadata } from 'next'
import React from 'react'
import './globals.css'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale } from 'next-intl/server'

export const metadata: Metadata = {
  title: 'Goosee - App',
  description: 'develop',
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale()
  return (
    <html lang={locale} suppressHydrationWarning>
      <body>
        <NextIntlClientProvider>
          <ClientProvider>{children}</ClientProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
