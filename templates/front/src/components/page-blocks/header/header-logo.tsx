'use client';

import Link from 'next/link';

interface HeaderLogoProps {
  logoSrc?: string;
  siteName: string;
  textColor?: string;
  className?: string;
}

export function HeaderLogo({ logoSrc, siteName, textColor, className }: HeaderLogoProps) {
  return (
    <Link href="/" className={className ?? 'flex shrink-0 items-center'}>
      {logoSrc ? (
        <img src={logoSrc} alt={siteName} className="h-8 w-auto object-contain" />
      ) : (
        <span className="text-xl font-bold" style={{ color: textColor }}>
          {siteName}
        </span>
      )}
    </Link>
  );
}
