'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { ArrowUpCircle, ChevronDown, Loader2, X } from 'lucide-react';
import { useAuth } from '@/providers/auth-provider';
import { useSiteVersion } from './use-site-version';
import { useUpdateSite } from './use-update-site';

// Nettoie un sujet de commit conventionnel pour l'affichage : "feat(front): X" -> "X".
function pretty(msg: string): string {
  return msg.replace(/^\w+(\([^)]*\))?!?:\s*/, '').trim() || msg;
}

// Bannière (sous le header de l'admin) : proposée pour les mises à jour mineures/majeures.
// Les patches s'appliquent en silence via le cron. Affiche le contenu de la mise à jour.
export function UpdateBanner() {
  const { canAccess } = useAuth();
  const { data } = useSiteVersion();
  const update = useUpdateSite();
  const [dismissed, setDismissed] = useState(false);
  const [open, setOpen] = useState(false);

  const proposable = data?.updateType === 'minor' || data?.updateType === 'major';
  if (!proposable || dismissed || !canAccess('settings')) return null;

  const changes = data?.changes ?? [];

  const install = () =>
    update.mutate(undefined, {
      onSuccess: () =>
        toast.success('Mise à jour lancée : le site va redémarrer avec la nouvelle version.'),
      onError: () => toast.error("La mise à jour n'a pas pu être lancée."),
    });

  return (
    <div className="border-b border-amber-200 bg-amber-50 text-amber-900">
      <div className="flex items-center gap-3 px-6 py-2.5 text-sm">
        <ArrowUpCircle className="h-4 w-4 shrink-0" />
        <span className="flex-1">
          Une mise à jour est disponible (version {data.latest}). Voulez-vous l&apos;installer&nbsp;?
        </span>
        {changes.length > 0 && (
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-amber-800 hover:bg-amber-100"
          >
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`}
            />
            {open ? 'Masquer' : `Voir les changements (${changes.length})`}
          </button>
        )}
        <button
          type="button"
          onClick={install}
          disabled={update.isPending}
          className="inline-flex items-center gap-1.5 rounded-md bg-amber-600 px-3 py-1 text-xs font-semibold text-white hover:bg-amber-700 disabled:opacity-60"
        >
          {update.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          {update.isPending ? 'Installation…' : 'Installer'}
        </button>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="text-amber-700 hover:text-amber-900"
          aria-label="Fermer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {open && changes.length > 0 && (
        <ul className="list-disc space-y-1 border-t border-amber-200/70 px-10 py-3 text-xs text-amber-800">
          {changes.map((c, i) => (
            <li key={i}>{pretty(c)}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
