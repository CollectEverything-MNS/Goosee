'use client';

import { HeaderBlock } from '@/components/page-blocks/header-block';
import { FooterBlock } from '@/components/page-blocks/footer-block';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <HeaderBlock context={{ mode: 'front' }} />
      <div className="min-h-screen">{children}</div>
      <FooterBlock />
    </>
  );
}
