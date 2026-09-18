'use client';

import { useState } from 'react';
import { Check, ShoppingCart } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useCartContext } from '../context/cart-provider';

interface QuickAddButtonProps {
  productId?: string;
  name: string;
  unitPriceCents?: number;
  /** Produit épuisé / indisponible : bouton désactivé. */
  disabled?: boolean;
  /** Texte optionnel à côté de l'icône (sinon bouton icône seul). */
  label?: string;
  className?: string;
  size?: 'sm' | 'icon';
  variant?: 'default' | 'outline';
}

/**
 * Ajout rapide au panier depuis une carte produit. Comme la carte est un lien
 * vers la fiche détail, on stoppe la propagation pour ne pas déclencher la
 * navigation. Sans contexte panier (aperçu builder) ou sans prix/id, le bouton
 * reste visible mais inactif.
 */
export function QuickAddButton({
  productId,
  name,
  unitPriceCents,
  disabled,
  label,
  className,
  size = 'icon',
  variant = 'default',
}: QuickAddButtonProps) {
  const cart = useCartContext();
  const [justAdded, setJustAdded] = useState(false);

  const canAdd = !!cart && !!productId && typeof unitPriceCents === 'number' && !disabled;

  const handleClick = (e: React.MouseEvent) => {
    // La carte parente est un <Link> : on empêche la navigation vers la fiche.
    e.preventDefault();
    e.stopPropagation();
    if (!canAdd) return;
    cart!.addItem({ productId: productId!, name, unitPriceCents: unitPriceCents!, quantity: 1 });
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1400);
  };

  return (
    <Button
      type="button"
      size={size}
      variant={variant}
      onClick={handleClick}
      disabled={disabled || cart?.isMutating}
      aria-label={label ? undefined : `Ajouter ${name} au panier`}
      title={disabled ? 'Indisponible' : 'Ajouter au panier'}
      className={cn('block-button gap-1.5', className)}
    >
      {justAdded ? (
        <Check className={cn('h-3.5 w-3.5', label && 'shrink-0')} />
      ) : (
        <ShoppingCart className={cn('h-3.5 w-3.5', label && 'shrink-0')} />
      )}
      {label && <span>{justAdded ? 'Ajouté' : label}</span>}
    </Button>
  );
}
