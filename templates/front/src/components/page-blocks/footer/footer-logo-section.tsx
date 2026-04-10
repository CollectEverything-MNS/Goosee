'use client';

interface FooterLogoSectionProps {
  logoSrc?: string;
  siteName: string;
}

export function FooterLogoSection({ logoSrc, siteName }: FooterLogoSectionProps) {
  return (
    <div className="space-y-3">
      {logoSrc ? (
        <img src={logoSrc} alt={siteName} className="h-8 w-auto object-contain" />
      ) : (
        <span className="text-lg font-bold text-white">{siteName}</span>
      )}
      <p className="text-sm text-gray-400">
        Vos courses en ligne, simples et rapides.
      </p>
    </div>
  );
}
