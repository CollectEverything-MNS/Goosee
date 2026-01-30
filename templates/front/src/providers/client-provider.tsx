'use client';

import { PropsWithChildren, useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { queryClient } from '@/lib/react-query';
import { useSettings } from '@/features/personnalisation/settings/usecases/use-get-settings';

function DynamicFavicon() {
  const { data: settings } = useSettings();

  useEffect(() => {
    const faviconUrl = settings?.faviconUrl;
    let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    if (faviconUrl) {
      const separator = faviconUrl.includes('?') ? '&' : '?';
      link.href = `${faviconUrl}${separator}v=${Date.now()}`;
    } else {
      link.href = '/favicon.ico';
    }
  }, [settings?.faviconUrl]);

  return null;
}

export const ClientProvider = ({ children }: PropsWithChildren) => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <DynamicFavicon />
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  );
};
