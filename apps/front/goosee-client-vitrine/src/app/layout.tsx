import { ClientProvider } from '@/providers/client-provider';
import type { Metadata } from 'next';
import React from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: 'Goosee - App',
  description:
    'develop',
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body>
        <ClientProvider>
        {children}
        </ClientProvider>
      </body>
    </html>
  );
}
