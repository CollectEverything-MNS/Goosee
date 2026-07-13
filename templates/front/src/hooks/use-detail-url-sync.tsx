'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

interface Options<T> {
  /** Liste chargée côté client dans laquelle retrouver l'entité par son id. */
  items: T[];
  /** Type de modale actuellement ouverte dans le provider ('detail' | 'edit' | ...). */
  open: string | null;
  currentRow: T | null;
  setCurrentRow: (row: T | null) => void;
  /** setOpen du provider (toggle) — typage volontairement souple (union de dialogues variable). */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setOpen: (value: any) => void;
  /** Type de modale à ouvrir pour un deep-link ('detail' pour les commandes, 'edit' sinon). */
  dialog: string;
  /** Nom du paramètre d'URL. */
  param?: string;
  getId?: (item: T) => string;
}

/**
 * Synchronise une modale de détail avec un paramètre d'URL (ex. ?detailId=...).
 *
 * - À l'arrivée sur l'URL (depuis la recherche globale), ouvre la modale de l'entité.
 * - Conserve le paramètre tant que la modale est ouverte (URL partageable / deep-link).
 * - Nettoie l'URL à la fermeture de la modale.
 *
 * Les listes admin étant chargées intégralement côté client, on retrouve l'entité
 * directement dans `items` sans requête supplémentaire.
 */
export function useDetailUrlSync<T extends { id: string }>({
  items,
  open,
  currentRow,
  setCurrentRow,
  setOpen,
  dialog,
  param = 'detailId',
  getId = (item) => item.id,
}: Options<T>) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const id = searchParams.get(param);
  const prevOpenRef = useRef(open);

  // URL -> ouverture de la modale.
  useEffect(() => {
    if (!id) return;
    if (open === dialog && currentRow && getId(currentRow) === id) return;
    const row = items.find((item) => getId(item) === id);
    if (row) {
      setCurrentRow(row);
      if (open !== dialog) setOpen(dialog);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, items]);

  // Fermeture de la modale -> nettoyage du paramètre d'URL.
  useEffect(() => {
    const wasOpen = prevOpenRef.current === dialog;
    prevOpenRef.current = open;
    if (id && wasOpen && open !== dialog) {
      const next = new URLSearchParams(searchParams.toString());
      next.delete(param);
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
}
