'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { HeaderBlock } from '@/components/page-blocks/header-block';
import { FooterBlock } from '@/components/page-blocks/footer-block';
import { SiteThemeProvider } from '@/providers/site-theme-provider';
import { CartProvider } from '@/features/cart/context/cart-provider';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const mainRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    mainRef.current?.focus();
  }, [pathname]);

  return (
    <SiteThemeProvider>
      <CartProvider>
        <a
          href="#contenu-principal"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[60] focus:bg-white focus:text-black focus:p-2 focus:rounded"
        >
          Aller au contenu principal
        </a>
        <HeaderBlock context={{ mode: 'front' }} />
        <div id="contenu-principal" ref={mainRef} tabIndex={-1} className="min-h-screen">
          {children}
        </div>
        <FooterBlock />
      </CartProvider>
    </SiteThemeProvider>
  );
}
