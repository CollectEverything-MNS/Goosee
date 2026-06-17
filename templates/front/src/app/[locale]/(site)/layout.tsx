'use client';

import { HeaderBlock } from '@/components/page-blocks/header-block';
import { FooterBlock } from '@/components/page-blocks/footer-block';
import { SiteThemeProvider } from '@/providers/site-theme-provider';
import { CartProvider } from '@/features/cart/context/cart-provider';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <SiteThemeProvider>
      <CartProvider>
        <HeaderBlock context={{ mode: 'front' }} />
        <div className="min-h-screen">{children}</div>
        <FooterBlock />
      </CartProvider>
    </SiteThemeProvider>
  );
}
